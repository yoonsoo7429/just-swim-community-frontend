"use client";

import React from "react";
import styles from "./LeaderboardCard.module.scss";

interface LeaderboardEntry {
  userId: number;
  user: {
    id: number;
    name: string;
    profileImage?: string;
    userLevel: number;
    title?: string;
  };
  rank: number;
  value: number;
  additionalInfo?: any;
}

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  valueUnit: string;
  showAdditionalInfo?: boolean;
  isCurrentUser?: boolean;
  onClick?: () => void;
}

export default function LeaderboardCard({
  entry,
  valueUnit,
  showAdditionalInfo = false,
  isCurrentUser = false,
  onClick,
}: LeaderboardCardProps) {
  const getRankIcon = (rank: number): string => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "";
    }
  };

  const getLevelIcon = (level: number): string => {
    if (level >= 10) return "👑";
    if (level >= 8) return "💎";
    if (level >= 6) return "🏆";
    if (level >= 4) return "💪";
    if (level >= 2) return "🏊";
    return "🌊";
  };

  const formatValue = (value: number, unit: string): string => {
    if (unit === "m") {
      return value >= 1000 ? `${(value / 1000).toFixed(1)}km` : `${value}m`;
    }
    return `${value.toLocaleString()}${unit}`;
  };

  return (
    <div
      className={`${styles.leaderboardCard} ${
        isCurrentUser ? styles.currentUser : ""
      } ${entry.rank <= 3 ? styles.topThree : ""}`}
      onClick={onClick}
    >
      <div className={styles.rankSection}>
        <div className={styles.rank}>
          {getRankIcon(entry.rank) || `#${entry.rank}`}
        </div>
        {entry.rank <= 3 && (
          <div className={styles.rankBadge}>TOP {entry.rank}</div>
        )}
      </div>

      <div className={styles.userSection}>
        <div className={styles.avatar}>
          {entry.user.profileImage ? (
            <img
              src={entry.user.profileImage}
              alt={entry.user.name}
              className={styles.avatarImage}
            />
          ) : (
            <span className={styles.avatarText}>
              {entry.user.name?.[0]?.toUpperCase() || "?"}
            </span>
          )}
        </div>

        <div className={styles.userInfo}>
          <div className={styles.userName}>
            {entry.user.name}
            {isCurrentUser && <span className={styles.youBadge}>YOU</span>}
          </div>
          <div className={styles.userMeta}>
            <span className={styles.levelIcon}>
              {getLevelIcon(entry.user.userLevel)}
            </span>
            <span className={styles.level}>Lv.{entry.user.userLevel}</span>
            {entry.user.title && (
              <span className={styles.title}>{entry.user.title}</span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.valueSection}>
        <div className={styles.value}>
          {formatValue(entry.value, valueUnit)}
        </div>

        {showAdditionalInfo && entry.additionalInfo && (
          <div className={styles.additionalInfo}>
            {entry.additionalInfo.sessionCount && (
              <span>{entry.additionalInfo.sessionCount}회</span>
            )}
            {entry.additionalInfo.totalPoints && (
              <span>{entry.additionalInfo.totalPoints}P</span>
            )}
            {entry.additionalInfo.averageDistance && (
              <span>평균 {entry.additionalInfo.averageDistance}m</span>
            )}
            {entry.additionalInfo.strokeType && (
              <span>{entry.additionalInfo.strokeType}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
