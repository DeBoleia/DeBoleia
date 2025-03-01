const TripModel = require('../models/tripsModel');

class TripInputDTO {
    constructor(data) {
        this.origin = data.origin;
        this.destination = data.destination;
        this.car = data.car;
        this.nrSeats = data.nrSeats;
        this.estimatedCost = data.estimatedCost;
        this.pricePerPerson = data.pricePerPerson;
        this.driver = data.driver;
        this.departureDate = data.departureDate;
    }

	static validateLocation(location) {
		const { district, municipality, parish } = location;

		if (!district) {
			throw new Error('Location must contain a district.');
		}

		if (parish && !municipality) {
			throw new Error('If parish is provided, municipality must also be provided.');
		}

		return {
			district: district || null,
			municipality: municipality || null,
			parish: parish || null,
		};
    }

	static validateDestination(origin, destination) {
		if (origin?.parish && destination?.parish) {
			if (origin.parish === destination.parish && origin.municipality === destination.municipality) {
				throw new Error('Origin and destination must be different.');
			}
		} else if (!origin?.parish || !destination?.parish) {
			if (!origin?.municipality || !destination?.municipality) {
				if (origin.district === destination.district) {
					throw new Error('Origin and destination must be different.');
				}
			} else if (origin.municipality === destination.municipality) {
				throw new Error('Origin and destination must be different.');
			}
		} else if (!origin?.municipality || !destination?.municipality) {
			if (origin.district === destination.district) {
				throw new Error('Origin and destination must be different.');
			}
		}
	}
	

    validate() {
		if (!this.origin) {
			throw new Error('Origin is required.');
		}
		if (!this.destination) {
			throw new Error('Destination is required.');
		}
		if (!this.car) {
			throw new Error('Car is required.');
		}
		if (!this.driver) {
			throw new Error('Driver is required.');
		}
		if (!this.departureDate) {
			throw new Error('Departure date is required.');
		}

        const normalizedOrigin = TripInputDTO.validateLocation(this.origin);
        const normalizedDestination = TripInputDTO.validateLocation(this.destination);
        TripInputDTO.validateDestination(normalizedOrigin, normalizedDestination);

        return {
            origin: normalizedOrigin,
            destination: normalizedDestination,
            car: this.car,
            nrSeats: this.nrSeats,
            estimatedCost: this.estimatedCost,
            pricePerPerson: this.pricePerPerson,
            driver: this.driver,
            departureDate: this.departureDate,
        };
    }
}

module.exports = TripInputDTO;