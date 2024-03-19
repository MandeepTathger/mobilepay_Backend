'use strict'

const Joi = require('joi')

// User validation rules
module.exports = {
  create: {
    body: {
      email: Joi.string().email(),
      password: Joi.string().min(6).max(128).required(),
      userName: Joi.string().max(128).required()
    }
  }
}
