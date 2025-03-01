const axios = require('axios');
const UserProfileModels = require('../models/userProfileModels');
const CarDTO = require('../DTO/cars.DTO');
const externalCarAPI = ('http://cars_be:8083/api') + '/cars';

// Fetch all car brands from the external API
async function getCarBrands() {
	try {
		const response = await axios.get(externalCarAPI, {
			headers: {
				Authorization: `Bearer test`
			}
		});
		return [...new Set(response.data.map(car => car.brand))];
	} catch (error) {
		console.error('Error fetching car brands:', error.message);
		return [];
	}
}

// Fetch all car models for a specific brand from the external API
async function getCarModelsByBrand(brand) {
	try {
		const response = await axios.get(externalCarAPI);
		return response.data.filter(car => car.brand === brand).map(car => car.model.trim());
	} catch (error) {
		console.error(`Error fetching car models for brand ${brand}:`, error.message);
		return [];
	}
}

// Update a car for a specific user
exports.updateCar = async function (req, res) {
	const { userID } = req.params;
	const { brand, model, color, licensePlate } = req.body;

	const { error } = CarDTO.validate({ brand, model, color, licensePlate });
	if (error) {
		return res.status(400).json({ error: error.details[0].message });
	}

	try {
		const user = await UserProfileModels.findOne({ userID: userID });
		if (!user) {
			return res.status(404).json({ error: "User not found." });
		}
		const carIndex = user.cars.findIndex(car => car.licensePlate === licensePlate);
		if (carIndex === -1) {
			return res.status(400).json({ error: "Car with this license plate not found." });
		}
		const brands = await getCarBrands();
		if (!brands.includes(brand)) {
			return res.status(400).json({ error: "Invalid brand selected." });
		}
		const models = await getCarModelsByBrand(brand);
		if (!models.includes(model)) {
			return res.status(400).json({ error: "Invalid model selected." });
		}
		user.cars[carIndex].brand = brand;
		user.cars[carIndex].model = model;
		user.cars[carIndex].color = color;
		user.cars[carIndex].licensePlate = licensePlate;
		await user.save();
		res.status(200).json({
			message: "Car updated successfully",
			updatedCar: user.cars[carIndex]
		});
	} catch (err) {
		res.status(500).json({ error: "Error updating car", details: err.message });
	}
};

// delete all cars from a specific user
exports.deleteCars = async function (req, res) {
	const { userID } = req.params;
	try {
		const user = await UserProfileModels.findOne({ userID: userID });
		if (!user) {
			return res.status(404).json({ error: "User not found." });
		}
		user.cars = [];
		await user.save();
		res.status(200).json({
			message: "All cars deleted successfully"
		});
	} catch (err) {
		console.error("Erro ao deletar carros:", err.message);
		res.status(500).json({ error: "Error deleting cars", details: err.message });
	}
};

// Delete a specific car by license plate for a given user
exports.deleteCarsByLicensePlate = async function (req, res) {
	const { userID, licensePlate } = req.params;
	try {
		const user = await UserProfileModels.findOne({ userID: userID });
		if (!user) {
			return res.status(404).json({ error: "User not found." });
		}
		const initialCarCount = user.cars.length;
		user.cars = user.cars.filter(car => car.licensePlate !== licensePlate);
		if (user.cars.length === initialCarCount) {
			return res.status(404).json({ error: "Car with the specified license plate not found." });
		}
		await user.save();
		res.status(200).json({
			message: `Car with license plate ${licensePlate} deleted successfully`
		});
	} catch (err) {
		console.error("Error deleting car:", err.message);
		res.status(500).json({ error: "Error deleting car", details: err.message });
	}
};

// Creat a selected car from external API
exports.creatCarInUser = async function (req, res) {
	const { userID } = req.params;
	try {
		// const brands = await getCarBrands();
		// if (brands.length === 0) {
		// 	return res.status(404).json({ error: "No brands found." });
		// }
		const { brand, model, color, licensePlate } = req.body;
		const { error } = CarDTO.validate({ brand, model, color, licensePlate });
		if (error) {
			return res.status(400).json({ error: error.details[0].message });
		}
		// if (!brands.includes(brand)) {
		// 	return res.status(400).json({ error: "Invalid brand selected." });
		// }
		// const models = await getCarModelsByBrand(brand);
		// if (!models.includes(model)) {
		// 	console.log("Modelo inválido selecionado:", model);
		// 	return res.status(400).json({ error: "Invalid model selected." });
		// }
		const user = await UserProfileModels.findOne({ userID: userID });
		if (!user) {
			return res.status(404).json({ error: "User not found." });
		}
		if (user.cars && user.cars.some(car => car.licensePlate === licensePlate)) {
			return res.status(400).json({ error: "Car already selected." });
		}
		const newCar = { brand, model, color, licensePlate };
		console.log("Novo carro a adicionar:", newCar);
		user.cars.push(newCar);
		await user.save();
		console.log("Carro adicionado com sucesso!");
		res.status(200).json({
			message: "Car selected successfully",
			car: newCar
		});
	} catch (err) {
		console.error("Erro ao selecionar carro:", err.message);
		res.status(500).json({ error: "Error selecting car", details: err.message });
	}
};

module.exports = {
	getCarBrands,
	getCarModelsByBrand,
	updateCar: exports.updateCar,
	deleteCars: exports.deleteCars,
	deleteCarsByLicensePlate: exports.deleteCarsByLicensePlate,
	creatCarInUser: exports.creatCarInUser
};