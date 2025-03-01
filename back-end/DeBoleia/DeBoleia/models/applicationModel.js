const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const tripModel = require('../models/tripsModel');

const generateCode = () => {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let code = '';
	for (let i = 0; i < 6; i++) {
		code += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return code;
};

const applicationSchema = new Schema({
	applicationCode: {
		type: String,
		unique: true,
		required: [true, 'Application code is required.'],
		default: generateCode,
		imutable: true
	},
	trip: {
		type: String,
		required: [true, 'Trip code is required.'],
		imutable: true
	},
	userID: {
		type: String,
		imutable: true
	},
	applicationDate: {
		type: Date,
		required: [true, 'Application date is required.'],
		default: Date.now,
		imutable: true
	},
	status: {
		type: String,
		enum: ['underReview', 'approved', 'rejected', 'canceled', 'waitlist', 'expired'],
		default: 'underReview'
	}
}, { collection: 'applications' });

applicationSchema.virtual('tripDetails', {
	ref: 'Trip', // The model to use for population
	localField: 'trip', // The field in the applicationSchema that matches
	foreignField: 'tripCode', // The field in the tripsSchema to match against
	justOne: true, // Set to true since you expect a single trip document
});

applicationSchema.pre('save', async function (next) {
	if (!this.isNew || !this.isModified('applicationCode')) return next();

	let isUnique = false;
	while (!isUnique) {
		const existing = await mongoose.models.Application.findOne({ applicationCode: this.applicationCode });
		if (!existing) {
			isUnique = true;
		} else {
			this.applicationCode = generateCode();
		}
	}
	next();
});


module.exports = mongoose.model('applications', applicationSchema);
