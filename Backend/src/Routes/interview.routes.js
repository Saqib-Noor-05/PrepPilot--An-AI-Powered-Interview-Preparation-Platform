const express = require("express")
const authmiddleware = require("../middlewares/auth.middleware")
const upload = require("../middlewares/file.middleware")
const generateinterviewReportController = require("../controllers/interview.controller")

const interviewRouter = express.Router()

/**
 * @route POST /api/interview/
 * @description generate new interview report on the basis of user self-description, resume pdf and job description
 * @access private
 */

interviewRouter.post("/", authmiddleware.authUser, upload.single("resume"), generateinterviewReportController)

module.exports = interviewRouter