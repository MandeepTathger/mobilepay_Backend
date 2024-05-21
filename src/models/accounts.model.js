'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const httpStatus = require('http-status')

const roles = [
  'superAdmin', 'admin'
]

const accountSchema = new Schema({
  accountNumber: {
    type: String,
    require: true
  },
  name: {
    type: String,
    require: true
  },
  bankName: {
    type: String
  },
  IFSCCode: {
    type: String,
    require: true
  },
  parentId: {
    type: mongoose.Types.ObjectId,
    require: true 
  },
  primary: {
    type: Boolean
  },
  role: {
    type: String,
    enum: roles
  },
  contactId: {
    type: String
  },
  fundAccountId: {
    type: String
  }
}, {
  timestamps: true
})

accountSchema.index({ accountNumber: 1, parentId: 1 }, { unique: true });

accountSchema.statics = {
  checkDuplicateAccountError (err) {
    if (err.code === 11000) {
      var error = new Error('Account already Exists')
      error.errors = [{
        location: 'body',
        messages: ['Account already Exists']
      }]
      
      error.status = httpStatus.CONFLICT
      return error
    }

    return err
  },
}

module.exports = mongoose.model('Account', accountSchema)