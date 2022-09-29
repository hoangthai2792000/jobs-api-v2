const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Name must be provided'],
    minLength: 3,
    maxLength: 30,
  },
  lastName: {
    type: String,
    trim: true,
    minLength: 3,
    maxLength: 30,
    default: 'Your Last Name',
  },
  location: {
    type: String,
    trim: true,
    minLength: 3,
    maxLength: 30,
    default: 'Your City',
  },
  email: {
    type: String,
    required: [true, 'Email must be provided'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide valid email',
    ],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Password must be provided'],
    minLength: 3,
  },
})

UserSchema.pre('save', async function () {
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, name: this.name },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  )
}

UserSchema.methods.checkPassword = async function (reqPassword) {
  const isMatch = await bcrypt.compare(reqPassword, this.password)
  return isMatch
}

module.exports = mongoose.model('User', UserSchema)
