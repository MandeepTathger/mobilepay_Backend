'use strict'

const express = require('express')
const router = express.Router()
const userController = require('../../controllers/user.contoller')
const validator = require('express-validation')
const { create } = require('../../validations/user.validation')
const auth = require('../../middlewares/authorization')

// router.post('/register', validator(create), authController.register) // validate and register

router.post('/create', auth(['superAdmin']), userController.create)
router.get('/getUser/:id', userController.getUser)
router.get('/getUsers/:parentId', auth(['superAdmin']), userController.getUsers)
router.delete('/delete/:id', auth(['superAdmin']), userController.delete)
router.put('/update/:id', auth(['superAdmin', 'admin']), userController.update)


module.exports = router