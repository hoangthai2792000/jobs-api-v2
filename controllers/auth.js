const User = require('../models/User')
const customError = require('../errors/customError')

const register = async (req, res) => {
  const user = await User.create({ ...req.body })
  const token = user.createJWT()

  res.status(201).json({
    user: {
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      location: user.location,
      token,
    },
  })
}

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new customError('Email and password must be provided', 400)
  }

  const user = await User.findOne({ email })

  if (!user) {
    throw new customError(`Can not find any user with email: ${email}`, 401)
  }

  const isPasswordCorrect = await user.checkPassword(password)

  if (!isPasswordCorrect) {
    throw new customError('Wrong password, please try again', 401)
  }

  const token = user.createJWT()
  res.status(200).json({
    user: {
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      location: user.location,
      token,
    },
  })
}

const updateUser = async (req, res) => {
  console.log(req.user)
  // console.log(req.body)
  const { name, email, lastName, location } = req.body

  if (!name || !email || !lastName || !location) {
    throw new customError('Please provide all values', 400)
  }

  const user = await User.findByIdAndUpdate(
    { _id: req.user.userId },
    req.body,
    { new: true, runValidators: true }
  )

  if (!user) {
    throw new customError(`No user with the id:${req.user.userId}`, 404)
  }

  // for the case that user change the name
  const token = user.createJWT()

  res.status(200).json({
    user: {
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      location: user.location,
      token,
    },
  })
}

module.exports = { register, login, updateUser }
