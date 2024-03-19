'use strict'

const express = require('express')
const router = express.Router()
const userController = require('../../controllers/user.contoller')
const validator = require('express-validation')
const { create } = require('../../validations/user.validation')
const auth = require('../../middlewares/authorization')

// router.post('/register', validator(create), authController.register) // validate and register

router.post('/create', auth(['superAdmin']), userController.create)


module.exports = router