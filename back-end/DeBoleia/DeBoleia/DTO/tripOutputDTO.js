const UserProfileModels = require('../models/userProfileModels'); // Ajuste para o caminho correto do modelo de usuário

class TripOutputDTO {
	/**
	 * Construtor da classe TripOutputDTO.
	 * @param {Object} trip - Dados da viagem a serem formatados.
	 */
	constructor(trip) {
		this.trip = trip;
	}

	/**
	 * Função para buscar os detalhes de um usuário, incluindo os carros.
	 * @param {string} userID - ID do usuário.
	 * @returns {Promise<Object>} - Dados do usuário, incluindo carros.
	 */
	static async getUserDetails(userID) {
		const user = await UserProfileModels.findOne({ userID }).populate('cars');
		if (!user) {
			throw new Error('User not found.');
		}
		return {
			name: user.name,
			driverRating: user.driverRating,
			driverRatingCount: user.driverRatingCount,
			phoneNumber: user.phoneNumber,
			cars: user.cars,
		};
	}

	/**
	 * Função para buscar os detalhes de passageiros.
	 * @param {Array<string>} passengerIDs - IDs dos passageiros.
	 * @returns {Promise<Array>} - Lista de detalhes dos passageiros.
	 */
	static async getPassengerDetails(passengerIDs) {
		const passengerDetails = await Promise.all(
			passengerIDs.map(async (passengerID) => {
				const passenger = await UserProfileModels.findOne({ userID: passengerID });
				if (passenger) {
					return {
						name: passenger.name,
						passengerRating: passenger.passengerRating,
					};
				}
				return null;
			})
		);
		return passengerDetails.filter(passenger => passenger !== null);
	}

	/**
	 * Função para validar e formatar os dados de uma viagem.
	 * @returns {Promise<Object>} - DTO formatado da viagem.
	 */
	async format() {
		const trip = this.trip;

		// Obter dados do motorista
		const driverDetails = await TripOutputDTO.getUserDetails(trip.driver);
		if (!driverDetails) {
			throw new Error('Driver not found.');
		}

		// Obter o carro da viagem (usando a placa)
		const car = driverDetails.cars.find(car => car.licensePlate === trip.car);
		if (!car) {
			throw new Error('Car not found for the trip.');
		}

		// Obter dados dos passageiros
		const passengers = await TripOutputDTO.getPassengerDetails(trip.passengers);

		// Retornar o DTO formatado
		return {
			tripCode: trip.tripCode,
			status: trip.status,
			nrSeats: trip.nrSeats,
			estimatedCost: trip.estimatedCost,
			pricePerPerson: trip.pricePerPerson,
			origin: trip.origin,
			destination: trip.destination,
			departureDate: trip.departureDate,
			car: {
				brand: car.brand,
				model: car.model,
				color: car.color,
				licensePlate: car.licensePlate,
			},
			driver: {
				name: driverDetails.name,
				phoneNumber: driverDetails.phoneNumber,
				driverRating: driverDetails.driverRating,
				driverRatingCount: driverDetails.driverRatingCount,
			},
			passengers,
		};
	}
}

module.exports = TripOutputDTO;
