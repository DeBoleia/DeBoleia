const fs = require('fs');
const jwt = require("jsonwebtoken");
const privateKey = fs.readFileSync('./private/private.key');
const sqlite3 = require("sqlite3");
const mongoose = require("mongoose");
const UserProfile = require("../models/userProfileModels");
const bcrypt = require("bcrypt");

// Open the SQLite database (deboleia_users.db)
const deboleia_users = new sqlite3.Database("./DB/deboleia_users.db", (err) => {
	if (err) {
		console.error("Error opening the database:", err.message);
	} else {
		console.log("Connected to the deboleia_users database.");
	}
});

// Register a new user
exports.register = async function (req, res) {
	try {
		const { email, password, name, phonenumber, phoneNumber } = req.body;
		const phone = phonenumber || phoneNumber;
		if (!email || !name) {
			return res.status(400).json({ error: "Email and Name are required." });
		}

		validateEmail(email);

		// Check for duplicate email in MongoDB
		const existingUserMongo = await UserProfile.findOne({ email: email });
		if (existingUserMongo) {
			return res.status(400).json({ error: "This email address already exists." });
		}

		// Generate userID and hash the password
		const userID = await createUserID(email);
		const hashedPassword = await hashPassword(password);

		// Define user role based on the generated userID prefix
		const role = userID.startsWith("A") ? "admin" : "user";

		// Insert basic user data into SQLite
		deboleia_users.run(
			`INSERT INTO users (userID, email, password, status) VALUES (?, ?, ?, ?)`,
			[userID, email, hashedPassword, "active"],
			async function (err) {
				if (err) {
					console.error("Error saving user in SQLite:", err);
					return res.status(500).json({ error: "Error saving user in SQLite." });
				}

				try {
					// Save additional user data into MongoDB
					const newUser = new UserProfile({
						userID: userID,
						email: email,
						name: name,
						role: role,
						phoneNumber: phone,
						status: "active",
					});

					await newUser.save();
					console.log("User registered successfully in MongoDB with userID:", userID);

					res.status(201).json({ message: "User registered successfully in both databases.", newUser });
				} catch (mongoError) {
					console.error("Error saving user in MongoDB:", mongoError);

					let errorMessage = "Error saving user in MongoDB.";

					// Capture Mongoose validation errors
					if (mongoError.name === "ValidationError") {
						errorMessage = Object.values(mongoError.errors)
							.map((err) => err.message)
							.join(", ");
					}

					res.status(400).json({ error: errorMessage });

					// Rollback: Delete the user from SQLite if MongoDB insertion fails
					if (userID) {
						try {
							await new Promise((resolve, reject) => {
								deboleia_users.run(
									"DELETE FROM users WHERE userID = ?",
									[userID],
									function (err) {
										if (err) reject(err);
										else resolve();
									}
								);
							});
						} catch (err) {
							console.error("Failed to remove user from SQLite:", err);
						}
					}
				}
			}
		);
	} catch (error) {
		res.status(500).json({ error: "Internal Server Error", details: error.message });
	}
};

// User login with email and password
exports.login = async function (req, res) {
	const { email, password } = req.body;
	console.log("Login attempt with email:", email);

	if (!email || !password) {
		console.log("1");
		return res.status(400).json({ error: "Email and password are required." });
	}

	try {
		// Query SQLite for the user
		deboleia_users.get(
			"SELECT * FROM users WHERE email = ?",
			[email],
			async (err, user) => {
				if (err) {
					console.error("Database error:", err.message);
					return res.status(500).json({ error: "Error accessing the database." });
				}

				// Check if the user was found
				if (!user) {
					return res.status(401).json({ error: "Email not found." });
				}
				// Compare provided password with stored hashed password
				const passwordsMatch = await bcrypt.compare(password, user.password);
				if (!passwordsMatch) {
					return res.status(401).json({ error: "Incorrect password." });
				}

				// Check if the account is active
				if (user.status !== "active" && passwordsMatch) {
					return res.status(403).json({ error: "Your account is inactive." });
				}


				// Generate JWT token
				const payload = {
					userID: user.userID,
					email: user.email,
					status: user.status,
					role: user.userID.startsWith('A') ? 'admin' : 'user',
					iss: 'deboleia-be',
					expiresIn: "1000h"
				};

				const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
				console.log("User logged in successfully:", user);
				res.status(200).json({ userToken: token });
			}
		);
	} catch (error) {
		console.error("Error during login process:", error.message);
		res.status(500).json({ error: "Internal server error." });
	}
};

