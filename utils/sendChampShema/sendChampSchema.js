const Joi = require('joi');
const { OtpChannel, OtpTokenType } = require('../sendChampEmums/enums');
const sentOtpSchema = Joi.object({
  meta_data: Joi.object().required(),
  channel: Joi.string()
    .valid(...Object.values(OtpChannel))
    .required(),
  sender: Joi.string().required(),
  token_type: Joi.string()
    .valid(...Object.values(OtpTokenType))
    .required(),
  token_length: Joi.number().integer().positive().required(),
  expiration_time: Joi.number().integer().positive().required(),
  phone_number: Joi.string().required(),
});

const confirmOtpSchema = Joi.object({
  verification_reference: Joi.string().required(),
  verification_code: Joi.string().required(),
});

module.exports = { sentOtpSchema, confirmOtpSchema };
