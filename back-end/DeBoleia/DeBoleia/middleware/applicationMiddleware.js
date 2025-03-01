const applicationModel = require("../models/applicationModel");
const tripsModel = require("../models/tripsModel");

async function applicationMiddleware(req, res, next, err, decodedUser) {
	console.log("user: ", decodedUser, "trying: ", req.url);
	if (req.method === 'GET')
		return app_get(req, res, next, err, decodedUser);
	if (req.method === 'POST')
		return next();
	// if (req.method === 'PUT')
	// 	return app_put(req, res, next, err, decodedUser);
	if (req.method === 'PATCH')
		return app_patch(req, res, next, err, decodedUser);
	return res.status(405).send({ message: 'Method not allowed' });
}

async function app_get(req, res, next, err, decodedUser) {
	const { userID, status, tripCode, applicationCode } = req.params;
	if (req.url === `/user/${userID}` && decodedUser.userID === req.params.userID) {
		return next();
	}
	if (req.url === `/user/${userID}/status/${status}` && decodedUser.userID === req.params.userID) {
		return next();
	}
	if (req.url === `/tripCode/${tripCode}/status/${status}`) {
		const trip = await tripsModel.findOne({ tripCode: req.params.tripCode });
		if (trip && trip?.driver === decodedUser.userID) {
			return next();
		}
		return res.status(401).send({ message: 'Unauthorized' });
	}
	if (req.url === `/applicationCode/${applicationCode}`) {
		const application = await applicationModel.findOne({ applicationCode: req.params.applicationCode });
		const trip = await tripsModel.findOne({ tripCode: application?.trip });

		if ((application && trip) && (application.userID === decodedUser.userID || trip?.driver === decodedUser.userID)) {
			return next();
		}
		return res.status(401).send({ message: 'Unauthorized' });
	}
	if (req.url === `/trip/${tripCode}`) {
		const trip = await tripsModel.findOne({ tripCode: req.params.tripCode });
		if (trip && trip?.driver === decodedUser.userID) {
			return next();
		}
		return res.status(401).send({ message: 'Unauthorized' });
	}
}

async function app_patch(req, res, next, err, decodedUser) {
	const { applicationCode } = req.params;
	// if (req.url === '/applicationCode/:applicationCode/status/:status') {
	// 	const application = await applicationModel.findOne({ applicationCode: req.params.applicationCode });
	// 	const trip = await tripsModel.findOne({ tripCode: application?.trip });

	// 	if ((application && trip) && (application.userID === decodedUser.userID || trip?.driver === decodedUser.userID)) {
	// 		return next();
	// 	}
	// 	return res.status(401).send({ message: 'Unauthorized' });
	// }
	if (req.url === `/reject/applicationCode/${applicationCode}`) {
		const application = await applicationModel.findOne({ applicationCode: req.params.applicationCode });
		const trip = await tripsModel.findOne({ tripCode: application?.trip });

		if ((application && trip) && trip?.driver === decodedUser.userID) {
			return next();
		}
		return res.status(401).send({ message: 'Unauthorized' });
	}
	if (req.url === `/cancel/applicationCode/${applicationCode}`) {
		const application = await applicationModel.findOne({ applicationCode: req.params.applicationCode });
		if (application && application.userID === decodedUser.userID) {
			return next();
		}
		return res.status(401).send({ message: 'Unauthorized' });
	}
}


module.exports = applicationMiddleware;