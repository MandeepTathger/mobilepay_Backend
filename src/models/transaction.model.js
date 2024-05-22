'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const validateObjectIdOrString = (value) => {
  return mongoose.Types.ObjectId.isValid(value) || typeof value === 'string';
};

const transactionSchema = new Schema({
  senderId: {
    type: Schema.Types.Mixed, // Use Mixed type to allow for either ObjectId or String
    validate: {
      validator: validateObjectIdOrString
    }
  },
  receiverId: {
    type: Schema.Types.Mixed, // Use Mixed type to allow for either ObjectId or String
    validate: {
      validator: validateObjectIdOrString
    }
  },
  // razorpayOrderId: {
  //   type: String,
  // },
  // razorpayPaymentId: {
  //   type: String,
  // },
  // razorpaySignature: {
  //   type: String,
  // },
  receiverName: {
    type: String
  },
  amount: {
    type: Number,
  },
  payoutId: {
    type: String
  },
  platformFee: {
    type: Number
  },
  fundAccountId: {
    type: String
  },
  type: {
    type: String
  },
}, {
  timestamps: true
})

module.exports = mongoose.model('Transaction', transactionSchema)