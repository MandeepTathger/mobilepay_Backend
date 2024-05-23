'use strict'

const User = require('../models/user.model')
const jwt = require('jsonwebtoken')
const config = require('../config')
const httpStatus = require('http-status')
const uuidv1 = require('uuid/v1')
const mongoose = require('mongoose');
const { default: userRole } = require('../utils/user.enum')
const bcrypt = require('bcrypt-nodejs')

exports.create = async (req, res, next) => {
  try {
    const body = req.body
    body.parentId = new mongoose.Types.ObjectId(body.parentId)
    body.role = 'admin'
    const user = new User(body)
    const savedUser = await user.save()
    res.status(httpStatus.CREATED)
    res.send(savedUser.transform())
  } catch (error) {
    return next(User.checkDuplicateEmailError(error))
  }
}

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({parentId: req.params.parentId}, {userName: 1, email: 1, name: 1, commission: 1, keyId: 1, secretKey: 1})
    res.send(users)
  } catch (error) {
    next(error)
  }
}

exports.getUser = async (req, res, next) => {
  try {
    const users = await User.findById(req.params.id, {userName: 1, email: 1})
    res.send(users)
  } catch (error) {
    next(error)
  }
}

exports.delete = async (req, res, next) => {
  try {
    const users = await User.findByIdAndDelete(req.params.id)
    res.send(users)
  } catch (error) {
    next(error)
  }
}

exports.update = async (req, res, next) => {
  try {
    const data = req.body
    if(data.password){
      data.password = bcrypt.hashSync(data.password)
    }
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    })
    res.json({
      id: user._id,
      userName: user.userName,
      email: user.email,
      name: user.name
    })
  } catch (error) {
    return next(User.checkDuplicateEmailError(error))
  }
}

exports.getTop5Users = async (req, res, next) => {
  try {
    await User.aggregate([
      {
        $match: {
          parentId: mongoose.Types.ObjectId(req.params.id)
        }
      },
      {
        $lookup: {
          from: "transactions",
          let: {
            id: "$_id",
            parentId: "$parentId"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$senderId", "$$id"] },
                    { $eq: ["$receiverId", "$$parentId"] }
                  ]
                }
              }
            }
          ],
          as: "transaction"
        }
      },
      {
        $unwind: "$transaction"
      },
      {
        $group: {
          _id: {id: "$_id", userName: "$userName", name: "$name"},
          totalAmount: { $sum: "$transaction.amount" }
        }
      },
      {
        $sort: { totalAmount: -1 }
      },
      {
        $limit: 5  
      },
      // {
      //   $lookup: {
      //     from: "users",
      //     localField: "_id",
      //     foreignField: "userId",
      //     as: "user"
      //   }
      // },
      // {
      //   $unwind: "$user"
      // },
      // {
      //   $project: {
      //     _id: 0,
      //     userId: "$_id",
      //     username: "$user.username",  // Include other user fields as needed
      //     totalAmount: 1
      //   }
      // }
    ]).then(response => {
      console.log(response, "ress")
      if(response){
        res.send(response)
      }
    })
  } catch (error) {
    next(error)
  }
}


