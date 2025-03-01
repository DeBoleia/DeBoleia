const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const usersModel = require('./userProfileModels');
// const Car = require('./carsModel');
// const Location = require('./locationsModel');

const generateCode = () => {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let code = '';
	for (let i = 0; i < 6; i++) {
		code += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return code;
};

const tripSchema = new Schema({
	tripCode: {
		type: String,
		unique: true,
		default: generateCode
	},
	car: {
		type: String,
		required: [true, 'Car is required.'],
		validate: [
			{
				validator: async function (v) {
					const User = await usersModel.findOne({ userID: this.driver });
					return User.cars.some(car => car.licensePlate === v);
				},
				message: props => `The car with license plate ${props.value} is not registered under the driver's account.`
			}
		]
	},
	status: {
		type: String,
		enum: ['created', 'inOffer', 'closed', 'ongoind', 'arrived', 'finished', 'canceled'],
		default: 'created'
	},
	nrSeats: {
		type: Number,
		required: [true, 'Number of seats is required.'],
		min: 1,
		validate: {
			validator: Number.isInteger,
			message: props => `${props.value} is not an integer value!`
		},
		default: 1
	},
	estimatedCost: {
		type: Number,
		min: 0,
		validate: {
			validator: function (v) {
				return Math.round(v * 100) / 100 === v;
			},
			message: props => `${props.value} is not a valid cost value!`
		}
	},
	pricePerPerson: {
		type: Number,
		min: 0,
		validate: {
			validator: function (v) {
				return Math.round(v * 100) / 100 === v;
			},
			message: props => `${props.value} is not a valid cost value!`
		}
	},
	driver: {
		type: String,
		required: [true, 'Driver is required.'],
		validate: [
			{
				validator: async function (v) {
					const User = await usersModel.findOne({ userID: v });
					return !!User;
				},
				message: props => `${props.value} is not a registered user.`
			},
			{
				validator: async function (v) {
					const User = await usersModel.findOne({ userID: v });
					return !!User.driversLicense;
				},
				message: props => `${props.value} does not have a driver license registered.`

			}
		]
	},
	passengers: {
		type: [String],
		default: [],
		validate: [
			{
				validator: function (v) {
					return v.length <= this.nrSeats;
				},
				message: props => `${props.value} exceeds the number of seats available.`
			},
			{
				validator: async function (v) {
					for (let passenger of v) {
						const User = await usersModel.findOne({ userID: passenger });
						if (!User) {
							return false;
						}
					}
					return true;
				},
				message: props => `One or more passengers are not registered users.`
			}
		]
	},
	origin: {
		type: {
			municipality: String,
			parish: String,
			district: String,
		},
		required: [true, 'Origin is required.']
	},
	destination: {
		type: {
			municipality: String,
			parish: String,
			district: String,
		},
		required: [true, 'Destination is required.'],
		validate: {
			validator: function (v) {
				const origin = this.origin;
				return validateDestination(origin, v);
			},
			message: 'Origin and destination must be different.'
		}
	},
	departureDate: {
		type: Date,
		validate: {
			validator: function (v) {
				return v > Date.now();
			},
			message: props => `${props.value} is not a valid date. It must be in the future.`
		},
		required: [true, 'Departure date is required.']
	},
	createdAt: {
		type: Date,
		default: Date.now,
		immutable: [true, 'Creation date cannot be modified.']
	},
}, { collection: 'trips' });

tripSchema.pre('save', async function (next) {
	if (!this.isNew || !this.isModified('tripCode')) return next();

	let isUnique = false;
	while (!isUnique) {
		const existing = await mongoose.models.Trip.findOne({ tripCode: this.tripCode });
		if (!existing) {
			isUnique = true;
		} else {
			// Regenerate tripCode if not unique
			this.tripCode = generateCode();
		}
	}
	next();
});

function validateDestination(origin, destination) {
	console.log('Origin:', origin);
	console.log('Destination:', destination);
	if (origin?.parish && destination?.parish) {
		return origin?.parish !== destination?.parish || origin?.municipality !== destination?.municipality;
	} else if (!origin?.parish || !destination?.parish) {
		if (!origin?.municipality || !destination?.municipality) {
			return origin?.district !== destination?.district;
		}
		return origin?.municipality !== destination?.municipality;
	} else if (!origin?.municipality || !destination?.municipality) {
		return origin?.district !== destination?.district;
	}
}

tripSchema.virtual('driverDetails', {
	ref: 'UserProfile', // Reference the userProfile model
	localField: 'driver', // Match the driver field in tripSchema
	foreignField: 'userID', // Match userID in userProfile
	justOne: true // Expect a single driver document
});

const Trip = mongoose.model('Trip', tripSchema);
module.exports = Trip;
