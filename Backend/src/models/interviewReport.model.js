const mongoose = require('mongoose')
/**
 * - job description schema: String
 * - resume text: String
 * - Self description: String
 *
 * - matchScore : Number
 *
 * - Technical questions :       (array of objects qs-ans)
 *     [{
 *       question : "",
 *       intention : "",
 *       answer : "",
 *     }]
 *
 * - Behavioral questions : [       (array of objects qs-ans)
 *     {
 *       question : "",
 *       intention : "",
 *       answer : "",
 *     }
 *   ]
 *
 * - Skill gap : [{
 *     skill : "",
 *     severity : {
 *       type : String,
 *       enum : ["low", "medium", "high"]
 *     }
 *   }]
 *
 * - preparation plan : [{}]
 *             day: Number
 *             tasks : [String]
 *             focus:String
 */

const technicalQuestionSchema = new mongoose.Schema({
    questions: {
        type: String
    },
    intention: {
        type: String
    },
    answer: {
        type: String
    }
},
    { _id: false }
)

const behaviouralQuestionSchema = new mongoose.Schema({
    questions: {
        type: String
    },
    intention: {
        type: String
    },
    answer: {
        type: String
    }
},
    { _id: false }
)

const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [true, "SkillGap is required"]
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high"]
    }
},
    {
        _id: false
    })

const prepPlanSchema = new mongoose.Schema({
    day: {
        type: String
    },
    tasks: [{
        type: String
    }],
    focus: String
})

const interviewReportSchema = new mongoose.Schema({

    jobDescription: {
        type: String,
        required: [true, "Job description is required"],
        minlength: 10

    },
    resumeText: {
        type: String,
    },
    selfDescription: {
        type: String
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100
    },
    technicalQuestions: [technicalQuestionSchema],
    behaviouralQuestion: [behaviouralQuestionSchema],
    skillGaps: [skillGapSchema],
    preparationPlan: [prepPlanSchema],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
}, {
    timestamps: true
})

const interviewReportModel = mongoose.model("interviewReportSchema", interviewReportSchema)

module.exports = interviewReportModel