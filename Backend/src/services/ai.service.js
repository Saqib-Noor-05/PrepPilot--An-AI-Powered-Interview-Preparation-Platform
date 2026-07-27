const { GoogleGenAI, ResponseFormat } = require("@google/genai")
const { z } = require('zod')
const puppeteer = require('puppeteer');

const client = new GoogleGenAI({
    apiKey: "AQ.Ab8RN6ICI_VzgQsXz7M6dbv6BOzq-3JxuQRgoRbbf3d_CLxWxQ"
});

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})


async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `
You are an experienced Senior Software Engineer and Technical Interview Coach.

Your task is to analyze a candidate's profile and compare it with the given job description.

### Candidate Resume
${resume}

### Candidate Self Description
${selfDescription}

### Job Description
${jobDescription}

Analyze the candidate carefully and perform the following tasks:

1. Calculate a match score between 0 and 100 based on how well the candidate matches the job description.

2. Generate 8-10 technical interview questions.
   For each question provide:
   - question
   - intention (why the interviewer asks it)
   - answer (how the candidate should answer)

3. Generate 5-7 behavioral interview questions.
   For each question provide:
   - question
   - intention
   - answer

4. Identify all important skill gaps between the resume and the job description.
   For each skill gap provide:
   - skill
   - severity
     (only one of: low, medium, high)

5. Create a preparation plan.
   Generate a day-wise interview preparation roadmap.
   For each day provide:
   - day
   -focus
   - tasks

6. Generate the exact job title from the job description.

Important Instructions:

- Compare the resume with the job description carefully.
- Do not assume skills that are not mentioned.
- Keep answers realistic and practical.
- Interview questions should be relevant to the job description.
- Preparation plan should directly improve the identified skill gaps.
- Return ONLY valid JSON.
- Do NOT include markdown.
- Do NOT include explanations.
- Do NOT add extra fields.
- The response MUST strictly follow the provided response schema.
`
    const jsonSchema = z.toJSONSchema(interviewReportSchema);

    const response = await client.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseFormat: {
                text: {
                    mimeType: "application/json",
                    schema: jsonSchema
                }
            }
        }
        
    })
    const Report = interviewReportSchema.parse(JSON.parse(response.text))
        return Report
}


async function generatePdfFromHtml(htmlContent) {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: "networkidle0" })
        // console.log("HTML CONTENT", htmlContent)

        const pdfBuffer = await page.pdf({
            format: "A4", margin: {
                top: "10mm",
                bottom: "10mm",
                left: "15mm",
                right: "15mm"
            }
        })
        // console.log("PDFBUFFER in Puppeteer", pfdfBuffer)
        await browser.close()
        return pdfBuffer
    }
    catch (err) {
        // console.log("Error generating PDF from HTML:", err);
    }

}

