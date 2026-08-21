import Skeleton from "./Skeleton";

const SkeletonQuestionCard = () => (
  <div className="q-card q-card--skeleton">
    <div className="q-card__header">
      <Skeleton width="32px" height="20px" />
      <Skeleton width="70%" height="18px" />
    </div>
  </div>
);

const InterviewSkeleton = () => (
  <div className="interview-page">
    <div className="interview-layout">
      {/* Left Nav skeleton */}
      <nav className="interview-nav">
        <div className="nav-content">
          <Skeleton width="60%" height="12px" className="mb-16" />
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              width="100%"
              height="38px"
              radius="8px"
              className="mb-8"
            />
          ))}
        </div>
        <Skeleton width="100%" height="40px" radius="8px" />
      </nav>

      <div className="interview-divider" />

      {/* Center content skeleton */}
      <main className="interview-content">
        <div className="content-header">
          <Skeleton width="220px" height="24px" />
          <Skeleton width="80px" height="16px" />
        </div>
        <div className="q-list">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonQuestionCard key={i} />
          ))}
        </div>
      </main>

      <div className="interview-divider" />

      {/* Right sidebar skeleton */}
      <aside className="interview-sidebar">
        <div className="match-score">
          <Skeleton width="80px" height="12px" className="mb-8" />
          <Skeleton
            width="110px"
            height="110px"
            radius="50%"
            className="mb-8"
          />
          <Skeleton width="140px" height="12px" />
        </div>
        <div className="sidebar-divider" />
        <div className="skill-gaps">
          <Skeleton width="70px" height="12px" className="mb-8" />
          <div className="skill-gaps__list">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} width="90px" height="26px" radius="14px" />
            ))}
          </div>
        </div>
      </aside>
    </div>
  </div>
);

export default InterviewSkeleton;
