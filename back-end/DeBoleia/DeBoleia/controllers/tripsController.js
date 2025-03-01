const tripsModel = require('../models/tripsModel');
const UserProfileModels = require('../models/userProfileModels');
const applicationsModel = require('../models/applicationModel');
const TripInputDTO = require('../DTO/tripInputDTO');
const TripOutputDTO = require('../DTO/tripOutputDTO');


exports.getAllTrips = async (req, res) => {
	try {
		console.log('GET /api/trips/all');
		const trips = await tripsModel.find();
		if (trips.length === 0) {
			console.warn('No trips found.');
			return res.status(404).json({ error: 'No trips found.' });
		}
		return res.status(200).json(trips);
	} catch (err) {
		console.error('Error in getAllTrips:', err);
		return res.status(500).json({ error: err.message });
	}
};

exports.getTripByTripCode = async (req, res) => {
	try {
		console.log('GET /api/trips/tripCode/:tripCode', req.params);
		const { tripCode } = req.params;

		// Buscar a viagem no banco de dados
		const trip = await tripsModel.findOne({ tripCode });
		if (!trip) {
			console.warn('Trip not found.');
			return res.status(404).json({ error: 'Trip not found.' });
		}

		// Criar e formatar o DTO da viagem
		const tripDTO = new TripOutputDTO(trip);
		const formattedTrip = await tripDTO.format();

		return res.status(200).json(formattedTrip);
	} catch (err) {
		console.error('Error in getTripByTripCode:', err);
		return res.status(500).json({ error: err.message });
	}
};



exports.getTripsByDriver = async (req, res) => {
	try {
		console.log('GET /api/trips/driver/:userID', req.params);
		const { userID } = req.params;
		const trips = await tripsModel.find({ driver: userID });
		if (trips.length === 0) {
			console.warn('No trips found for driver ' + userID);
			return res.status(404).json({ error: 'No trips found for driver ' + userID });
		}
		return res.status(200).json(trips);
	} catch (err) {
		console.error('Error in getTripsByDriver:', err);
		return res.status(500).json({ error: err.message });
	}
};

exports.getTripsByPassenger = async (req, res) => {
	try {
		console.log('GET /api/trips/passenger/:userID', req.params);
		const { userID } = req.params;
		const trips = await tripsModel.find({ passengers: { $elemMatch: { $eq: userID } } });
		if (trips.length === 0) {
			console.warn('No trips found for passenger ' + userID);
			return res.status(404).json({ error: 'No trips found for passenger ' + userID });
		}
		return res.status(200).json(trips);
	} catch (err) {
		console.error('Error in getTripsByPassenger:', err);
		return res.status(500).json({ error: err.message });
	}
};

exports.getPassengersByTripCode = async (req, res) => {
	try {
		console.log('GET /api/trips/passengers/tripCode/:tripCode', req.params);
		const { tripCode } = req.params;
		const trip = await tripsModel.findOne({ tripCode: tripCode });
		if (!trip) {
			console.warn('Trip not found.');
			return res.status(404).json({ error: 'Trip not found.' });
		}
		const passengers = await UserProfileModels.find({ userID: { $in: trip.passengers } });
		if (passengers.length === 0) {
			console.warn('No passengers found for trip ' + tripCode);
			return res.status(404).json({ error: 'No passengers found for trip ' + tripCode });
		}
		return res.status(200).json( passengers );
	} catch (err) {
		console.error('Error in getPassengersByTripCode:', err);
		return res.status(500).json({ error: err.message });
	}
};

// ================================ PATCH ================================

// TO SOLVE MIDDLWARE <==== ONLY USED BY THE DRIVER
exports.offerTrip = async function (req, res) {
	console.log('PATCH /api/trips/offer/tripCode/:tripCode', req.params);
	try {
		const tripCode = req.params.tripCode;
		const trip = await tripsModel.findOne({
			tripCode: tripCode,
			status: 'created'
		});
		if (!trip) {
			console.warn('Trip not found or not available to offer.');
			return res.status(404).json({ error: 'Trip not found or not available to offer.' });
		}
		trip.status = 'inOffer';
		await trip.save();
		return res.status(200).json({ message: 'Trip is now in offer.', trip });
	}
	catch (err) {
		console.error('Error in offerTrip:', err);
		res.status(500).json({ error: err.message });
	}
};


exports.startTrip = async function (req, res) {
	console.log('PATCH /api/trips/start/tripCode/:tripCode', req.params);
	try {
		const tripCode = req.params.tripCode;
		const trip = await tripsModel.findOne({
			tripCode: tripCode,
			status: { $in: ['inOffer', 'closed'] }
		});
		if (!trip) {
			console.warn('Trip not found or not available to start.');
			return res.status(404).json({ error: 'Trip not found or not available to start.' });
		}
		const currentTime = new Date();
		const departureTime = new Date(trip.departureDate);
		const timeDifference = Math.abs(departureTime - currentTime);
		const hoursDifference = timeDifference / (1000 * 60 * 60);

		if (hoursDifference > 2) {
			console.warn('Trip cannot be started more than 2 hours before or after the departure time.');
			return res.status(409).json({ error: 'Trip cannot be started more than 2 hours before or after the departure time.' });
		}

		trip.status = 'ongoing';
		await trip.save();
		await applicationsModel.updateMany(
			{ tripCode: tripCode, status: { $in: ['underReview', 'waitlist'] } },
			{ status: 'expired' }
		);
		return res.status(200).json({ message: 'Trip is now ongoing.', trip });
	}
	catch (err) {
		console.error('Error in startTrip:', err);
		res.status(500).json({ error: err.message });
	}
};