async function generateResumePDF({ resume, jobDescription, selfDescription }) {
    try {
        const resumePDFschema = z.object({
            html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
        })
             console.log("resumepdf schema", resumePDFschema)
        const prompt = `Generate resume for a candidate with the following details
                   Resume:${resume},
                    Self Description: ${selfDescription}
                    job description :${jobDescription}

                    the resume should be a JSON object with a single field "html" which contains the HTML content of the 
                    resume and which can be converted to PDF using any library like puppeteer.
                    The resume should be tailored for the given job description and should highlight  the candidate's strength and relevant experience.
                    The html content should be well formatted and structured , making it easy to read and visually appealing.
                    The resume must be strictly one page and give proper spacing and alignment to the content. The resume should be visually appealing and easy to read.
                    Add missing hard skills from the job description.
                    Write relevant skill gaps from resume
                    Add relevant experience from the job description if missing in the resume.
                    Increase the match score by adding relevant skills and experience from the job description.  
                    `


//         const resumePDFschema = z.object({
//   name: z.string(),
//   title: z.string().describe("Professional tagline, e.g. 'MERN Stack Developer'"),
//   contact: z.object({
//     email: z.string().optional(),
//     phone: z.string().optional(),
//     location: z.string().optional(),
//     linkedin: z.string().optional(),
//     github: z.string().optional(),
//   }).describe("ONLY include fields that appear in the source resume or self-description. Never invent a contact detail that isn't there."),
//   summary: z.string().describe("2-3 sentence summary tailored to the job description"),
//   skills: z.array(z.string()).describe("Ordered most-relevant-to-job-description first"),
//   experience: z.array(z.object({
//     role: z.string(),
//     organization: z.string(),
//     duration: z.string(),
//     bullets: z.array(z.string()).describe("Each bullet follows: action verb + what was done + quantifiable result where the source data supports it")
//   })),
//   projects: z.array(z.object({
//     name: z.string(),
//     stack: z.string(),
//     bullets: z.array(z.string())
//   })),
//   education: z.array(z.object({
//     institution: z.string(),
//     degree: z.string(),
//     duration: z.string(),
//     detail: z.string().optional().describe("e.g. CGPA, honors")
//   })),
//   certifications: z.array(z.string()).optional(),
// });

//         const prompt = `You are a resume writer. Extract and rewrite the candidate's resume content
// tailored to the job description below, as structured data — not HTML.

// ### Candidate Resume
// ${resume}

// ### Candidate Self Description
// ${selfDescription}

// ### Job Description
// ${jobDescription}

// Rules:
// 1. Use ONLY the candidate's real experience, skills, and projects. Reword and reorder
//    them to match the job description's language — never invent skills, employers,
//    tools, or achievements that aren't grounded in the source data.
// 2. Never fabricate contact details (email, phone, links). Only include what's actually
//    present in the resume or self description; omit fields that aren't there.
// 3. Every bullet should follow: strong action verb → what was done → quantifiable
//    impact (only include numbers that exist in or can be fairly inferred from the source).
// 4. Order skills and experience bullets by relevance to the job description, most
//    relevant first.
// 5. Keep the summary sharp and specific to this role — no generic filler like
//    "hardworking team player" without evidence.
// 6. Total content should be dense enough for one page at 10px body text, roughly:
//    3-5 skills categories, 2-4 roles with 2-4 bullets each, 1-2 projects.
// `;

        const JSONSchema = z.toJSONSchema(resumePDFschema);
        // console.log(JSONSchema)

        const response= await client.models.generateContent({
            model:"gemini-3-flash-preview",
            contents:prompt,
            config:{
              responseMimeType:"application/json",
              responseSchema:JSONSchema
            }
        })
            //   console.log("Response text" ,response.text )
        const jsonContent = resumePDFschema.parse(
            JSON.parse(response.text)
        )
            //   console.log(JSON.parse(response.text))
            //   console.log(jsonContent)

        const pdfBuffer = await generatePdfFromHtml(jsonContent.html)
        // console.log("pdfBuffer", pdfBuffer)
        return pdfBuffer

    }
    catch (err) {
        console.log("Error generating resume PDF:", err);
    }
}



module.exports = { generateInterviewReport, generateResumePDF }






// const { GoogleGenAI } = require("@google/genai")
// const { z } = require('zod')
// const puppeteer = require('puppeteer');

// const client = new GoogleGenAI({
//     apiKey: "AQ.Ab8RN6ICI_VzgQsXz7M6dbv6BOzq-3JxuQRgoRbbf3d_CLxWxQ"
// });

// const interviewReportSchema = z.object({
//     matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
//     technicalQuestions: z.array(z.object({
//         question: z.string().describe("The technical question can be asked in the interview"),
//         intention: z.string().describe("The intention of interviewer behind asking this question"),
//         answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
//     })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
//     behavioralQuestions: z.array(z.object({
//         question: z.string().describe("The technical question can be asked in the interview"),
//         intention: z.string().describe("The intention of interviewer behind asking this question"),
//         answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
//     })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
//     skillGaps: z.array(z.object({
//         skill: z.string().describe("The skill which the candidate is lacking"),
//         severity: z.enum(["low", "medium", "high"]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
//     })).describe("List of skill gaps in the candidate's profile along with their severity"),
//     preparationPlan: z.array(z.object({
//         day: z.number().describe("The day number in the preparation plan, starting from 1"),
//         focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
//         tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
//     })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
//     title: z.string().describe("The title of the job for which the interview report is generated"),
// })


