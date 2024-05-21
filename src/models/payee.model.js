'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const httpStatus = require('http-status')

const payeeSchema = new Schema({
  accountNumber: {
    type: String,
    require: true
  },
  name: {
    type: String,
    require: true
  },
  IFSCCode: {
    type: String,
    require: true
  },
  parentId: {
    type: mongoose.Types.ObjectId, 
    require: true
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

payeeSchema.index({ accountNumber: 1, parentId: 1 }, { unique: true });

payeeSchema.statics = {
  checkDuplicatePayeeError (err) {
    if (err.code === 11000) {
      var error = new Error('Payee already Exists')
      error.errors = [{
        location: 'body',
        messages: ['Payee already Exists']
      }]
      
      error.status = httpStatus.CONFLICT
      return error
    }

    return err
  },
}

module.exports = mongoose.model('Payee', payeeSchema)