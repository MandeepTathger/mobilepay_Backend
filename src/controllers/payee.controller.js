'use strict'

const Payee = require('../models/payee.model')
const httpStatus = require('http-status')
const mongoose = require('mongoose');

exports.create = async (req, res, next) => {
  try {
    const body = req.body
    body.parentId = new mongoose.Types.ObjectId(body.parentId)
    const payee = new Payee(body)
    const savedPayee = await payee.save()
    res.status(httpStatus.CREATED)
    res.send(savedPayee)
  } catch (error) {
    return next(Payee.checkDuplicatePayeeError(error))
  }
}

exports.getPayee = async (req, res, next) => {
  try {
    const payee = await Payee.find({parentId: req.params.parentId})
    res.send(payee)
  } catch (error) {
    next(error)
  }
}


exports.delete = async (req, res, next) => {
  try {
    const users = await Payee.findByIdAndDelete(req.params.id)
    res.send(users)
  } catch (error) {
    next(error)
  }
}



