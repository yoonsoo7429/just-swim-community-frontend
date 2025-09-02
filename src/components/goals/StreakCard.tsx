"use client";

import React from "react";
import styles from "./StreakCard.module.scss";

interface StreakInfo {
  type: string;
  currentStreak: number;
  longestStreak: number;
  canUseFreezer: boolean;
  nextMilestone: number;
  daysUntilBreak: number;
}

interface StreakCardProps {
  streakInfo: StreakInfo;
  onUseFreezer?: () => void;
}

export default function StreakCard({
  streakInfo,
  onUseFreezer,
}: StreakCardProps) {
  const getTypeInfo = (type: string) => {
    switch (type) {
      case "swimming":
        return {
          icon: "🏊‍♂️",
          title: "수영 스트릭",
          description: "연속 수영일",
        };
      case "goal_completion":
        return {
          icon: "🎯",
          title: "목표 달성 스트릭",
          description: "연속 목표 달성",
        };
      case "login":
        return {
          icon: "📱",
          title: "로그인 스트릭",
          description: "연속 접속일",
        };
      default:
        return {
          icon: "🔥",
          title: "스트릭",
          description: "연속 기록",
        };
    }
  };

  const getMilestoneProgress = (current: number, next: number) => {
    const milestones = [7, 14, 30, 60, 100, 365];
    const prevMilestone = milestones.reverse().find((m) => m < current) || 0;
    return {
      progress: ((current - prevMilestone) / (next - prevMilestone)) * 100,
      prevMilestone,
    };
  };

  const getStreakMessage = (days: number) => {
    if (days === 0) return "새로운 스트릭을 시작해보세요!";
    if (days < 7) return "좋은 시작이에요! 계속 이어가세요.";
    if (days < 30) return "훌륭해요! 습관이 만들어지고 있어요.";
    if (days < 100) return "대단해요! 진정한 챔피언이에요.";
    return "전설적인 스트릭! 정말 놀라워요! 🏆";
  };

  const typeInfo = getTypeInfo(streakInfo.type);
  const { progress, prevMilestone } = getMilestoneProgress(
    streakInfo.currentStreak,
    streakInfo.nextMilestone
  );

  const isAtRisk = streakInfo.daysUntilBreak <= 1;

  return (
    <div className={`${styles.streakCard} ${isAtRisk ? styles.atRisk : ""}`}>
      <div className={styles.header}>
        <div className={styles.typeInfo}>
          <span className={styles.icon}>{typeInfo.icon}</span>
          <div className={styles.titleSection}>
            <h3 className={styles.title}>{typeInfo.title}</h3>
            <p className={styles.description}>{typeInfo.description}</p>
          </div>
        </div>

        {streakInfo.canUseFreezer && isAtRisk && (
          <button
            className={styles.freezerBtn}
            onClick={onUseFreezer}
            title="스트릭 프리즈 사용"
          >
            🧊
          </button>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.streakDisplay}>
          <div className={styles.currentStreak}>
            <span className={styles.number}>{streakInfo.currentStreak}</span>
            <span className={styles.unit}>일</span>
          </div>
          <div className={styles.streakStatus}>
            <span className={styles.flame}>🔥</span>
            <span className={styles.message}>
              {getStreakMessage(streakInfo.currentStreak)}
            </span>
          </div>
        </div>

        <div className={styles.milestoneSection}>
          <div className={styles.milestoneHeader}>
            <span className={styles.milestoneText}>
              다음 마일스톤: {streakInfo.nextMilestone}일
            </span>
            <span className={styles.remaining}>
              {streakInfo.nextMilestone - streakInfo.currentStreak}일 남음
            </span>
          </div>

          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>

          <div className={styles.milestoneLabels}>
            <span className={styles.startLabel}>{prevMilestone}일</span>
            <span className={styles.endLabel}>
              {streakInfo.nextMilestone}일
            </span>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>최고 기록</span>
            <span className={styles.statValue}>
              {streakInfo.longestStreak}일
            </span>
          </div>

          <div className={styles.stat}>
            <span className={styles.statLabel}>스트릭 상태</span>
            <span
              className={`${styles.status} ${
                isAtRisk ? styles.warning : styles.active
              }`}
            >
              {isAtRisk ? "위험" : "활성"}
            </span>
          </div>

          {isAtRisk && (
            <div className={styles.stat}>
              <span className={styles.statLabel}>남은 시간</span>
              <span className={styles.statValue}>
                {streakInfo.daysUntilBreak === 0
                  ? "오늘까지"
                  : `${streakInfo.daysUntilBreak}일`}
              </span>
            </div>
          )}
        </div>

        {isAtRisk && (
          <div className={styles.warningMessage}>
            ⚠️ 스트릭이 끊어질 위험이 있어요!
            {streakInfo.canUseFreezer && " 프리즈를 사용하거나 "}
            오늘 활동을 완료하세요.
          </div>
        )}
      </div>
    </div>
  );
}
