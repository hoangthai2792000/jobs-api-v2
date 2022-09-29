const customError = require('../errors/customError')

const testUser = (req, res, next) => {
  if (req.user.testUser) {
    throw new customError('Test User, Please Read Only!', 400)
  }
  next()
}

module.exports = testUser
