const userProfilesModel = require('../models/userProfileModels');
const axios = require('axios');
var GetCars =  ('http://localhost:8083/api') + '/cars';


class UserProfileOutputDTO {
	constructor(user) {

		console.log("Dados recebidos no construtor:", user);

		this.userID = user.userID;
		this.name = user.name;
		this.email = user.email;
		this.role = user.role;
		this.phoneNumber = user.phoneNumber;
		this.NIF = user.NIF;
		this.status = user.status;
		this.birthDate = user.birthDate;
		this.driverRating = user.driverRating;
		this.driverRatingCount = user.driverRatingCount;
		this.passengerRating = user.passengerRating;
		this.passengerRatingCount = user.passengerRatingCount;
		this.driversLicense = user.driversLicense;
		this.cars = user.cars ? [...user.cars] : [];
		this.pendingDriverEvaluation = user.pendingDriverEvaluation ? [...user.pendingDriverEvaluation] : [];
		this.pendingPassengerEvaluation = user.pendingPassengerEvaluation ? [...user.pendingPassengerEvaluation] : [];
		//console.log("DTO após o construtor:", this);
	}


	static async fromUser(user) {
		const dto = new UserProfileOutputDTO(user);

		return dto;
	}
}

module.exports = UserProfileOutputDTO;
