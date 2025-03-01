const Joi = require('joi');

const carDTO = Joi.object({
	brand: Joi.string().required(),
	model: Joi.string().required(),
	color: Joi.string().required(),
	licensePlate: Joi.string().required()
});

module.exports = carDTO;