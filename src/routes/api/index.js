'use strict'
const express = require('express')
const router = express.Router()
const authRouter = require('./auth.route')
const userRouter = require('./user.router')
const transactionRouter = require('./transactions.route')
const payeeRouter = require('./payee.route')
const accountRouter = require('./accounts.route')

router.get('/status', (req, res) => { res.send({status: 'OK'}) }) // api status

router.use('/auth', authRouter) // mount auth paths
router.use('/user', userRouter) 
router.use('/transaction', transactionRouter) 
router.use('/payee', payeeRouter)
router.use('/account', accountRouter)

module.exports = router
