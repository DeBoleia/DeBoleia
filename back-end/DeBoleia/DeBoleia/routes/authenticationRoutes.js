// Import necessary modules and controllers
const express = require('express');
const router = express.Router();
const authenticationController = require('../controllers/authenticationController');
const verifyToken = require("../middleware/middleware");//

// Routes for user registration and login
router.post('/register', authenticationController.register);
router.post('/login', authenticationController.login);
router.put('/status2/:email', authenticationController.aproveUserByEmail2);

module.exports = router;