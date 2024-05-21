'use strict'

const express = require('express')
const router = express.Router()
const payeeController = require('../../controllers/payee.controller')
const auth = require('../../middlewares/authorization')

router.post('/create', payeeController.create)
router.get('/getPayee/:parentId', payeeController.getPayee)
router.delete('/delete/:id', payeeController.delete)

module.exports = router