/*
Helper functions
*/

// Validate if the provided email has a correct format
const validateEmail = (email) => {
	if (!email.includes("@")) {
		throw new Error("The email must be a valid email address.");
	}
};

// Generate a unique userID based on the email domain
const createUserID = (email) => {
	return new Promise((resolve, reject) => {
		if (!email || typeof email !== "string") {
			return reject("Invalid email format");
		}

		// 'A' for admins, 'U' for regular users
		const prefix = email.toLowerCase().endsWith("@deboleia.com") ? "A" : "U";

		deboleia_users.get(
			`SELECT COUNT(*) AS count FROM users WHERE userID LIKE ?`,
			[`${prefix}%`],
			(err, row) => {
				if (err) {
					return reject(err);
				}

				const count = row.count + 1;
				const paddedCount = count.toString().padStart(3, "0");
				const newID = `${prefix}${paddedCount}`;

				resolve(newID);
			}
		);
	});
};

// Hash password using bcrypt
const hashPassword = async (password) => {
	const saltRounds = 10;
	return bcrypt.hash(password, saltRounds);
};

// Check if the current user status matches the expected status
const checkUserStatus = (currentStatus, expectedStatus) => {
	return currentStatus === expectedStatus;
};

// Deactivate a user account
exports.deactivateUserbyUserID = async function (req, res) {
	const { userID } = req.params;

	try {
		const user = await fetchByUserID(userID);

		if (!user) {
			return res.status(404).json({
				error: `User with ID ${userID} not found.`,
			});
		}

		if (checkUserStatus(user.status, "inactive")) {
			return res.status(400).json({
				message: `The account for user ${userID} is already inactive.`,
			});
		}

		// Update the user's status in SQLite
		deboleia_users.run(
			"UPDATE users SET status = ? WHERE userID = ?",
			["inactive", userID],
			function (err) {
				if (err) {
					console.error("Database error while changing user status");
					return res.status(500).json({ error: "Error changing user status." });
				}

				res.status(200).json({ message: `User ${userID} has been deactivated.` });
			}
		);
	} catch (error) {
		console.error("Error deactivating user:", error.message);
		res.status(500).json({ error: "Internal Server Error." });
	}
};



exports.aproveUserByEmail2 = async function (req, res) {
	try {
		const email = req.params.email;
		if (!email) {
			return res.status(400).json({ error: 'O email é obrigatório.' });
		}

		const userMongo = await UserProfile.findOne({ email: email });
		if (!userMongo) {
			return res.status(404).json({ message: `Não existe usuário associado ao email: ${email}` });
		}

		// Atualizar status no MongoDB
		userMongo.status = 'active';
		await userMongo.save();

		// Atualizar status na base de dados SQLite
		deboleia_users.run(
			"UPDATE users SET status = ? WHERE email = ?",
			['active', email],
			function (err) {
				if (err) {
					return res.status(500).json({ error: "Erro ao atualizar status na SQLite.", details: err.message });
				}
				
				// Resposta de sucesso se ambas as operações forem bem-sucedidas
				res.status(200).json({ message: `Usuário ativado com sucesso em ambas as bases de dados.` });
			}
		);

	} catch (err) {
		console.error("Erro ao ativar usuário:", err);
		res.status(500).json({ error: 'Erro ao ativar usuário', details: err.message });
	}
};
