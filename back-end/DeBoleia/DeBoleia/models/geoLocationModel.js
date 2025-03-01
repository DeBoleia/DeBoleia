const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const geoLocation = new Schema({
	municipality : {
		type : String,
	},
	parish : {
		type : String
	},
	district : {
		type : String,
		required : true
	}
}, {collection: 'geoLocations'});

models.exports = mongoose.Schema('geoLocations', geoLocation);