// async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
//     const prompt = `
// You are an experienced Senior Software Engineer and Technical Interview Coach.

// Your task is to analyze a candidate's profile and compare it with the given job description.

// ### Candidate Resume
// ${resume}

// ### Candidate Self Description
// ${selfDescription}

// ### Job Description
// ${jobDescription}

// Analyze the candidate carefully and perform the following tasks:

// 1. Calculate a match score between 0 and 100 based on how well the candidate matches the job description.

// 2. Generate 8-10 technical interview questions.
//    For each question provide:
//    - question
//    - intention (why the interviewer asks it)
//    - answer (how the candidate should answer)

// 3. Generate 5-7 behavioral interview questions.
//    For each question provide:
//    - question
//    - intention
//    - answer

// 4. Identify all important skill gaps between the resume and the job description.
//    For each skill gap provide:
//    - skill
//    - severity
//      (only one of: low, medium, high)

// 5. Create a preparation plan.
//    Generate a day-wise interview preparation roadmap.
//    For each day provide:
//    - day
//    - focus
//    - tasks

// 6. Generate the exact job title from the job description.

// Important Instructions:

// - Compare the resume with the job description carefully.
// - Do not assume skills that are not mentioned.
// - Keep answers realistic and practical.
// - Interview questions should be relevant to the job description.
// - Preparation plan should directly improve the identified skill gaps.
// - Return ONLY valid JSON.
// - Do NOT include markdown.
// - Do NOT include explanations.
// - Do NOT add extra fields.
// - The response MUST strictly follow the provided response schema.
// `;

//     const jsonSchema = z.toJSONSchema(interviewReportSchema);

//     const response = await client.models.generateContent({
//         model: "gemini-3-flash-preview",
//         contents: prompt,
//         config: {
//             responseMimeType: "application/json",
//             responseSchema: jsonSchema
//         },
//     })

//     const report = interviewReportSchema.parse(
//         JSON.parse(response.text)
//     );

//     return report;
// }


// async function generatePdfFromHtml(htmlContent) {
//     try {
//         const browser = await puppeteer.launch();
//         const page = await browser.newPage();
//         await page.setContent(htmlContent, { waitUntil: "networkidle0" })

//         const pdfBuffer = await page.pdf({
//             format: "A4", margin: {
//                 top: "20mm",
//                 bottom: "20mm",
//                 left: "15mm",
//                 right: "15mm"
//             }
//         })
//         await browser.close()
//         return pdfBuffer
//     }
//     catch (err) {
//         console.log("Error generating PDF from HTML:", err);
//     }
// }

// async function generateResumePDF({ resume, jobDescription, selfDescription }) {
//     try {
//         const resumePDFschema = z.object({
//             html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
//         })
//         const prompt = `Generate resume for a candidate with the following details
//                    Resume:${resume},
//                     Self Description: ${selfDescription}
//                     job description :${jobDescription}
                    
//                     the resume should be a JSON object with a single field "html" which contains the HTML content of the
//                     resume which can be converted to PDF using any library like puppeteer.
//                     The resume should be tailored for the given job description and should highlight the candidate's strength and relevant experience.
//                     The html content should be well formatted and structured, making it easy to read and visually appealing.
//                     `

//         const jsonSchema = z.toJSONSchema(resumePDFschema);

//         const response = await client.models.generateContent({
//             model: "gemini-3-flash-preview",
//             contents: prompt,
//             config: {
//                 responseMimeType: "application/json",
//                 responseSchema: jsonSchema
//             }
//         })

//         const jsonContent = resumePDFschema.parse(
//             JSON.parse(response.text)
//         )
//         const pdfBuffer = await generatePdfFromHtml(jsonContent.html)
//         return pdfBuffer
//     }
//     catch (err) {
//         console.log("Error generating resume PDF:", err);
//     }
//     throw err;
// }

// module.exports = { generateInterviewReport, generateResumePDF }