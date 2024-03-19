'use strict'
const express = require('express')
const router = express.Router()
const authRouter = require('./auth.route')
const userRouter = require('./user.router')

router.get('/status', (req, res) => { res.send({status: 'OK'}) }) // api status

router.use('/auth', authRouter) // mount auth paths
router.use('/user', userRouter) 

module.exports = router
