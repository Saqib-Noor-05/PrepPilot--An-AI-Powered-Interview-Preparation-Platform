const pdfParse = require("pdf-parse");
const { generateInterviewReport, generateResumePDF } = require("../services/ai.service")  //AI services included here..
const interviewReportModel = require("../models/interviewReport.model")
const getURL = require('../services/testcherio')

async function generateinterviewReportController(req, res) {

    const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText() //Uint8Array = Unsigned 8 bit integer
    const { jobDescription } = req.body
    const { selfDescription } = req.body
    const { jobDescriptionURL } = req.body
    if (!jobDescription) {
        jobDescription = jobDescriptionURL
    }


    const interviewReportByAi = await generateInterviewReport({
        resume: resumeContent.text,
        selfDescription,
        jobDescription
    })
    const interviewReport = await interviewReportModel.create({
        user: req.user._id,
        resume: resumeContent.text,
        selfDescription,
        jobDescription,
        ...interviewReportByAi
    })


    return res.status(201).json({
        message: "Interview Report Generated Successfully",
        interviewReport
    })

}

async function getInterviewReportByIdController(req, res) {
    const { interviewId } = req.params;
    const interviewReport = await interviewReportModel.findOne({
        _id: interviewId,
        user: req.user._id
    })
    if (!interviewReport) {
        return res.status(400).json({
            message: "bad Request"
        })
    }
    return res.status(200).json({
        message: "Reports fetched successfully",
        interviewReport
    })
}


async function getInterviewReportsByUserIdController(req, res) {
    // const { user } = req.params;
    const interviewReports = await interviewReportModel.find({
        user: req.user._id
    }).sort({ createdAt: -1 }).select("-resume -selfDescription" +
        " -jobDescription -preparationPlan" +
        " -__v -technicalQuestions -behavioralQuestions -skillGaps")
    return res.status(200).json({
        message: "Interview Reports Fetched Successfully",
        interviewReports
    })
}


async function generateResumePDFController(req, res) {
    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewId)

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePDF({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewId}.pdf`
    })

    res.send(pdfBuffer)
}

module.exports =
{
    generateinterviewReportController,
    generateResumePDFController,
    getInterviewReportByIdController,
    getInterviewReportsByUserIdController
}