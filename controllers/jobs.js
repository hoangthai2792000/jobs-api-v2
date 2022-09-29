const customError = require('../errors/customError')
const Job = require('../models/Job')
const mongoose = require('mongoose')
const moment = require('moment')

const getAllJobs = async (req, res) => {
  // console.log(req.query)
  const { status, jobType, sort, search } = req.query

  const queryObject = {
    createdBy: req.user.userId,
  }

  // search logic
  if (search) {
    queryObject.position = { $regex: search, $options: 'i' }
  }
  if (status && status !== 'all') {
    queryObject.status = status
  }
  if (jobType && jobType !== 'all') {
    queryObject.jobType = jobType
  }

  let result = Job.find(queryObject)

  // sort logic
  if (sort === 'latest') {
    result = result.sort('-createdAt')
  }
  if (sort === 'oldest') {
    result = result.sort('createdAt')
  }
  if (sort === 'a-z') {
    result = result.sort('position')
  }
  if (sort === 'z-a') {
    result = result.sort('-position')
  }

  // pagination logic
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = (page - 1) * limit
  // console.log(skip, limit)

  result = result.skip(skip).limit(limit)

  const jobs = await result
  const totalJobs = await Job.countDocuments(queryObject)
  const numOfPages = Math.ceil(totalJobs / limit)

  res.status(200).json({ jobs, totalJobs, numOfPages })
}

const getSingleJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req

  const job = await Job.findOne({
    _id: jobId,
    createdBy: userId,
  })

  if (!job) {
    throw new customError(`No job with the id:${jobId}`, 404)
  }

  res.status(200).json({ job })
}

const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId
  const job = await Job.create(req.body)
  // console.log(req.user)
  res.status(201).json({ job })
}

const updateJob = async (req, res) => {
  const {
    body: { company, position },
    user: { userId },
    params: { id: jobId },
  } = req

  if (!company || !position) {
    throw new customError('Please provide company and position', 400)
  }

  // console.log(req.body)

  const job = await Job.findByIdAndUpdate(
    {
      _id: jobId,
      createdBy: userId,
    },
    req.body,
    { new: true, runValidators: true }
  )

  if (!job) {
    throw new customError(`No job with the id:${jobId}`, 404)
  }

  res.status(200).json({ job })
}

const deleteJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req

  const job = await Job.findByIdAndDelete({
    _id: jobId,
    createdBy: userId,
  })

  if (!job) {
    throw new customError(`No job with the id:${jobId}`, 404)
  }

  res.status(200).json({ msg: 'Delete successfully' })
}

const showStats = async (req, res) => {
  let stats = await Job.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ])

  stats = stats.reduce((acc, curr) => {
    const { _id: status, count } = curr
    // console.log(acc)
    acc[status] = count

    return acc
  }, {})

  const defaultStats = {
    pending: stats.pending || 0,
    declined: stats.declined || 0,
    interview: stats.interview || 0,
  }

  // console.log(stats)

  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
  ])

  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item
      const date = moment()
        .month(month - 1)
        .year(year)
        .format('MMM Y')
      return { date, count }
    })
    .reverse()

  console.log(monthlyApplications)

  res.status(200).json({ defaultStats, monthlyApplications })
}

module.exports = {
  getAllJobs,
  getSingleJob,
  createJob,
  updateJob,
  deleteJob,
  showStats,
}