exports.endTrip = async function (req, res) {
	console.log('PATCH /api/trips/end/tripCode/:tripCode', req.params);
	try {
		const tripCode = req.params.tripCode;
		const trip = await tripsModel.findOne({
			tripCode: tripCode,
			status: 'ongoing'
		});
		if (!trip) {
			console.warn('Trip not found or not available to end.');
			return res.status(404).json({ error: 'Trip not found or not available to end.' });
		}
		trip.status = 'arrived';
		await trip.save();
		return res.status(200).json({ message: 'Trip has arrived to the destination.', trip });
	}
	catch (err) {
		console.error('Error in endTrip:', err);
		res.status(500).json({ error: err.message });
	}
};


exports.finishTrip = async function (req, res) {
	console.log('PATCH ', '/api/trips/finish/tripCode/:tripCode', req.params);
	try {
		const tripCode = req.params.tripCode;

		// Busca a viagem que está marcada como "arrived"
		const trip = await tripsModel.findOne({
			tripCode: tripCode,
			status: 'arrived'
		});
		if (!trip) {
			console.warn('Trip not found or not available to finish.');
			return res.status(404).json({ error: 'Trip not found or not available to finish.' });
		}

		// Atualiza o status da viagem para "finished"
		trip.status = 'finished';
		await trip.save();

		const { driver, passengers } = trip;


		await UserProfileModels.findByIdAndUpdate(
			driver,
			{ $addToSet: { pendingPassengerEvaluation: { $each: passengers } } } // Evita duplicados
		);


		await UserProfileModels.updateMany(
			{ userID: { $in: passengers } },
			{ $addToSet: { pendingDriverEvaluation: driver } } 
		);

		return res.status(200).json({ message: 'Trip has finished and evaluations are pending.', trip });
	} catch (err) {
		console.error('Error in finishTrip:', err);
		return res.status(500).json({ error: err.message });
	}
};


exports.cancelTrip = async function (req, res) {
	console.log('PATCH /api/trips/cancel/tripCode/:tripCode', req.params);
	try {
		const tripCode = req.params.tripCode;
		const trip = await tripsModel.findOne({
			tripCode: tripCode,
			status: { $in: ['created', 'inOffer'] }
		});
		if (!trip) {
			console.warn('Trip not found or not available to cancel.');
			return res.status(404).json({ error: 'Trip not found or not available to cancel.' });
		}
		const currentTime = new Date();
		const departureTime = new Date(trip.departureDate);
		const timeDifference = departureTime - currentTime;
		const hoursDifference = timeDifference / (1000 * 60 * 60);

		if (hoursDifference <= 24) {
			console.warn('Trip cannot be canceled within 24 hours of the departure time.');
			return res.status(409).json({ error: 'Trip cannot be canceled within 24 hours of the departure time.' });
		}

		trip.status = 'canceled';
		await trip.save();
		await applicationsModel.updateMany(
			{ trip: tripCode, status: { $in: ['underReview', 'waitlist', 'approved'] } },
			{ status: 'canceled' }
		);

		return res.status(200).json({ message: 'Trip has been canceled.', trip });
	}
	catch (err) {
		console.error('Error in cancelTrip:', err);
		res.status(500).json({ error: err.message });
	}
}


exports.createTrip = async function (req, res) {
	console.log('POST /api/trips: ', req.body);
	try {
		const tripInputDTO = new TripInputDTO(req.body);
		const validatedTripData = tripInputDTO.validate();

		const newTrip = new tripsModel(validatedTripData);
		await newTrip.save();
		return res.status(201).json({ message: 'Trip created successfuly.', newTrip });
	} catch (err) {
		if (err.name === 'ValidationError') {
			let errorMessage = 'Validation Error: ';
			errorMessage += err.message;
			res.status(400).json({ error: errorMessage.trim() });
		} else if (err.code === 404) {
			res.status(404).json({ error: err.message });
		} else {
			res.status(500).json({ error: err.message });
		}
	}
}

validadeAddPassengerToTrip = async function (tripCode, userID) {
	const application = await applicationsModel.findOne({ userID: userID, tripCode: tripCode, status: 'underReview' });
	if (!application) {
		return { code: 404, errorMessage: 'There is no ' + userID + ' application for trip ' + tripCode + ' under review.' };
	}
	const trip = await tripsModel.findOne({ tripCode: tripCode });
	if (!trip) {
		return { code: 404, errorMessage: 'Trip ' + tripCode + ' not found.' };
	}
	if (trip.passengers.includes(userID)) {
		return { code: 409, errorMessage: 'Passenger already in trip.' };
	}
	if (trip.driver === userID) {
		return { code: 409, errorMessage: 'Driver cannot be a passenger.' };
	}
	if (trip.status != 'inOffer') {
		return { code: 409, errorMessage: 'Trip is under status ' + trip.status + '.' };
	}
	if (trip.nrSeats === trip.passengers.length) {
		return { code: 409, errorMessage: 'Trip is full.' };
	}
	return { code: 0, errorMessage: '', trip: trip };
}

