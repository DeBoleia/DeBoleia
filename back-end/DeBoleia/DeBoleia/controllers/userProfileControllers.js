const mongoose = require('mongoose');
const UserProfileModels = require('../models/userProfileModels');
const UserProfileInputDTO = require('../DTO/userProfileInputDTO');
const UserProfileOutputDTO = require('../DTO/userProfileOutputDTO');
const sqlite3 = require('sqlite3').verbose();
const deboleia_users = new sqlite3.Database('./DB/deboleia_users.db');
const bcrypt = require('bcrypt');

// ======================== GET ======================== //

// Get all users
// router.get("/", verifyToken, userProfileController.getAllUsers);
exports.getAllUsers = async function (req, res) {
	try {
		const users = await UserProfileModels.find();
		const userDTOs = await Promise.all(users.map(user => UserProfileOutputDTO.fromUser(user)));
		res.status(200).json(userDTOs);
	} catch (err) {
		console.error('Erro ao obter utilizadores:', err.message);
		res.status(500).json({ error: 'Error getting users', details: err.message });
	}
};

// Get user (by its userID)
// router.get("id/:id", verifyToken, userProfileController.getUserByuserID );

exports.getUserByUserID = async function (req, res) {
	const { userID } = req.params;
	try {
		const user = await UserProfileModels.findOne({ userID: userID });
		console.log("Utilizador encontrado na base de dados:", user);

		if (!user) {
			return res.status(404).json({ error: "User not found." });
		}

		const userDTO = await UserProfileOutputDTO.fromUser(user);
		console.log("DTO Final enviado ao cliente:", userDTO);
		res.status(200).json(userDTO);

	} catch (err) {
		console.error("Error fetching user by userID:", err.message);
		res.status(500).json({ error: "Error fetching user", details: err.message });
	}
};


// exports.getUserByUserID = async function (req, res) {
// 	const { userID } = req.params;
// 	try {
// 		const user = await UserProfileModels.findOne({ userID: userID });
// 		if (!user) {
// 			return res.status(404).json({ error: "User not found." });
// 		}
// 		const userDTO = UserProfileOutputDTO.fromUser(user);
// 		res.status(200).json(userDTO);
// 	} catch (err) {
// 		console.error("Error fetching user by userID:", err.message);
// 		res.status(500).json({ error: "Error fetching user", details: err.message });
// 	}
// };

// Get user (by its email)
// router.get("/email/:email", verifyToken, userProfileController.getUserByEmail );
exports.getUserByEmail = async function (req, res) {
	const { email } = req.params;
	try {
		const user = await UserProfileModels.findOne({ email: email });
		if (!user) {
			return res.status(404).json({ error: "User not found." });
		}
		const userDTO = await UserProfileOutputDTO.fromUser(user);
		return res.status(200).json(userDTO);
	} catch (err) {
		console.error("Erro ao buscar utilizador por email:", err.message);
		return res.status(500).json({ error: "Error fetching user", details: err.message });
	}
};

// Get user by token
// router.get("/byToken", verifyToken,  userProfileControllergetUserByToken);
exports.getUserByToken = async (req, res) => {
	try {
		const userID = req.user.userID;
		console.log('UserID do token:', userID);
		const user = await UserProfileModels.findOne({ userID: userID });
		if (!user) {
			console.log('User not found in DB');
			return res.status(404).json({ error: "User not found" });
		}
		const userData = {
			userID: user.userID,
			name: user.name,
			email: user.email,
			role: user.role,
			phoneNumber: user.phoneNumber,
			NIF: user.NIF,
			status: user.status,
			birthDate: user.birthDate,
			driverRating: user.driverRating,
			driverRatingCount: user.driverRatingCount,
			passengerRating: user.passengerRating,
			passengerRatingCount: user.passengerRatingCount,
			driversLicense: user.driversLicense,
			cars: user.cars ? [...user.cars] : [],
	  	};
	  	return res.status(200).json({
			message: "Success, getUserByToken",
			data: userData,
	  	});
		} catch (err) {
	  		console.log('Error in getUserByToken:', err.message);
	  		return res.status(500).json({
			error: "Error getUserByToken: " + err.message,
	  });
	}
};

