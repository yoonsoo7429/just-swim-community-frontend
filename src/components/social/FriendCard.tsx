"use client";

import React from "react";
import styles from "./FriendCard.module.scss";

interface User {
  id: number;
  name: string;
  profileImage?: string;
  userLevel: number;
  title?: string;
}

interface SocialActivity {
  id: number;
  type: string;
  title: string;
  description?: string;
  createdAt: string;
}

interface FriendInfo {
  user: User;
  mutualFriends: number;
  recentActivity?: SocialActivity;
}

interface FriendCardProps {
  friendInfo: FriendInfo;
  onMessage?: (friendId: number) => void;
  onViewProfile?: (friendId: number) => void;
  onChallenge?: (friendId: number) => void;
}

export default function FriendCard({
  friendInfo,
  onMessage,
  onViewProfile,
  onChallenge,
}: FriendCardProps) {
  const { user, mutualFriends, recentActivity } = friendInfo;

  const getLevelIcon = (level: number): string => {
    if (level >= 10) return "👑";
    if (level >= 8) return "💎";
    if (level >= 6) return "🏆";
    if (level >= 4) return "💪";
    if (level >= 2) return "🏊";
    return "🌊";
  };

  const getActivityIcon = (type: string): string => {
    switch (type) {
      case "swimming_record":
        return "🏊‍♂️";
      case "goal_completed":
        return "🎯";
      case "badge_earned":
        return "🏆";
      case "level_up":
        return "⭐";
      case "challenge_completed":
        return "🏅";
      case "streak_milestone":
        return "🔥";
      default:
        return "📝";
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "방금 전";
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)}일 전`;
    return date.toLocaleDateString();
  };

  return (
    <div className={styles.friendCard}>
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className={styles.avatarImage}
              />
            ) : (
              <span className={styles.avatarText}>
                {user.name?.[0]?.toUpperCase() || "?"}
              </span>
            )}
            <span className={styles.levelBadge}>
              {getLevelIcon(user.userLevel)}
            </span>
          </div>

          <div className={styles.details}>
            <h3 className={styles.name}>{user.name}</h3>
            <div className={styles.meta}>
              <span className={styles.level}>Lv.{user.userLevel}</span>
              {user.title && <span className={styles.title}>{user.title}</span>}
            </div>

            {mutualFriends > 0 && (
              <div className={styles.mutualFriends}>
                👥 공통 친구 {mutualFriends}명
              </div>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.actionBtn}
            onClick={() => onMessage?.(user.id)}
            title="메시지"
          >
            💬
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => onChallenge?.(user.id)}
            title="챌린지 도전"
          >
            ⚔️
          </button>
          <button
            className={styles.profileBtn}
            onClick={() => onViewProfile?.(user.id)}
          >
            프로필 보기
          </button>
        </div>
      </div>

      {recentActivity && (
        <div className={styles.recentActivity}>
          <div className={styles.activityHeader}>
            <span className={styles.activityIcon}>
              {getActivityIcon(recentActivity.type)}
            </span>
            <span className={styles.activityTime}>
              {formatTimeAgo(recentActivity.createdAt)}
            </span>
          </div>

          <div className={styles.activityContent}>
            <h4 className={styles.activityTitle}>{recentActivity.title}</h4>
            {recentActivity.description && (
              <p className={styles.activityDescription}>
                {recentActivity.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
