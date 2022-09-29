const jwt = require('jsonwebtoken')
const customError = require('../errors/customError')

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new customError('Authentication Error', 401)
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const testUser = payload.userId === '633403c58790b11778d1db35'
    req.user = { userId: payload.userId, testUser }
    next()
  } catch (error) {
    throw new customError('Authenticated Error', 401)
  }
}

module.exports = auth