// Get user for driver
// router.get("/passenger/:userID", verifyToken, userProfileController.getUserForDriver);
exports.getUserForDriver = async function (req, res) {
	try {
		console.log("===> [Controller] Token recebido:", req.user);
		if (!req.user) {
			console.log("Erro: Token não fornecido ou inválido.");
			return res.status(401).json({ error: 'Unauthorized: Token not provided or invalid.' });
		}

		// Verifica se o utilizador que faz o pedido tem licensePlate
		const requestingUser = await UserProfileModels.findOne({ userID: req.user.userID });
		console.log("===> [Controller] Utilizador que fez o pedido:", requestingUser);
		if (!requestingUser) {
			console.log("Erro: Utilizador autenticado não encontrado.");
			return res.status(404).json({ error: 'Authenticated user not found.' });
		}
		if (!requestingUser.driversLicense) {
			console.log("Erro: Utilizador autenticado não tem licensePlate.");
			return res.status(403).json({ error: 'Access denied: Only users with a license plate can access this information.' });
		}

		// Buscar o utilizador solicitado
		const { userID } = req.params;
		console.log("===> [Controller] UserID solicitado:", userID);
		const user = await UserProfileModels.findOne({ userID: userID });
		console.log("===> [Controller] Utilizador solicitado encontrado:", user);
		if (!user) {
			console.log("Erro: Utilizador solicitado não encontrado.");
			return res.status(404).json({ error: "User not found." });
		}

		// Retornar apenas os dados restritos
		const restrictedUserData = {
			name: user.name,
			phoneNumber: user.phoneNumber,
			passengerRating: user.passengerRating,
			passengerRatingCount: user.passengerRatingCount
		};
		console.log("===> [Controller] Dados a serem retornados:", restrictedUserData);
		
		return res.status(200).json(restrictedUserData);

	} catch (err) {
		console.error("===> [Controller] Erro ao buscar os dados:", err.message);
		res.status(500).json({ error: "Error fetching user for driver", details: err.message });
	}
};

// ======================== PUT ======================== //

// Update user by userID
// router.put("/id/:userID", verifyToken, userProfileController.updateUserByUserID);
exports.updateUserByUserID = async function (req, res) {
	const { userID } = req.params;
	const updateData = req.body;
	try {
		if (updateData.phonenumber) {
			updateData.phoneNumber = updateData.phonenumber;
			delete updateData.phonenumber;
		}
		if (updateData.birthDate) {
			const birthDate = new Date(updateData.birthDate);
			if (isNaN(birthDate.getTime())) {
				return res.status(400).json({ error: "Invalid birthDate format." });
			}
			updateData.birthDate = birthDate;
		}
		const user = await UserProfileModels.findOne({ userID: userID });
		if (!user) {
			return res.status(404).json({ error: "User not found." });
		}
		user.set(updateData);
		const validationError = user.validateSync();
		if (validationError) {
			return res.status(400).json({
				error: "Validation failed",
				details: validationError.errors,
			});
		}
		const updatedUser = await user.save();
		const userDTO = await UserProfileOutputDTO.fromUser(updatedUser);
		return res.status(200).json(userDTO);
	} catch (err) {
		console.error("Erro ao atualizar utilizador por userID:", err.message);
		return res.status(500).json({ error: "Error updating user", details: err.message });
	}
};

