"use client";

import React from "react";
import styles from "./LevelProgress.module.scss";

interface LevelProgressProps {
  currentLevel: number;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercentage: number;
  title: string;
  nextTitle: string;
  size?: "small" | "medium" | "large";
  showDetails?: boolean;
}

export default function LevelProgress({
  currentLevel,
  currentXP,
  xpForCurrentLevel,
  xpForNextLevel,
  progressPercentage,
  title,
  nextTitle,
  size = "medium",
  showDetails = true,
}: LevelProgressProps) {
  const xpInCurrentLevel = currentXP - xpForCurrentLevel;
  const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;
  const xpRemaining = xpForNextLevel - currentXP;

  const getLevelIcon = (level: number): string => {
    if (level >= 10) return "👑";
    if (level >= 8) return "💎";
    if (level >= 6) return "🏆";
    if (level >= 4) return "💪";
    if (level >= 2) return "🏊";
    return "🌊";
  };

  return (
    <div className={`${styles.levelProgress} ${styles[size]}`}>
      <div className={styles.header}>
        <div className={styles.levelInfo}>
          <span className={styles.levelIcon}>{getLevelIcon(currentLevel)}</span>
          <div className={styles.levelText}>
            <span className={styles.level}>레벨 {currentLevel}</span>
            {showDetails && <span className={styles.title}>{title}</span>}
          </div>
        </div>

        {showDetails && (
          <div className={styles.xpInfo}>
            <span className={styles.currentXP}>
              {currentXP.toLocaleString()} XP
            </span>
          </div>
        )}
      </div>

      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${Math.min(100, progressPercentage)}%` }}
          >
            <div className={styles.progressGlow} />
          </div>
        </div>

        {showDetails && (
          <div className={styles.progressText}>
            <span className={styles.progress}>
              {xpInCurrentLevel.toLocaleString()} /{" "}
              {xpNeededForNext.toLocaleString()} XP
            </span>
            <span className={styles.remaining}>
              다음 레벨까지 {xpRemaining.toLocaleString()} XP
            </span>
          </div>
        )}
      </div>

      {showDetails && currentLevel < 12 && (
        <div className={styles.nextLevel}>
          <span className={styles.nextLevelText}>
            다음: {getLevelIcon(currentLevel + 1)} {nextTitle}
          </span>
        </div>
      )}

      {currentLevel >= 12 && showDetails && (
        <div className={styles.maxLevel}>
          <span className={styles.maxLevelText}>🎉 최고 레벨 달성! 🎉</span>
        </div>
      )}
    </div>
  );
}
