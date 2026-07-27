const express = require("express")
const authmiddleware = require("../middlewares/auth.middleware")
const upload = require("../middlewares/file.middleware")
const InterviewController = require("../controllers/interview.controller")

const interviewRouter = express.Router()


/**
 * @route POST /api/interview/
 * @description generate new interview report on the basis of user self-description, resume-pdf and job description
 * @access private
 */

interviewRouter.post("/", authmiddleware.authUser, upload.single('resume'), InterviewController.generateinterviewReportController)


/**
 * @route GET /api/interview/:Id
 * @description get interview report by Id
 * @access private
 */

interviewRouter.get("/report/:Id", authmiddleware.authUser, InterviewController.generateinterviewReportByIdController)

/**
 * @route GET /api/interview/report/:userId
 * @description get all interview reports of a user by userId
 * @access private
 */

interviewRouter.get("/", authmiddleware.authUser, InterviewController.getInterviewReportsByUserIdController)
/**
 * @route POST/api/interview/resume-pdf/:interviewId
 * @description generate resume pdf from interview report by interviewReportId
 * @access private
 */

interviewRouter.post("/resume-pdf/:interviewId", authmiddleware.authUser, InterviewController.generateResumePDFController)

module.exports = interviewRouter