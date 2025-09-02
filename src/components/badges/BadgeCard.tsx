"use client";

import React from "react";
import styles from "./BadgeCard.module.scss";

interface Badge {
  id: number;
  key: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  category: string;
  points: number;
  isActive: boolean;
}

interface UserBadge {
  id: number;
  earnedAt: string;
  badge: Badge;
}

interface BadgeCardProps {
  badge: Badge;
  isEarned?: boolean;
  earnedAt?: string;
  size?: "small" | "medium" | "large";
}

export default function BadgeCard({
  badge,
  isEarned = false,
  earnedAt,
  size = "medium",
}: BadgeCardProps) {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case "bronze":
        return "#cd7f32";
      case "silver":
        return "#c0c0c0";
      case "gold":
        return "#ffd700";
      case "platinum":
        return "#e5e4e2";
      default:
        return "#gray";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className={`${styles.badgeCard} ${styles[size]} ${
        isEarned ? styles.earned : styles.notEarned
      }`}
    >
      <div
        className={styles.iconContainer}
        style={{ borderColor: getTierColor(badge.tier) }}
      >
        <span className={styles.icon}>{badge.icon}</span>
        {!isEarned && <div className={styles.overlay} />}
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{badge.name}</h3>
        <p className={styles.description}>{badge.description}</p>

        <div className={styles.metadata}>
          <span className={`${styles.tier} ${styles[badge.tier]}`}>
            {badge.tier.toUpperCase()}
          </span>
          <span className={styles.points}>+{badge.points}P</span>
        </div>

        {isEarned && earnedAt && (
          <div className={styles.earnedInfo}>
            <span className={styles.earnedText}>
              {formatDate(earnedAt)} 획득
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
