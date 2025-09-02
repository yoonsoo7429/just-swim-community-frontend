"use client";

import React from "react";
import styles from "./GoalCard.module.scss";

interface Goal {
  id: number;
  type: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: string;
  difficulty: string;
  startDate: string;
  endDate: string;
  progressPercentage: number;
  rewardXP: number;
  rewardPoints: number;
}

interface GoalProgress {
  goal: Goal;
  progressPercentage: number;
  remainingDays: number;
  isOnTrack: boolean;
  dailyTarget: number;
}

interface GoalCardProps {
  goal: Goal;
  progress?: GoalProgress;
  onComplete?: (goalId: number) => void;
  onEdit?: (goalId: number) => void;
  onDelete?: (goalId: number) => void;
}

export default function GoalCard({
  goal,
  progress,
  onComplete,
  onEdit,
  onDelete,
}: GoalCardProps) {
  const getTypeIcon = (type: string): string => {
    switch (type) {
      case "weekly_distance":
        return "📊";
      case "monthly_distance":
        return "📈";
      case "streak":
        return "🔥";
      case "stroke_mastery":
        return "🏊‍♂️";
      case "level_up":
        return "⭐";
      case "session_count":
        return "🏊";
      case "duration":
        return "⏱️";
      case "challenge_linked":
        return "🏆";
      default:
        return "🎯";
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case "easy":
        return "#4caf50";
      case "medium":
        return "#ff9800";
      case "hard":
        return "#f44336";
      case "extreme":
        return "#9c27b0";
      default:
        return "#2196f3";
    }
  };

  const getDifficultyLabel = (difficulty: string): string => {
    switch (difficulty) {
      case "easy":
        return "쉬움";
      case "medium":
        return "보통";
      case "hard":
        return "어려움";
      case "extreme":
        return "극한";
      default:
        return "보통";
    }
  };

  const formatValue = (value: number, unit: string): string => {
    if (unit === "m") {
      return value >= 1000 ? `${(value / 1000).toFixed(1)}km` : `${value}m`;
    }
    return `${value.toLocaleString()}${unit}`;
  };

  const progressData = progress || {
    progressPercentage: goal.progressPercentage,
    remainingDays: Math.max(
      0,
      Math.ceil(
        (new Date(goal.endDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    ),
    isOnTrack: goal.progressPercentage >= 50,
    dailyTarget: 0,
  };

  const canComplete =
    goal.status === "active" && progressData.progressPercentage >= 100;

  return (
    <div className={`${styles.goalCard} ${styles[goal.status]}`}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <span className={styles.icon}>{getTypeIcon(goal.type)}</span>
          <div className={styles.titleInfo}>
            <h3 className={styles.title}>{goal.title}</h3>
            <p className={styles.description}>{goal.description}</p>
          </div>
        </div>

        <div className={styles.actions}>
          {canComplete && (
            <button
              className={styles.completeBtn}
              onClick={() => onComplete?.(goal.id)}
              title="목표 완료"
            >
              ✅
            </button>
          )}
          <button
            className={styles.editBtn}
            onClick={() => onEdit?.(goal.id)}
            title="편집"
          >
            ✏️
          </button>
          <button
            className={styles.deleteBtn}
            onClick={() => onDelete?.(goal.id)}
            title="삭제"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span className={styles.progressText}>
              {formatValue(goal.currentValue, goal.unit)} /{" "}
              {formatValue(goal.targetValue, goal.unit)}
            </span>
            <span className={styles.percentage}>
              {progressData.progressPercentage}%
            </span>
          </div>

          <div className={styles.progressBar}>
            <div
              className={`${styles.progressFill} ${
                progressData.isOnTrack ? styles.onTrack : styles.behindTrack
              }`}
              style={{
                width: `${Math.min(100, progressData.progressPercentage)}%`,
              }}
            />
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>남은 기간</span>
            <span className={styles.statValue}>
              {progressData.remainingDays}일
            </span>
          </div>

          <div className={styles.stat}>
            <span className={styles.statLabel}>난이도</span>
            <span
              className={styles.difficulty}
              style={{ color: getDifficultyColor(goal.difficulty) }}
            >
              {getDifficultyLabel(goal.difficulty)}
            </span>
          </div>

          <div className={styles.stat}>
            <span className={styles.statLabel}>보상</span>
            <span className={styles.reward}>
              {goal.rewardXP}XP + {goal.rewardPoints}P
            </span>
          </div>

          {progressData.dailyTarget > 0 && (
            <div className={styles.stat}>
              <span className={styles.statLabel}>일일 목표</span>
              <span className={styles.statValue}>
                {formatValue(progressData.dailyTarget, goal.unit)}
              </span>
            </div>
          )}
        </div>

        {!progressData.isOnTrack && goal.status === "active" && (
          <div className={styles.warningMessage}>
            ⚠️ 목표 달성을 위해 더 노력이 필요합니다!
          </div>
        )}
      </div>
    </div>
  );
}
