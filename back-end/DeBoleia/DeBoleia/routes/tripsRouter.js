const express = require('express');
const router = express.Router();
const verifyToken = require("../middleware/middleware");//

const tripsController = require('../controllers/tripsController');



// ================================ POST ================================
router.post('/', verifyToken, tripsController.createTrip); // <==== UC06 

// ================================ GET ================================
router.get('/', verifyToken, tripsController.getTrips); // <==== UC08
router.get('/tripCode/:tripCode', verifyToken, tripsController.getTripByTripCode);
router.get('/driver/:userID', verifyToken, tripsController.getTripsByDriver);
router.get('/passenger/:userID', verifyToken, tripsController.getTripsByPassenger);
router.get('/passengers/tripCode/:tripCode', verifyToken, tripsController.getPassengersByTripCode);

// ================================ PUT ================================
router.put('/tripCode/:tripCode/add/:userID', verifyToken, tripsController.addPassengerToTrip); // <==== UC14 -----> ONLY USED BY DRIVER
router.put('/tripCode/:tripCode/remove/:userID', verifyToken, tripsController.removePassengerFromTrip); // <======= -----> ONLY USED BY PASSENGER


// ================================ PATCH ================================
router.patch('/offer/tripCode/:tripCode', verifyToken, tripsController.offerTrip);
router.patch('/start/tripCode/:tripCode', verifyToken, tripsController.startTrip);
router.patch('/end/tripCode/:tripCode', verifyToken, tripsController.endTrip);
router.patch('/finish/tripCode/:tripCode', verifyToken, tripsController.finishTrip);
router.patch('/cancel/tripCode/:tripCode', verifyToken, tripsController.cancelTrip);


// ================================ DELETE ================================
// router.delete('/tripCode/:tripCode', tripsController.deleteTripByTripCode);

module.exports = router;