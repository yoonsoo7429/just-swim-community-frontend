import React from "react";
import styles from "./styles.module.scss";

interface Progress {
  completedSessions: number;
  totalSessions: number;
  progressPercentage: number;
  status: "active" | "completed" | "paused" | "abandoned";
  startDate: string;
  lastCompletedDate: string;
}

interface ProgramProgressCardProps {
  program: any;
  progress: Progress;
  onCompleteSession: (sessionId: string) => void;
}

const ProgramProgressCard: React.FC<ProgramProgressCardProps> = ({
  program,
  progress,
  onCompleteSession,
}) => {
  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "진행 중";
      case "completed":
        return "완료됨";
      case "paused":
        return "일시정지";
      case "abandoned":
        return "중단됨";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#4CAF50";
      case "completed":
        return "#2196F3";
      case "paused":
        return "#FF9800";
      case "abandoned":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>프로그램 진행률</h3>
        <span
          className={styles.status}
          style={{ backgroundColor: getStatusColor(progress.status) }}
        >
          {getStatusText(progress.status)}
        </span>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressInfo}>
          <span className={styles.progressText}>
            {progress.completedSessions} / {progress.totalSessions} 세션 완료
          </span>
          <span className={styles.percentage}>
            {progress.progressPercentage.toFixed(1)}%
          </span>
        </div>
        <div className={styles.barContainer}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress.progressPercentage}%` }}
          />
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.label}>시작일</span>
          <span className={styles.value}>
            {progress.startDate ? formatDate(progress.startDate) : "미정"}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.label}>마지막 완료일</span>
          <span className={styles.value}>
            {progress.lastCompletedDate
              ? formatDate(progress.lastCompletedDate)
              : "없음"}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.label}>남은 세션</span>
          <span className={styles.value}>
            {progress.totalSessions - progress.completedSessions}개
          </span>
        </div>
      </div>

      {progress.status === "active" && (
        <div className={styles.actions}>
          <button className={styles.pauseButton}>일시정지</button>
          <button className={styles.abandonButton}>중단하기</button>
        </div>
      )}

      {progress.status === "paused" && (
        <div className={styles.actions}>
          <button className={styles.resumeButton}>재개하기</button>
          <button className={styles.abandonButton}>중단하기</button>
        </div>
      )}

      {progress.status === "completed" && (
        <div className={styles.completionMessage}>
          <p>🎉 축하합니다! 프로그램을 완료했습니다!</p>
          <button className={styles.reviewButton}>리뷰 작성하기</button>
        </div>
      )}
    </div>
  );
};

export default ProgramProgressCard;
