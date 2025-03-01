const  userProfileModels = require('../models/userProfileModels');

class UserProfileInputDTO {
	constructor(userid, nome, email, password, role, phoneNumber, NIF, status, birthDate, driverRating, driverRatingCount, passengerRating, passengerRatingCount, driversLicense) {
		this.userid = userid;
		this.nome = nome;
		this.email = email;
		this.password = password;
		this.role = role;
		this.phoneNumber = phoneNumber;
		this.NIF = NIF || null;
		this.status = status;
		this.birthDate = birthDate || null;
		this.driverRating = driverRating;
		this.driverRatingCount = driverRatingCount;
		this.passengerRating = passengerRating;
		this.passengerRatingCount = passengerRatingCount;
		this.driversLicense = driversLicense || null;
		this.cars = cars;
	}

	async toUserProfile() {
		return new userProfileModels({
			userID: this.userid,
			nome: this.nome,
			email: this.email,
			password: this.password,
			role: this.role,
			phoneNumber: this.phoneNumber,
			NIF: this.NIF,
			status: this.status,
			birthDate: this.birthDate,
			driverRating: this.driverRating,
			driverRatingCount: this.driverRatingCount,
			passengerRating: this.passengerRating,
			passengerRatingCount: this.passengerRatingCount,
			driversLicense: this.driversLicense,
			cars: this.cars
		});
	}
}

module.exports = UserProfileInputDTO;
