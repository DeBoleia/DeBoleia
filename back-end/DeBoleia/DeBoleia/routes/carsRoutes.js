const express = require('express');
const router = express.Router();
const carsController = require('../controllers/carsController');

// Define a GET route to fetch all car brands
router.get('/brands', async (req, res) => {
	try {
		const brands = await carsController.getCarBrands();
		res.json(brands);
	} catch (err) {
		res.status(500).json({ error: "Error fetching car brands", details: err.message });
	}
});

// Define a POST route to fetch car models based on the provided brand
router.post('/models', async (req, res) => {
	const { brand } = req.body;
	try {
		if (!brand) {
			return res.status(400).json({ error: "Brand is required." });
		}
		const models = await carsController.getCarModelsByBrand(brand);
		res.json(models);
	} catch (err) {
		res.status(500).json({ error: "Error fetching car models", details: err.message });
	}
});

// update car by user ID -> checks licencePlace if it does not exist he cant update
router.put('/updateCar/:userID', carsController.updateCar);

// creat a car in user
router.post('/selectCar/:userID', carsController.creatCarInUser);

// delete all users cars
router.delete('/deleteCars/:userID', carsController.deleteCars);

// delete a car by licensePlait in user
router.delete('/deleteCars/:userID/:licensePlate', carsController.deleteCarsByLicensePlate);

module.exports = router;