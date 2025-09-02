"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import LevelProgress from "@/components/levels/LevelProgress";
import styles from "./page.module.scss";

interface LevelInfo {
  level: number;
  requiredXP: number;
  title: string;
  perks: string[];
  icon: string;
}

interface UserLevelProgress {
  currentLevel: number;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercentage: number;
  title: string;
  nextTitle: string;
  totalXPEarned: number;
}

interface TopUser {
  id: number;
  name: string;
  userLevel: number;
  experience: number;
  title: string;
  profileImage?: string;
}

export default function LevelsPage() {
  const { user, isLoading } = useAuth();
  const [userProgress, setUserProgress] = useState<UserLevelProgress | null>(
    null
  );
  const [allLevels, setAllLevels] = useState<LevelInfo[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLevelData();
  }, [user]);

  const fetchLevelData = async () => {
    try {
      setLoading(true);

      // 모든 레벨 정보 조회
      const levelsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/levels`
      );
      const levelsData = await levelsResponse.json();
      setAllLevels(levelsData);

      // 상위 레벨 사용자 조회
      const leaderboardResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/levels/leaderboard?limit=10`
      );
      const leaderboardData = await leaderboardResponse.json();
      setTopUsers(leaderboardData);

      if (user) {
        // 사용자 레벨 진행도 조회
        const progressResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/levels/my/progress`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        const progressData = await progressResponse.json();
        setUserProgress(progressData);
      }
    } catch (error) {
      console.error("Failed to fetch level data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <p>레벨 정보를 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className={styles.loginRequired}>
          <h2>로그인이 필요합니다</h2>
          <p>레벨 진행도를 확인하려면 로그인해주세요.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>레벨 시스템</h1>
          <p>수영 활동과 배지 획득으로 경험치를 쌓아 레벨을 올려보세요!</p>
        </div>

        {userProgress && (
          <div className={styles.myProgress}>
            <h2>내 진행도</h2>
            <LevelProgress
              currentLevel={userProgress.currentLevel}
              currentXP={userProgress.currentXP}
              xpForCurrentLevel={userProgress.xpForCurrentLevel}
              xpForNextLevel={userProgress.xpForNextLevel}
              progressPercentage={userProgress.progressPercentage}
              title={userProgress.title}
              nextTitle={userProgress.nextTitle}
              size="large"
              showDetails={true}
            />
          </div>
        )}

        <div className={styles.leaderboard}>
          <h2>레벨 리더보드</h2>
          <div className={styles.topUsers}>
            {topUsers.map((topUser, index) => (
              <div key={topUser.id} className={styles.userCard}>
                <div className={styles.rank}>#{index + 1}</div>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>
                    {topUser.profileImage ? (
                      <img src={topUser.profileImage} alt={topUser.name} />
                    ) : (
                      <span className={styles.avatarText}>
                        {topUser.name?.[0]?.toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                  <div className={styles.details}>
                    <h3>{topUser.name}</h3>
                    <p className={styles.title}>{topUser.title}</p>
                  </div>
                </div>
                <div className={styles.levelInfo}>
                  <span className={styles.level}>레벨 {topUser.userLevel}</span>
                  <span className={styles.xp}>
                    {topUser.experience.toLocaleString()} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.allLevels}>
          <h2>레벨 정보</h2>
          <div className={styles.levelGrid}>
            {allLevels.map((levelInfo) => (
              <div
                key={levelInfo.level}
                className={`${styles.levelCard} ${
                  userProgress && levelInfo.level <= userProgress.currentLevel
                    ? styles.achieved
                    : styles.locked
                }`}
              >
                <div className={styles.levelHeader}>
                  <span className={styles.levelIcon}>{levelInfo.icon}</span>
                  <div className={styles.levelDetails}>
                    <h3>레벨 {levelInfo.level}</h3>
                    <p className={styles.levelTitle}>{levelInfo.title}</p>
                  </div>
                </div>

                <div className={styles.requirements}>
                  <span className={styles.xpRequired}>
                    {levelInfo.requiredXP.toLocaleString()} XP 필요
                  </span>
                </div>

                <div className={styles.perks}>
                  <h4>혜택:</h4>
                  <ul>
                    {levelInfo.perks.map((perk, index) => (
                      <li key={index}>{perk}</li>
                    ))}
                  </ul>
                </div>

                {userProgress &&
                  levelInfo.level <= userProgress.currentLevel && (
                    <div className={styles.achievedBadge}>✓ 달성 완료</div>
                  )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
