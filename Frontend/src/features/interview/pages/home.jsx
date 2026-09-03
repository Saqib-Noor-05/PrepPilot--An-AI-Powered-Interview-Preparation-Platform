import { useState, useRef } from "react";
import "../style/style.scss";
import "../style/skeleton.scss";
import InterviewSkeleton from "../component/InterviewSkeleton.jsx";
import { useInterview } from "../hooks/useInterview.jsx";
import { useNavigate } from "react-router";

const Home = () => {
  const { loading, generateReport, reports } = useInterview();

  // const [jobDescriptionUrl, setJobDescriptionUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const resumeInputRef = useRef(null);

  const navigate = useNavigate();

  const handleGenerateReport = async () => {
    const resumeFile = resumeInputRef.current?.files?.[0];

    // Make sure user provides at least one JD option
    if (!jobDescription.trim()) {
      alert("Please provide the full Job Description.");
      return;
    }

    // Make sure user provides resume or self description
    if (!resumeFile && !selfDescription.trim()) {
      alert("Please upload your resume or provide a self-description.");
      return;
    }

    try {
      const data = await generateReport({
        resumeFile,

        // Profile information
        selfDescription,

        // Job description information
        jobDescription,
        // jobDescriptionUrl,

        // Upload progress
        onUploadProgress: (progress) => {
          console.log("UPLOAD:", progress);
          setUploadProgress(progress);
        },
      });

      navigate(`/interview/${data._id}`);
    } catch (error) {
      alert("Failed to generate interview strategy:", error);
      console.error("Failed to generate interview strategy:", error);
    }
  };

  if (loading) {
    return <InterviewSkeleton />;
  }

  return (
    <div className="home-page">
      {/* =========================================================
          PAGE HEADER
      ========================================================= */}
      <header className="page-header">
        <h1>
          Create Your Custom <span className="highlight">Interview Plan</span>
        </h1>

        <p>
          Let our AI analyze the job requirements and your unique profile to
          build a winning strategy.
        </p>
      </header>

      {/* =========================================================
          MAIN CARD
      ========================================================= */}
      <div className="interview-card">
        <div className="interview-card__body">
          {/* =====================================================
              LEFT PANEL - JOB DESCRIPTION
          ===================================================== */}
          <div className="panel panel--left">
            {/* Header */}
            <div className="panel__header">
              <span className="panel__icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />

                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </span>

              <h2>Target Job Description</h2>

              <span className="badge badge--required">Required</span>
            </div>

            {/* =================================================
                OPTION 1 - JOB DESCRIPTION URL
            ================================================= */}
            {/* <div className="jd-option">
              <label className="section-label" htmlFor="jobDescriptionUrl">
                Job Description URL
              </label>

              <input
                id="jobDescriptionUrl"
                type="url"
                value={jobDescriptionUrl}
                onChange={(e) => setJobDescriptionUrl(e.target.value)}
                className="panel__input"
                placeholder="Paste the job posting URL here..."
              />
            </div>

            {/* =================================================
                OR DIVIDER
            ================================================= */}
            {/* <div className="or-divider">
              <span>OR</span>
            </div>  */}

            {/* =================================================
                OPTION 2 - FULL JOB DESCRIPTION
            ================================================= */}
            <div className="jd-option jd-option--description">
              <label className="section-label" htmlFor="jobDescription">
                Full Job Description
              </label>

              <div className="textarea-wrapper">
                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="panel__textarea"
                  placeholder={`Paste the full job description here...

e.g. "Senior Frontend Engineer requires proficiency in React, TypeScript, and large-scale system design..."`}
                  maxLength={5000}
                />

                <div className="char-counter">
                  {jobDescription.length} / 5000 chars
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              VERTICAL DIVIDER
          ===================================================== */}
          <div className="panel-divider" />

          {/* =====================================================
              RIGHT PANEL - PROFILE
          ===================================================== */}
          <div className="panel panel--right">
            {/* Header */}
            <div className="panel__header">
              <span className="panel__icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>

              <h2>Your Profile</h2>
            </div>

            {/* =================================================
                UPLOAD RESUME
            ================================================= */}
            <div className="upload-section">
              <label className="section-label">
                Upload Resume
                <span className="badge badge--best">Best Results</span>
              </label>

              <label className="dropzone" htmlFor="resume">
                <span className="dropzone__icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="16 16 12 12 8 16" />

                    <line x1="12" y1="12" x2="12" y2="21" />

                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                  </svg>
                </span>

                <p className="dropzone__title">
                  Click to upload or drag &amp; drop
                </p>

                <p className="dropzone__subtitle">PDF or DOCX (Max 5MB)</p>

                <input
                  ref={resumeInputRef}
                  hidden
                  type="file"
                  id="resume"
                  name="resume"
                  accept=".pdf,.docx"
                />
              </label>
            </div>

            {/* =================================================
                OR DIVIDER
            ================================================= */}
            <div className="or-divider">
              <span>OR</span>
            </div>

            {/* =================================================
                SELF DESCRIPTION
            ================================================= */}
            <div className="self-description">
              <label className="section-label" htmlFor="selfDescription">
                Quick Self-Description
              </label>

              <textarea
                id="selfDescription"
                name="selfDescription"
                value={selfDescription}
                onChange={(e) => setSelfDescription(e.target.value)}
                className="panel__textarea panel__textarea--short"
                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
              />
            </div>

            {/* =================================================
                INFO BOX
            ================================================= */}
            <div className="info-box">
              <span className="info-box__icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="12" cy="12" r="10" />

                  <line
                    x1="12"
                    y1="8"
                    x2="12"
                    y2="12"
                    stroke="#1a1f27"
                    strokeWidth="2"
                  />

                  <line
                    x1="12"
                    y1="16"
                    x2="12.01"
                    y2="16"
                    stroke="#1a1f27"
                    strokeWidth="2"
                  />
                </svg>
              </span>

              <p>
                Either a <strong>Resume</strong> or a{" "}
                <strong>Self Description</strong> is required to generate a
                personalized plan.
              </p>
            </div>
          </div>
        </div>

        {/* =======================================================
            CARD FOOTER
        ======================================================= */}
        <div className="interview-card__footer">
          <span className="footer-info">
            AI-Powered Strategy Generation &bull; Approx 30s
          </span>

          <button
            onClick={handleGenerateReport}
            className="generate-btn"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
            </svg>
            Generate My Interview Strategy
          </button>
        </div>
      </div>

      {/* =========================================================
          RECENT REPORTS
      ========================================================= */}
      {reports.length > 0 && (
        <section className="recent-reports">
          <h2>My Recent Interview Plans</h2>

          <ul className="reports-list">
            {reports.map((report) => (
              <li
                key={report._id}
                className="report-item"
                onClick={() => navigate(`/interview/${report._id}`)}
              >
                <h3>{report.title || "Untitled Position"}</h3>

                <p className="report-meta">
                  Generated on {new Date(report.createdAt).toLocaleDateString()}
                </p>

                <p
                  className={`match-score ${
                    report.matchScore >= 80
                      ? "score--high"
                      : report.matchScore >= 60
                        ? "score--mid"
                        : "score--low"
                  }`}
                >
                  Match Score: {report.matchScore}%
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* =========================================================
          PAGE FOOTER
      ========================================================= */}
      <footer className="page-footer">
        <a href="#">Privacy Policy</a>

        <a href="#">Terms of Service</a>

        <a href="#">Help Center</a>
      </footer>
    </div>
  );
};

export default Home;
