const tripModel = require('../models/tripsModel');

async function AuthGET(req, res, next, decodedUser) {
	try {
		const { tripCode, userID } = req.params;
		if (req.originalUrl === '/api/trips' || req.originalUrl.startsWith('/api/trips?')) {
			return next();
		}
		if (tripCode && req.originalUrl === `/api/trips/passengers/${tripCode}`) {
			const trip = await tripModel.findOne({ tripCode: tripCode });
			if (trip && trip.driver === decodedUser.userID) {
				return next();
			}
			return res.status(403).json({ message: "Only the driver can access this route." });
		}
		if (userID && req.originalUrl === `/api/trips/driver/${userID}`) {
			if (userID === decodedUser.userID) {
				return next();
			}
			return res.status(403).json({ message: "Only the driver can access this route." });
		}
		if (userID && req.originalUrl === `/api/trips/passenger/${userID}`) {
			if (userID === decodedUser.userID) {
				return next();
			}
			return res.status(403).json({ message: "Only the passenger can access this route." });
		}
		if (tripCode && req.originalUrl === `/api/trips/tripCode/${tripCode}`) {
			return next();
			// const trip = await tripModel.findOne({ tripCode: tripCode });
			// if (trip && (trip.driver === decodedUser.userID || trip.passengers.includes(decodedUser.userID))) {
			// 	return next();
			// }
			// return res.status(403).json({ message: "Only the driver and passengers can access this route." });
		}
		return res.status(401).json({ message: "Unauthorized" });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
}


// router.put('/tripCode/:tripCode/add/:userID', tripsController.addPassengerToTrip); // <==== UC14 -----> ONLY USED BY DRIVER
// router.put('/tripCode/:tripCode/remove/:userID', tripsController.removePassengerFromTrip); // <======= -----> ONLY USED BY PASSENGER
async function AuthPUT(req, res, next, decodedUser) {
	try {
		const { tripCode, userID } = req.params;
		const trip = await tripModel.findOne({ tripCode: tripCode });

		if (trip && req.originalUrl.includes('/add/')) {
			if (trip.driver === decodedUser.userID) {
				return next();
			}
			return res.status(403).json({ message: "Only the driver can add passengers to the trip." });
		}
		if (trip && req.originalUrl.includes('/remove/')) {
			if (decodedUser.userID === userID) {
				return next();
			}
			return res.status(403).json({ message: "Only passengers can remove themselves from the trip." });
		}
		return res.status(401).json({ message: "Unauthorized" });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
}

async function AuthPATCH(req, res, next, decodedUser) {
	try {
		const { tripCode } = req.params;
		const trip = await tripModel.findOne({ tripCode: tripCode });

		if (trip.driver === decodedUser.userID) {
			return next();
		}
		return res.status(403).json({ message: "Only the driver of the trip can access this route." });
	}
	catch (err) {
		return res.status(500).json({ message: err.message });
	}
}


async function tripMiddleware(req, res, next, err, decodedUser) {
	console.log("user: ", decodedUser, "trying: ", req.baseUrl, req.method);
	try {

		if (req.method === 'POST') {
			return next(); // Qualquer pessoa logada pode acessar a rota POST
		}

		if (req.method === 'GET') {
			return await AuthGET(req, res, next, decodedUser);
		}

		if (req.method === 'PUT') {
			return await AuthPUT(req, res, next, decodedUser);
		}

		if (req.method === 'PATCH') {
			return await AuthPATCH(req, res, next, decodedUser);
		}

		return res.status(405).json({ message: "Method not allowed" });
	} catch (err) {
		return res.status(500).json({ message: "Server error", error: err.message });
	}
}

module.exports = tripMiddleware;