// Update user by email
// router.put("/email/:email", verifyToken, userProfileController.updateUserByEmail);
exports.updateUserByEmail = async function (req, res) {
	const { email } = req.params;
	const updateData = req.body;
	try {
		console.log("Dados recebidos para atualização:", updateData);
		if (updateData.phonenumber) {
			updateData.phoneNumber = updateData.phonenumber;
			delete updateData.phonenumber;
		}
		if (updateData.birthDate) {
			const birthDate = new Date(updateData.birthDate);
			if (isNaN(birthDate.getTime())) {
				return res.status(400).json({ error: "Invalid birthDate format." });
			}
			updateData.birthDate = birthDate;
		}
		const user = await UserProfileModels.findOne({ email: email });
		if (!user) {
			return res.status(404).json({ error: "User not found." });
		}
		user.set(updateData);
		const validationError = user.validateSync();
		if (validationError) {
			return res.status(400).json({
				error: "Validation failed",
				details: validationError.errors,
			});
		}
		const updatedUser = await user.save();
		const userDTO = await UserProfileOutputDTO.fromUser(updatedUser);
		return res.status(200).json(userDTO);
	} catch (err) {
		console.error("Erro ao atualizar utilizador por email:", err.message);
		return res.status(500).json({ error: "Error updating user", details: err.message });
	}
};

// ======================== DELETE ======================== //

// Delete user by userID
// router.delete("/id/:userID", verifyToken, userProfileController.deleteUser);
exports.deleteUser = async function (req, res) {
	const { userID } = req.params;
	try {
		const userMongo = await UserProfileModels.findOne({ userID: userID });
		if (!userMongo) {
			return res.status(404).json({ error: "User not found in MongoDB." });
		}
		await UserProfileModels.deleteOne({ userID: userID });
		deboleia_users.run(
			"DELETE FROM users WHERE userID = ?",
			[userID],
			function (err) {
				if (err) {
					console.error("Error deleting user from SQL:", err.message);
					return res.status(500).json({ error: "Error deleting user from SQL." });
				}
				res.status(200).json({ message: "User deleted successfully from MongoDB and SQL." });
			}
		);
	} catch (err) {
		console.error("Error deleting user by userID:", err.message);
		res.status(500).json({ error: "Error deleting user", details: err.message });
	}
};

// /-----------------------------------------------------------------\
// |======================= HELPER FUNCTIONS ========================|
// \-----------------------------------------------------------------/

exports.rateDriver = async function (req, res) {
	const { userID } = req.params;
	const { rating } = req.body;
	const { evaluatorID } = req.body;

	try {
		console.log(`PATCH: /api/user/ratedriver/${userID} - Updating ${userID} rating`);

		const user = await UserProfileModels.findOne({ userID: userID });

		if (!user) {
			console.log(`User not found: ${userID}`);
			return res.status(404).json({ error: 'User not found.' });
		}

		const result = calculateNewRating(user.driverRating, user.driverRatingCount, rating);
		const newAverage = result.newAverage;
		const newCount = result.newCount;

		const updatedUser = await UserProfileModels.findOneAndUpdate(
			{ userID: userID },
			{
				driverRating: newAverage,
				driverRatingCount: newCount
			},
			{ new: true, runValidators: true }
		);
		const evaluator = await UserProfileModels.findOneAndUpdate(
			{ userID: evaluatorID },
			{ $pull: { pendingDriverEvaluation: userID } },
			{ new: true }
		);

		if (!evaluator) {
			return res.status(404).json({ error: `Evaluator with userID ${evaluatorID} not found.` });
		}

		console.log('After update:', {
			userID,
			newDriverRating: updatedUser.driverRating,
			newCount: updatedUser.driverRatingCount
		});

		res.status(200).json(updatedUser);

	} catch (error) {
		console.error(`Error updating user ${userID}:`, error.message);
		res.status(500).json({ error: 'Error: could not rate the driver' });
	}
};

// Rate passengers
exports.ratePassengers = async function (req, res) {
	const { ratings } = req.body;

	try {
		const updateResults = [];
		const errors = [];

		for (const { userID, rating } of ratings) {
			try {
				const user = await UserProfileModels.findOne({ userID: userID });

				if (!user) {
					errors.push({ userID, error: 'User not found' });
					continue;
				}

				const result = calculateNewRating(user.passengerRating, user.passengerRatingCount, rating);
				const newAverage = result.newAverage;
				const newCount = result.newCount;

				const updatedUser = await UserProfileModels.findOneAndUpdate(
					{ userID: userID },
					{
						passengerRating: newAverage,
						passengerRatingCount: newCount
					},
					{ new: true, runValidators: true }
				);

				updateResults.push({
					userID,
					newRating: newAverage,
					totalRatings: newCount
				});

			} catch (error) {
				errors.push({ userID, error: error.message });
			}
		}

		res.status(200).json({
			success: updateResults,
			errors: errors.length > 0 ? errors : undefined
		});

	} catch (error) {
		console.error(`Error while rating passengers:`, error.message);
		res.status(500).json({ error: 'An error occurred while rating the passengers' });
	}
};

