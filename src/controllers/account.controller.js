'use strict'

const Account = require('../models/accounts.model')
const httpStatus = require('http-status')
const mongoose = require('mongoose');

exports.create = async (req, res, next) => {
  try {
    const body = req.body
    body.parentId = new mongoose.Types.ObjectId(body.parentId)
    body.primary = true

    const accounts = await Account.find({parentId: body.parentId })
    if(accounts?.length > 0){
      body.primary = false
    }

    const account = new Account(body)
    const savedAccount = await account.save()
    res.status(httpStatus.CREATED)
    res.send(savedAccount)
  } catch (error) {
    return next(Account.checkDuplicateAccountError(error))
  }
}

exports.getAccounts = async (req, res, next) => {
  try {
    const account = await Account.find({parentId: req.params.parentId})
    res.send(account)
  } catch (error) {
    next(error)
  }
}


exports.delete = async (req, res, next) => {
  try {
    const account = await Account.findByIdAndDelete(req.params.id)
    res.send(account)
  } catch (error) {
    next(error)
  }
}

exports.setPrimary = async (req, res, next) => {
  try {
    await Account.updateMany(
      { parentId: req.params.parentId},
      [{
        $set: {
           primary: { $eq: [ "$_id", new mongoose.Types.ObjectId(req.params.id) ] } // Sets primary to true if _id matches primaryAccountId, otherwise false
        }
      }]
    )
    const accounts = await Account.find({parentId: req.params.parentId})
    res.send(accounts)
  } catch (error) {
    next(error)
  }
}