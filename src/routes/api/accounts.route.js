'use strict'

const express = require('express')
const router = express.Router()
const accountsController = require('../../controllers/account.controller')

router.post('/create', accountsController.create)
router.get('/getAccounts/:parentId', accountsController.getAccounts)
router.delete('/delete/:id', accountsController.delete)
router.put('/setPrimary/:id/:parentId', accountsController.setPrimary)

module.exports = router