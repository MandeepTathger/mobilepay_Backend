'use strict'

const express = require('express')
const router = express.Router()
const payeeController = require('../../controllers/payee.controller')
const auth = require('../../middlewares/authorization')

router.post('/create', auth(['admin']), payeeController.create)
router.get('/getPayee/:parentId', auth(['admin']), payeeController.getPayee)
router.delete('/delete/:id', auth(['admin']), payeeController.delete)

module.exports = router