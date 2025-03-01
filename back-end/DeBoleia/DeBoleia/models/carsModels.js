const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const carsSchema = new Schema({
	brand: {
		type: String,
		required: true
	},
	model: {
		type: String,
		required: true
	},
	color: {
		type: String,
		required: true
	},
	licensePlate: {
		type: String,
		required: false,
		sparse: true,
		unique: function () {
			return this.licensePlate !== null;
		},
		sparse: true,
		validate: {
			validator: function (v) {
				if (!v) return true;
				const regex = /^([A-Z]{2}-\d{2}-[A-Z]{2})|(\d{2}-[A-Z]{2}-[A-Z]{2})|([A-Z]{2}-[A-Z]{2}-\d{2})|([A-Z]{2}-\d{2}-\d{2})|(\d{2}-[A-Z]{2}-\d{2})|(\d{2}-\d{2}-[A-Z]{2})$/;
				return regex.test(v);
			},
			message: props => `${props.value} is not a valid license plate! It must be in the format XX-XX-XX with specific rules for digits and alphabetic characters.`
		}
	}
});

module.exports = carsSchema;