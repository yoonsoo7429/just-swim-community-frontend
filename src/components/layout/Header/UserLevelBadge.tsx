"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./UserLevelBadge.module.scss";

interface UserProgress {
  currentLevel: number;
  currentXP: number;
  progressPercentage: number;
  title: string;
}

interface RecentBadge {
  id: number;
  earnedAt: string;
  badge: {
    name: string;
    icon: string;
    tier: string;
  };
}

interface UserLevelBadgeProps {
  userId: number;
}

export default function UserLevelBadge({ userId }: UserLevelBadgeProps) {
  const router = useRouter();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [recentBadges, setRecentBadges] = useState<RecentBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      // 레벨 진행도 조회
      const progressResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/levels/my/progress`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        setUserProgress(progressData);
      }

      // 최근 배지 조회 (최대 3개)
      const badgesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/badges/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (badgesResponse.ok) {
        const badgesData = await badgesResponse.json();
        setRecentBadges(badgesData.slice(0, 3));
      }
    } catch (error) {
      console.error("Failed to fetch user level/badge data:", error);
    } finally {
      setLoading(false);
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

  const handleLevelClick = () => {
    router.push("/levels");
  };

  const handleBadgesClick = () => {
    router.push("/badges");
  };

  if (loading || !userProgress) {
    return (
      <div className={styles.skeleton}>
        <div className={styles.skeletonLevel}></div>
        <div className={styles.skeletonBadges}></div>
      </div>
    );
  }

  return (
    <div className={styles.userLevelBadge}>
      {/* 레벨 정보 */}
      <div className={styles.levelInfo} onClick={handleLevelClick}>
        <div className={styles.levelIcon}>
          {getLevelIcon(userProgress.currentLevel)}
        </div>
        <div className={styles.levelDetails}>
          <span className={styles.level}>Lv.{userProgress.currentLevel}</span>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${userProgress.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 최근 배지 (최대 3개) */}
      {recentBadges.length > 0 && (
        <div className={styles.badgesInfo} onClick={handleBadgesClick}>
          <div className={styles.badgeIcons}>
            {recentBadges.map((userBadge, index) => (
              <div
                key={userBadge.id}
                className={styles.badgeIcon}
                style={{ zIndex: recentBadges.length - index }}
                title={userBadge.badge.name}
              >
                {userBadge.badge.icon}
              </div>
            ))}
          </div>
          <span className={styles.badgeCount}>+{recentBadges.length}</span>
        </div>
      )}
    </div>
  );
}
