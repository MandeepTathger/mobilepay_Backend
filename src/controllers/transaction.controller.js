'use strict'

const Transaction = require('../models/transaction.model')
const httpStatus = require('http-status')
const Razorpay = require('razorpay')
const mongoose = require('mongoose');

var instance = new Razorpay({
    key_id: 'rzp_test_C8Y07nohMfoZfZ',
    key_secret: 'Xe1Rqg50R8vDZALazRCyGVW1',
});

exports.create = async (req, res, next) => {
  try {
    const data = req.body
    if(data.senderId){
      data.senderId = mongoose.Types.ObjectId(data.senderId)
    }
    if(data.receiverId){
      data.receiverId = mongoose.Types.ObjectId(data.receiverId)
    }
    const transaction = new Transaction(data)
    console.log(transaction, "transaction")
    const createdtransaction = await transaction.save()
    res.status(httpStatus.CREATED)
    res.send(createdtransaction)
  } catch (error) {
    return next(error)
  }
}

exports.payment = async (req, res, next) => {
  try {
    var options = {
      amount: 100,  
      currency: "INR",     
      receipt: "order_rcptid_11"
    };
    instance.orders.create(options, function(err, order) {
      console.log(order);
      if(!err){
        res.send(order)
      }
    });
  
    // instance.qrCode.create({
    //   type: "upi_qr",
    //   name: "Store Front Display",
    //   usage: "single_use",
    //   fixed_amount: true,
    //   payment_amount: 300,
    //   description: "For Store 1",
    //   customer_id: "cust_NuUpswAb9ABddc",
    //   // close_by: 1681615838,
    //   notes: {
    //     purpose: "Test UPI QR Code notes"
    //   }
    // }, function(err, order) {
    //   console.log(order, "shajkhjk", err);
    //   if(!err){
    //     res.send(order)
    //   }
    // })
  } catch (error) {
    return next(error)
  }
}

exports.getTransactions = async (req, res, next) => {
  console.log('ljkhgfdghjkl;kjh>>')
  try {
    console.log('ljkhgfdghjkl;kjh')
    const users = await Transaction.find({ $or: [{senderId: mongoose.Types.ObjectId(req.params.id)}, {receiverId: mongoose.Types.ObjectId(req.params.id)}]})
    res.send(users)
  } catch (error) {
    next(error)
  }
}
  
