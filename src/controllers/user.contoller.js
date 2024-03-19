'use strict'

const User = require('../models/user.model')
const jwt = require('jsonwebtoken')
const config = require('../config')
const httpStatus = require('http-status')
const uuidv1 = require('uuid/v1')

exports.create = async (req, res, next) => {
  try {
    const body = req.body
    body.parentId = ''
    body.role = 'admin'
    const user = new User(body)
    const savedUser = await user.save()
    res.status(httpStatus.CREATED)
    res.send(savedUser.transform())
  } catch (error) {
    return next(User.checkDuplicateEmailError(error))
  }
}