exports.rateOnePassenger = async function (req, res) {
	const { userID, rating, evaluatorID } = req.body; // Incluímos evaluatorID no corpo da requisição
	console.log('rating passenger:', userID, rating, evaluatorID);

	try {
		if (!userID || rating === undefined || !evaluatorID) {
			return res.status(400).json({ error: 'userID, evaluatorID, and rating are required.' });
		}

		const user = await UserProfileModels.findOne({ userID });
		if (!user) {
			return res.status(404).json({ error: `User with userID ${userID} not found.` });
		}

		const result = calculateNewRating(user.passengerRating, user.passengerRatingCount, rating);
		const newAverage = result.newAverage;
		const newCount = result.newCount;

		const updatedUser = await UserProfileModels.findOneAndUpdate(
			{ userID },
			{
				passengerRating: newAverage,
				passengerRatingCount: newCount,
			},
			{ new: true, runValidators: true }
		);

		const evaluator = await UserProfileModels.findOneAndUpdate(
			{ userID: evaluatorID },
			{ $pull: { pendingPassengerEvaluation: userID } },
			{ new: true }
		);

		if (!evaluator) {
			return res.status(404).json({ error: `Evaluator with userID ${evaluatorID} not found.` });
		}

		// Responde com sucesso
		res.status(200).json({
			success: true,
			message: `Passenger ${userID} successfully rated.`,
			updatedUser: {
				userID: updatedUser.userID,
				newRating: updatedUser.passengerRating,
				totalRatings: updatedUser.passengerRatingCount,
			},
			evaluator: {
				userID: evaluator.userID,
				pendingPassengerEvaluation: evaluator.pendingPassengerEvaluation, // Array atualizado
			},
		});

	} catch (error) {
		console.error(`Error while rating passenger:`, error.message);
		res.status(500).json({ error: 'An error occurred while rating the passenger.' });
	}
};
 

// Helper function to calculate new ratings for drivers and passengers
const calculateNewRating = (currentRating, currentCount, newRating) => {
	const currentTotal = currentRating * currentCount;
	const newTotal = currentTotal + (+newRating);
	const newCount = currentCount + 1;
	const newAverage = newTotal / newCount;

	return {
		newAverage,
		newCount
	};
};

// Change user status by userID (SQLite e MongoDB)
// router.put('/status/:userID', verifyToken, authenticationController.aproveUserByEmail);
exports.changeStatusByEmail = async function (req, res) {
	try {
		const email = req.params.email;
		console.log("Email recebido:", email);
		deboleia_users.get(
			"SELECT * FROM users WHERE email = ?",
			[email],
			async (err, user) => {
				if (err) {
					return res.status(500).json({ error: "Error fetching user from SQLite.", details: err.message });
				}
				if (!user) {
					return res.status(404).json({ message: `No user found with email: ${email}` });
				}
				const newStatus = user.status === "active" ? "inactive" : "active";
				try {
					const userMongo = await UserProfileModels.findOne({ email: email });
					if (userMongo) {
						userMongo.status = newStatus;
						await userMongo.save();
					} else {
						res.status(404).json({ message: `User not found in MongoDB for email: ${email}` });
					}
				} catch (mongoErr) {
					return res.status(500).json({ error: "Error updating user status in MongoDB.", details: mongoErr.message });
				}
				deboleia_users.run(
					"UPDATE users SET status = ? WHERE email = ?",
					[newStatus, email],
					function (updateErr) {
						if (updateErr) {
							return res.status(500).json({ error: "Error updating user status in SQLite.", details: updateErr.message });
						}
						res.status(200).json({ message: `User status successfully updated in both DB to: ${newStatus}` });
					}
				);
			}
		);
	} catch (err) {
		res.status(500).json({ error: "Error approving user.", details: err.message });
	}
};

