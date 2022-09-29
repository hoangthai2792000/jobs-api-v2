const express = require('express')
const router = express.Router()
const auth = require('../middleware/authentication')
const testUser = require('../middleware/testUser')

const rateLimiter = require('express-rate-limit')
const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    msg: 'Too many request, please try again later after 15 minutes',
  },
})

const { register, login, updateUser } = require('../controllers/auth')

router.post('/login', apiLimiter, login)
router.post('/register', apiLimiter, register)
router.patch('/updateUser', auth, testUser, updateUser)

module.exports = router
