'use strict'

const Transaction = require('../models/transaction.model')
const Accounts = require('../models/accounts.model')
const Users = require('../models/user.model')
const Payee = require('../models/payee.model')
const httpStatus = require('http-status')
const Razorpay = require('razorpay')
const mongoose = require('mongoose');
const request = require('request');

const YOUR_KEY = process.env.KEY_ID;
const YOUR_SECRET = process.env.SECRET_KEY;

exports.create = async (req, res, next) => {
  try {
    const data = req.body
    if(data.senderId){
      data.senderId = mongoose.Types.ObjectId(data.senderId)
    }

    const payee = await Payee.findById(data.payeeId)
    const admin = await Users.findById(payee.parentId)
    const parentAccount = await Accounts.findOne({parentId: admin.parentId, primary: true})

    const commissionAmount = data.amount * admin.commission/100
    const remainingAmount = data.amount - commissionAmount

    const options = {
      url: 'https://api.razorpay.com/v1/payouts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(YOUR_KEY + ':' + YOUR_SECRET).toString('base64')}`
      },
      body: JSON.stringify({
        account_number: payee.accountNumber, 
        fund_account_id: payee.fundAccountId,
        amount: remainingAmount * 100,
        currency: "INR",
        mode: "IMPS",
        purpose: 'refund'
      })
    };

    request(options, async(error, response, body) => {
      const parseBody = JSON.parse(body)
      if (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      } else if(!parseBody?.error || parseBody?.error?.description === null) {
        data.payoutId = parseBody.id
        data.fundAccountId = parseBody.fund_account_id
        data.platformFee = parseBody.fees/100
        data.receiverId = payee._id
        data.receiverName = payee.name
        data.type = "regular"
        data.amount = remainingAmount

        const transaction = new Transaction(data)
        await transaction.save()

        const commissionOptions = {
          url: 'https://api.razorpay.com/v1/payouts',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(YOUR_KEY + ':' + YOUR_SECRET).toString('base64')}`
          },
          body: JSON.stringify({
            account_number: parentAccount.accountNumber, 
            fund_account_id: parentAccount.fundAccountId,
            amount: commissionAmount * 100,
            currency: "INR",
            mode: "IMPS",
            purpose: 'refund'
          })
        };
    
        request(commissionOptions, async(error, response, body) => {
          const parseBody = JSON.parse(body)
          if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
          } else if(!parseBody?.error || parseBody?.error?.description === null) {
            data.payoutId = parseBody.id
            data.fundAccountId = parentAccount.fundAccountId
            data.platformFee = parseBody.fees/100
            data.receiverId = parentAccount.parentId
            data.receiverName = parentAccount.name
            data.type = "commission"
            data.amount = commissionAmount

            const transaction = new Transaction(data)
            const createdtransaction = await transaction.save()
            res.status(httpStatus.CREATED)
            res.send(createdtransaction)
     
          } else {
            res.json(parseBody)
          }
        });
 
      } else {
        res.json(parseBody)
      }
    });

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
  try {
    const data = await Transaction.find({ $or: [{senderId: mongoose.Types.ObjectId(req.params.id)}, {receiverId: mongoose.Types.ObjectId(req.params.id)}]})
    res.send(data)
  } catch (error) {
    next(error)
  }
}

exports.getLast5Transactions = async (req, res, next) => {
  try {
    const data = await Transaction.find({ senderId: mongoose.Types.ObjectId(req.params.id)}).sort({ createdAt: -1 }).limit(5)
    res.send(data)
  } catch (error) {
    next(error)
  }
}
  
