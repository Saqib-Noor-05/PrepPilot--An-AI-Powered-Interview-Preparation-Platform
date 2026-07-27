import { useContext, useEffect } from "react";
import {
  getAllInterviewReports,
  getInterviewReportById,
  generateInterviewReport,
  getResumePDF,
} from "../services/interview.api";
import { InterviewContext } from "../interview.context";
import { useParams } from "react-router";

export const useInterview = () => {
  const { interviewId } = useParams();
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error("useInterview must be used within  an InterviewProvider");
  }

  const { loading, setLoading, report, setReport, reports, setReports } =
    context;

  const generateReport = async ({
    jobDescription,
    selfDescription,
    resumeFile,
  }) => {
    setLoading(true);
    let response = null;
    try {
      response = await generateInterviewReport({
        jobDescription,
        selfDescription,
        resumeFile,
      });
      setReport(response.interviewReport);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }

    return response.interviewReport;
  };

  const getReportById = async (interviewId) => {
    setLoading(true);
    let response = null;
    try {
      response = await getInterviewReportById(interviewId);
      setReport(response.interviewReport);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
    return response.interviewReport;
  };

  const getReports = async () => {
    setLoading(true);
    let response = null;
    try {
      const response = await getAllInterviewReports();
      setReports(response.interviewReports);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
    return response.interviewReports;
  };

  const generateResumePDF = async (interviewId) => {
    setLoading(true);
    let response;
    try {
      response = await getResumePDF(interviewId);
      const url = window.URL.createObjectURL(
        new Blob([response], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `resume_${interviewId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.log(err);
      throw err;
    } finally {
      setLoading(false);
    }
    // return
  };

  useEffect(() => {
    if (interviewId) {
      getReportById(interviewId);
    } else {
      getReports();
    }
  }, [interviewId]);

  return {
    loading,
    report,
    reports,
    generateReport,
    getReportById,
    getReports,
    generateResumePDF,
  };
};