// Change user password by userID (only SQLite)
// router.put("/pass/:userID", verifyToken, userProfileController.changePasswordByUserID);
exports.changePasswordByUserID = async function (req, res) {
	const { userID } = req.params;
	const { oldPassword, newPassword, confirmPassword } = req.body;

	try {
		deboleia_users.get(
			"SELECT * FROM users WHERE userID = ?",
			[userID],
			async (err, user) => {
				if (err) {
					console.error("Error fetching user from the database:", err.message);
					return res.status(500).json({ error: "Error fetching user from database." });
				}
				if (!user) {
					return res.status(404).json({ error: "User not found." });
				}
				const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
				if (!isPasswordValid) {
					return res.status(401).json({ error: "Old password is incorrect." });
				}
				if (newPassword !== confirmPassword) {
					return res.status(400).json({ error: "New passwords do not match." });
				}
				const salt = await bcrypt.genSalt(10);
				const hashedPassword = await bcrypt.hash(newPassword, salt);
				deboleia_users.run(
					"UPDATE users SET password = ? WHERE userID = ?",
					[hashedPassword, userID],
					function (updateErr) {
						if (updateErr) {
							console.error("Error updating password:", updateErr.message);
							return res.status(500).json({ error: "Error updating password." });
						}
						res.status(200).json({ message: "Password changed successfully." });
					}
				);
			}
		);
	} catch (err) {
		console.error("Error changing password:", err.message);
		res.status(500).json({ error: "Error changing password.", details: err.message });
	}
};

// Get passenger info for drive by receving in the body an array of userIDs
// router.get("/passenger", verifyToken, userProfileController.getPassengersInfo);
exports.getPassengersInfo = async (req, res) => {
	try {
		const { userIDs } = req.body;

		if (!Array.isArray(userIDs) || userIDs.length === 0) {
			return res.status(400).json({ error: "A valid array of userIDs must be provided in the request body" });
		}

		const users = await UserProfileModels.find(
			{ userID: { $in: userIDs } }, 
			{ userID: 1, phoneNumber: 1, passengerRating: 1, passengerRatingCount:1, _id: 0 }
		);

		if (users.length === 0) {
			return res.status(404).json({ error: "No users found for the provided IDs" });
		}

		return res.status(200).json({
			message: "Success, passengers retrieved",
			data: users
		});
	} catch (err) {
		console.error('Error in getPassengersInfo:', err.message);
		return res.status(500).json({
			error: "Error retrieving passengers: " + err.message,
		});
	}
};

// exports.getPassengersInfoByTripCode = async (req, res) => {
//     try {
//         const { tripCode } = req.params;  // Receber o tripCode da URL

//         // Obter o array de userIDs a partir do tripCode (presumindo que a informação do tripCode contém o array de userIDs)
//         const tripInfo = await TripModel.findOne({ tripCode });  // Substitua TripModel pelo modelo correto

//         // Verificar se a viagem existe e contém userIDs
//         if (!tripInfo || !Array.isArray(tripInfo.userIDs) || tripInfo.userIDs.length === 0) {
//             return res.status(404).json({ error: "No passengers found for the provided tripCode" });
//         }

//         // Buscar informações dos passageiros com base nos userIDs
//         const users = await UserProfileModels.find(
//             { userID: { $in: tripInfo.userIDs } }, 
//             { userID: 1, phoneNumber: 1, passengerRating: 1, passengerRatingCount: 1, _id: 0 }
//         );

//         // Se nenhum passageiro for encontrado
//         if (users.length === 0) {
//             return res.status(404).json({ error: "No users found for the provided tripCode" });
//         }

//         // Retornar os dados dos passageiros
//         return res.status(200).json({
//             message: "Success, passengers retrieved",
//             data: users
//         });
//     } catch (err) {
//         console.error('Error in getPassengersInfoByTripCode:', err.message);
//         return res.status(500).json({
//             error: "Error retrieving passengers: " + err.message,
//         });
//     }
// };