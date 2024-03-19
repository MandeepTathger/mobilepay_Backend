'use strict'
const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')
const httpStatus = require('http-status')
const APIError = require('../utils/APIError')
const transporter = require('../services/transporter')
const config = require('../config')
const Schema = mongoose.Schema

const roles = [
  'superAdmin', 'admin'
]

const userSchema = new Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 128
  },
  email: {
    type: String,
    unique: true,
    lowercase: true
  },
  parentId: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    default: 'user',
    enum: roles
  },
  meta: {
    type: Object
  }
}, {
  timestamps: true
})

userSchema.pre('save', async function save (next) {
  try {
    if (!this.isModified('password')) {
      return next()
    }

    this.password = bcrypt.hashSync(this.password)

    return next()
  } catch (error) {
    return next(error)
  }
})

userSchema.post('save', async function saved (doc, next) {
  try {
    const mailOptions = {
      from: 'noreply',
      to: this.email,
      subject: 'Confirm creating account',
      html: `<div><h1>Hello new user!</h1><p>Click <a href="${config.hostname}/api/auth/confirm?key=${this.activationKey}">link</a> to activate your new account.</p></div><div><h1>Hello developer!</h1><p>Feel free to change this template ;).</p></div>`
    }

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error)
      } else {
        console.log('Email sent: ' + info.response)
      }
    })

    return next()
  } catch (error) {
    return next(error)
  }
})

userSchema.method({
  transform () {
    const transformed = {}
    const fields = ['id', 'userName', 'email', 'createdAt', 'role']

    fields.forEach((field) => {
      transformed[field] = this[field]
    })

    return transformed
  },

  passwordMatches (password) {
    return bcrypt.compareSync(password, this.password)
  }
})

userSchema.statics = {
  roles,

  checkDuplicateEmailError (err) {
    if (err.code === 11000) {
      if(err?.keyValue?.email){
        var error = new Error('Email already taken')
        error.errors = [{
          field: 'email',
          location: 'body',
          messages: ['Email already taken']
        }]
      } else {
        var error = new Error('Username already taken')
        error.errors = [{
          field: 'userName',
          location: 'body',
          messages: ['Username already taken']
        }]
      }
      
      error.status = httpStatus.CONFLICT
      return error
    }

    return err
  },

  async findAndGenerateToken (payload) {
    const { userName, password } = payload
    if (!userName) throw new APIError('Email must be provided for login')

    const user = await this.findOne({ userName }).exec()
    if (!user) throw new APIError(`Invalid Username`, httpStatus.NOT_FOUND)

    const passwordOK = await user.passwordMatches(password)

    if (!passwordOK) throw new APIError(`Password mismatch`, httpStatus.UNAUTHORIZED)

    if (!user.active) throw new APIError(`User not activated`, httpStatus.UNAUTHORIZED)

    return user
  }
}

module.exports = mongoose.model('User', userSchema)
