'use strict'

const Account = require('../models/accounts.model')
const httpStatus = require('http-status')
const mongoose = require('mongoose');
const request = require('request');

const YOUR_KEY = process.env.KEY_ID;
const YOUR_SECRET = process.env.SECRET_KEY;

exports.create = async (req, res, next) => {
  try {
    const reqBody = req.body
    reqBody.parentId = new mongoose.Types.ObjectId(reqBody.parentId)
    reqBody.primary = true

    const accounts = await Account.find({parentId: reqBody.parentId })
    if(accounts?.length > 0){
      reqBody.primary = false
    }

    const options = {
      url: 'https://api.razorpay.com/v1/contacts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(YOUR_KEY + ':' + YOUR_SECRET).toString('base64')}`
      },
      body: JSON.stringify({name: reqBody.name, reference_id: reqBody.parentId})
    };

    request(options, (error, response, body) => {
      if (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        const parseBody = JSON.parse(body)
        if(!parseBody.error){
          reqBody.contactId = parseBody.id

          const fundOptions = {
            url: 'https://api.razorpay.com/v1/fund_accounts',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${Buffer.from(YOUR_KEY + ':' + YOUR_SECRET).toString('base64')}`
            },
            body: JSON.stringify({
              "contact_id": parseBody.id,
              "account_type": "bank_account",
              "bank_account": {
                "name": reqBody.name,
                "ifsc": reqBody.IFSCCode,
                "account_number": reqBody.accountNumber
              }
            })
          };

          request(fundOptions, async(error, response, body) => {
            const parseBody = JSON.parse(body)

            if (error) {
              console.error(error);
              res.status(500).json({ error: 'Internal Server Error' });
            } else if(!parseBody?.error) {
              reqBody.fundAccountId = parseBody.id

              const account = new Account(reqBody)
              const savedAccount = await account.save()
              res.status(httpStatus.CREATED)
              res.send(savedAccount)
            } else {
              // res.status(500).json({ error: 'Internal Server Error' });
              res.json(parseBody)
            }
          })
      }
    }})
    
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