// Only used by the driver TO SOLVE IN MIDDLEWARE
exports.addPassengerToTrip = async function (req, res) {
	try {
		console.log('PUT /api/trips/tripCode/:tripCode/add/:userID: ', req.params);
		const { tripCode, userID } = req.params;
		const application = await applicationsModel.findOne({ userID: userID, tripCode: tripCode, status: 'underReview' });
		const validation = await validadeAddPassengerToTrip(tripCode, userID);
		if (validation.code != 0) {
			return res.status(validation.code).json({ error: validation.errorMessage });
		}

		validation.trip.passengers.push(userID);
		application.status = 'approved';

		if (validation.trip.passengers.length === validation.trip.nrSeats) {
			console.log('Trip is full. Closing trip.');
			validation.trip.status = 'closed';
			const allApplications = await applicationsModel.updateMany({ trip: tripCode, status: 'underReview' },
				{ status: 'waitlist' },
				{ new: true }
			)
		}
		await validation.trip.save();
		await application.save();

		return res.status(200).json({ message: 'Passenger added to trip.', validation });
	} catch (err) {
		console.error('Error in addPassengerToTrip:', err);
		res.status(500).json({ error: err.message });
	}
}

async function validaderemovePassengerFromTrip(application) {
	const tripCode = application.trip;
	const passenger = application.userID;
	const trip = await tripsModel.findOne({ tripCode: tripCode });
	if (!trip) {
		console.warn('Warning: Trip not found.');
		return { code: 404, message: 'Trip not found.' }
	}

	if (application.status === 'approved') {
		const currentTime = new Date();
		const departureTime = new Date(trip.departureDate);
		const timeDifference = departureTime - currentTime;
		const hoursDifference = timeDifference / (1000 * 60 * 60);
		if (hoursDifference <= 24) {
			console.warn('Warning: Application cannot be canceled within 24 hours of the trip departure.');
			return { code: 409, message: 'Application cannot be canceled within 24 hours of the trip departure.' };
		}
		return { code: 0, trip: trip }
	}

	return { code: 0, trip: trip }
}

// Only used by the PASSENGER TO SOLVE IN MIDDLEWARE
exports.removePassengerFromTrip = async function (req, res) {
	try {
		console.log('PUT /api/trips/tripCode/:tripCode/remove/:userID: ', req.params);
		const { tripCode, userID } = req.params;
		const application = await applicationsModel.findOne({ userID: userID, trip: tripCode, status: 'approved' });
		const validation = await validaderemovePassengerFromTrip(application);
		if (validation.code != 0) {
			return res.status(validation.code).json({ error: validation.message });
		}
		if (validation.trip.status === 'closed') {
			const allApplications = await applicationsModel.updateMany({ trip: tripCode, status: 'waitlist' },
				{ status: 'underReview' },
				{ new: true }
			)
			console.log('Reopened trip and applications: ', allApplications);
			validation.trip.status = 'inOffer';
		}
		validation.trip.passengers = validation.trip.passengers.filter(passengerID => passengerID !== userID);
		application.status = 'canceled';
		await validation.trip.save();
		await application.save();

		return res.status(200).json({ message: 'Passenger removed from trip.', validation });
	} catch (err) {
		console.error('Error in removePassangerFromTrip:', err);
		res.status(500).json({ error: err.message });
	}
}


exports.getTrips = async (req, res) => {
	try {
		const { origin, destination, status } = req.query;
		console.log('Query: ', req.query);

		let query = {};

		if (origin) {
			if (origin.district) {
				query['origin.district'] = origin.district;
			}
			if (origin.municipality) {
				query['origin.municipality'] = origin.municipality;
			}
			if (origin.parish) {
				query['origin.parish'] = origin.parish;
			}
		}

		if (destination) {
			if (destination.district) {
				query['destination.district'] = destination.district;
			}
			if (destination.municipality) {
				query['destination.municipality'] = destination.municipality;
			}
			if (destination.parish) {
				query['destination.parish'] = destination.parish;
			}
		}

		query['status'] = 'inOffer';
		console.log('Query: ', query);

		const trips = await tripsModel.find(query).populate({
			path: 'driverDetails',
			select: 'userID name driverRating driverRatingCount',
		});

		if (trips.length === 0) {
			return res.status(404).json({ message: 'No trips found matching the criteria.' });
		}
		const formattedTrips = trips.map(trip => ({
			...trip.toObject(),
			driver: {
				userID: trip.driverDetails.userID,
				name: trip.driverDetails.name,
				driverRatingCount: trip.driverDetails.driverRatingCount,
				driverRating: trip.driverDetails.driverRating,
			}
		}));

		return res.status(200).json(formattedTrips);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: 'An error occurred while fetching trips.' });
	}
};


