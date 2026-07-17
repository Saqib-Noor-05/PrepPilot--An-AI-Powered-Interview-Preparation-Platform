const pdfParse = require("pdf-parse");
const generateInterviewReport = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

async function generateinterviewReportController(req, res) {

    const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
    const { selfDescription, jobDescription } = req.body

    const interviewReportByAi = await generateInterviewReport({
        resume: resumeContent,
        selfDescription,
        jobDescription
    })

    const interviewReport = await interviewReportModel.create({
        user: req.user._id,
        ...interviewReportByAi
    })

    res.status(201).json({
        message: "Interview Report Generated Successfully",
        interviewReport
    })
}


module.exports = generateinterviewReportController