const express = require('express')
const router = express.Router()
const testUser = require('../middleware/testUser')

const {
  getAllJobs,
  getSingleJob,
  createJob,
  updateJob,
  deleteJob,
  showStats,
} = require('../controllers/jobs')

router.route('/').get(getAllJobs).post(testUser, createJob)
router.route('/stats').get(showStats)
router
  .route('/:id')
  .get(getSingleJob)
  .patch(testUser, updateJob)
  .delete(testUser, deleteJob)

module.exports = router
