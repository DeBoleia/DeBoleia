const applicationModel = require('../models/applicationModel');
const tripsModel = require('../models/tripsModel');
const UserProfile = require('../models/userProfileModels');


// ================================ POST ======================================
// router.post('/', applicationController.createApplication);
exports.createApplication = async function (req, res) {
	console.log('POST: /api/applications: ', req.body);
	try {
		tripCode = req.body.trip;
		userID = req.body.userID;
		const trip = await tripsModel.findOne({ tripCode: tripCode });
		if (!trip || (trip.status != 'inOffer' && trip.status != 'closed')) {
			console.warn('Warning: Trip not found or not available.');
			return res.status(404).json({ message: 'Trip not found or not available.' });
		}
		const existingApplication = await applicationModel.findOne({ trip: tripCode, userID: userID });
		if (existingApplication) {
			console.warn('Warning: Application already exists for this user in this trip.', existingApplication);
			return res.status(409).json({ message: 'Application already exists for this user in this trip.' });
		}
		if (trip.driver === userID) {
			console.warn('Warning: Driver cannot apply to his own trip.');
			return res.status(409).json({ message: 'Driver cannot apply to his own trip.' });
		}
		const application = new applicationModel(req.body);
		application.status = trip.status === 'closed' ? 'waitlist' : 'underReview';
		await application.save();
		return res.status(201).json({ message: 'Application created successfuly.', application });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
}

// ================================ GET ======================================
// router.get('/user/:userID', applicationController.getApplicationByUserID);
exports.getApplicationByUserID = async function (req, res) {
	console.log('GET: /api/applications/user/:userID: ', req.params.userID);
	try {
		const userID = req.params.userID;
		const applications = await applicationModel.find({ userID: userID });
		if (applications.length === 0) {
			console.warn('Warning: No applications found for this user.');
			return res.status(404).json({ message: 'No applications found for this user.' });
		}
		return res.status(200).json(applications);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
}

// router.get('/user/:userID/status/:status', applicationController.getApplicationByUserByStatus);
exports.getApplicationByUserByStatus = async function (req, res) {
	console.log('GET: /api/applications/user/:userID/status/:status: ', req.params.userID, req.params.status);
	try {
		userID = req.params.userID;
		tripStatus = req.params.status;
		const applications = await applicationModel.find({ userID: userID, status: tripStatus });
		if (applications.length === 0) {
			console.warn(`Warning: No applications found for this user ${userID} with this status: ${tripStatus}.`);
			return res.status(404).json({ message: 'No applications found for this user with this status.' });
		}
		return res.status(200).json(applications);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
}

// router.get('/tripCode/:tripCode/status/:status', applicationController.getApplicationByTripByStatus); // <- UC12
exports.getApplicationByTripByStatus = async function (req, res) {
	try {
		console.log(`GET tripCode/:${req.params.tripCode}/status/:${req.params.status}`);
		const { tripCode, status } = req.params;
		const application = await applicationModel.find({ trip: tripCode, status: status });
		if (!application) {
			console.warn(` Warning: Application with tripCode ${tripCode} and status ${status} not found`);
			return res.status(404).json({ message: `Application with tripCode ${tripCode} and status ${status} not found` });
		}
		return res.status(200).json(application);
	} catch (err) {
		console.error(`Error: Error retrieving application with tripCode ${tripCode} and status ${status}:`, err);
		return res.status(500).json({ message: `Internal server error while retrieving application with tripCode ${tripCode} and status ${status}` });
	}
}

// router.get('/applicationCode/:applicationCode', applicationController.getApplicationByApplicationCode); // findOne
// exports.getApplicationByApplicationCode = async function (req, res) {
// 	console.log('GET: /api/applications/applicationCode/:applicationCode: ', req.params.applicationCode);
// 	try {
// 		const applicationCode = req.params.applicationCode;
// 		const application = await applicationModel.findOne({ applicationCode: applicationCode });
// 		if (!application) {
// 			console.warn('Warning: Application not found.');
// 			return res.status(404).json({ message: 'Application not found.' });
// 		}
// 		return res.status(200).json(application);
// 	} catch (err) {
// 		res.status(500).json({ message: err.message });
// 	}
// }

// exports.getApplicationByApplicationCode = async function (req, res) {
// 	console.log('GET: /api/applications/applicationCode/:applicationCode: ', req.params.applicationCode);
// 	try {
// 		const { applicationCode } = req.params;

// 		// Buscar aplicação pelo código
// 		const application = await applicationModel.findOne({ applicationCode: applicationCode });
// 		if (!application) {
// 			console.warn('Warning: Application not found.');
// 			return res.status(404).json({ message: 'Application not found.' });
// 		}

// 		// Buscar informações do usuário relacionado à aplicação
// 		const user = await UserProfile.findOne({ userID: application.userID });
// 		const userDetails = user
// 			? {
// 				name: user.name,
// 				passengerRating: user.passengerRating,
// 				passengerRatingCount: user.passengerRatingCount,
// 			}
// 			: null;

// 		// DTO para resposta
// 		const applicationDTO = {
// 			applicationCode: application.applicationCode,
// 			status: application.status,
// 			applicationDate: application.applicationDate,
// 			trip: application.trip,
// 			user: userDetails,
// 		};

// 		return res.status(200).json(applicationDTO);
// 	} catch (err) {
// 		console.error('Error in getApplicationByApplicationCode:', err);
// 		return res.status(500).json({ message: err.message });
// 	}
// };

exports.getApplicationByApplicationCode = async function (req, res) {
	console.log('GET: /api/applications/applicationCode/:applicationCode: ', req.params.applicationCode);
	try {
		const { applicationCode } = req.params;

		// Find the application
		const application = await applicationModel.findOne({ applicationCode });
		if (!application) {
			console.warn('Warning: Application not found.');
			return res.status(404).json({ message: 'Application not found.' });
		}

		// Find the trip using the tripCode and populate the driverDetails virtual
		const trip = await tripsModel.findOne({ tripCode: application.trip }).populate({
			path: 'driverDetails', // Use the virtual field for driver details
			select: 'userID name driverRating', // Specify the fields to include
		});

		// If trip is not found
		if (!trip) {
			console.warn('Warning: Trip not found.');
			return res.status(404).json({ message: 'Trip not found.' });
		}

		// Fetch user details for the application user
		const user = await UserProfile.findOne({ userID: application.userID });
		const userDetails = user
			? {
				name: user.name,
				passengerRating: user.passengerRating,
				passengerRatingCount: user.passengerRatingCount,
				phoneNumber: user.phoneNumber,
				userID: user.userID,
			}
			: null;

		// DTO for response
		const applicationDTO = {
			applicationCode: application.applicationCode,
			status: application.status,
			applicationDate: application.applicationDate,
			user: userDetails,
			trip: {
				tripCode: trip.tripCode,
				driver: trip.driverDetails
					? {
						userID: trip.driverDetails.userID,
						name: trip.driverDetails.name,
						driverRating: trip.driverDetails.driverRating,
						driverRatingCount: trip.driverDetails.driverRatingCount
					}
					: null,
				car: trip.car,
				nrSeats: trip.nrSeats,
				origin: trip.origin,
				destination: trip.destination,
				departureDate: trip.departureDate,
			},
		};

		return res.status(200).json(applicationDTO);
	} catch (err) {
		console.error('Error in getApplicationByApplicationCode:', err);
		return res.status(500).json({ message: err.message });
	}
};




// router.get('/trip/:tripCode', applicationController.getApplicationByTripCode);
exports.getApplicationByTripCode = async function (req, res) {
	console.log('GET: /api/applications/trip/:tripCode: ', req.params.tripCode);
	try {
		const tripCode = req.params.tripCode;
		const applications = await applicationModel.find({ trip: tripCode });
		if (applications.length === 0) {
			console.warn('Warning: No applications found for this trip.');
			return res.status(404).json({ message: 'No applications found for this trip.' });
		}
		return res.status(200).json(applications);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
}

// router.get('/tripCode/:tripCode/userID/:userID', applicationController.getApplicationByTripByUserID);
exports.getApplicationByTripByUserID = async function (req, res) {
	console.log('GET: /api/applications/tripCode/:tripCode/userID/userID: ', req.params.tripCode, req.params.userID);
	try {
		const tripCode = req.params.tripCode;
		const userID = req.params.userID;
		const application = await applicationModel.findOne({ tripCode: tripCode, userID: userID });
		if (!application) {
			console.warn(`Warning: Application not found for this user in this trip.`);
			return res.status(404).json({ message: 'Application not found.' });
		}
		return res.status(200).json(application);

	} catch (err) {
		res.status(500).json({ message: err.message });
	}
}

// ================================ PATCH ======================================

exports.rejectApplication = async function (req, res) {
	console.log('PATCH: /api/applications/reject/applicationCode/:applicationCode: ', req.params.applicationCode);
	try {
		const applicationCode = req.params.applicationCode;
		const application = await applicationModel.findOne({ applicationCode: applicationCode, status: 'underReview' });
		if (!application) {
			console.warn('Warning: Application not found or not under review.');
			return res.status(404).json({ message: 'Application not found or not under review.' });
		}
		application.status = 'rejected';
		await application.save();
		res.status(200).json(application);
	} catch (err) {
		console.error('Error: ', err);
		return res.status(500).json({ message: err.message });
	}
}


// TO RESOLVE IN MIDDLEWARE <=== ONLY USED BY APPLICANT
exports.cancelApplication = async function (req, res) {
	console.log('PATCH: /api/applications/cancel/applicationCode/:applicationCode: ', req.params.applicationCode);
	try {
		const validStatus = ['underReview', 'waitlist'];
		const applicationCode = req.params.applicationCode;
		const application = await applicationModel.findOne({ applicationCode: applicationCode });
		if (!application) {
			console.warn('Warning: Application not found or not under review.');
			return res.status(404).json({ message: 'Application not found' });
		}
		if (!validStatus.includes(application.status)) {
			console.warn('Warning: Application is not in a cancelable status.');
			return res.status(409).json({ message: 'Application is not in a cancelable status.' });
		}
		application.status = 'canceled';
		await application.save();
		res.status(200).json(application);
	} catch (err) {
		console.error('Error: ', err);
		return res.status(500).json({ message: err.message });
	}
}