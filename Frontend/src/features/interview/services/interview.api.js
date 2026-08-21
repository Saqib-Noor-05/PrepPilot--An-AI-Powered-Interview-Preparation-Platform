import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
})

/**
 *  @description Service function to generate interview report by sending job description, self-description and resume file to the backend API.
 */
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile, onUploadProgress }) => {
    const formData = new FormData();
    formData.append("jobDescription", jobDescription)
    formData.append("selfDescription", selfDescription)
    formData.append("resume", resumeFile)

    const response = await api.post("/api/interview/", formData, {
        onUploadProgress: (progressEvent) => {
            if (!progressEvent.total) return;
            const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress?.(progress);
        },

    });
    return response.data
}

/**
 * @description Service function to get interview report by InterviewId
 *
 */
export const getInterviewReportById = async (interviewId) => {
    try {
        const response = await api.get(`/api/interview/report/${interviewId}`)
        return response.data
    }
    catch (err) {
        console.log(err)
    }
}
/**
 * @description Service function to get all interview reports of a logged in user by userId
 */
export const getAllInterviewReports = async () => {
    try {
        const response = await api.get(`/api/interview/`)
        return response.data;
    }
    catch (err) {
        console.log(err)
    }
}

export const getResumePDF = async (interviewId) => {
    const response = await api.post(`/api/interview/resume-pdf/${interviewId}/`, null, {
        responseType: "blob"
    })
    return response.data;

}
