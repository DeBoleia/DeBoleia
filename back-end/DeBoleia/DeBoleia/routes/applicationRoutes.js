const express = require('express');
const applicationController = require('../controllers/applicationController');
const router = express.Router();
const verifyToken = require('../middleware/middleware');

// ================================ POST ================================
router.post('/',/*  verifyToken, */ applicationController.createApplication);// <==== UC10

// ================================ GET ================================
router.get('/user/:userID',/*  verifyToken, */ applicationController.getApplicationByUserID); // <==== UC19
router.get('/user/:userID/status/:status',/*  verifyToken, */ applicationController.getApplicationByUserByStatus);
router.get('/tripCode/:tripCode/status/:status',/*  verifyToken, */ applicationController.getApplicationByTripByStatus); // <==== UC12 ---> ONLY USED BY DRIVER
router.get('/applicationCode/:applicationCode',/*  verifyToken, */ applicationController.getApplicationByApplicationCode); 
router.get('/trip/:tripCode',/*  verifyToken, */ applicationController.getApplicationByTripCode);


// ================================ PATCH ================================
router.patch('/reject/applicationCode/:applicationCode',/*  verifyToken, */ applicationController.rejectApplication); // <==== UC15 -----> ONLY USED BY DRIVER
router.patch('/cancel/applicationCode/:applicationCode',/*  verifyToken, */ applicationController.cancelApplication); // <==== ----> ONLY USED BY THE PASSENGER

module.exports = router;