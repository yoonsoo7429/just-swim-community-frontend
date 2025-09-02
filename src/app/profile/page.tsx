"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import LevelProgress from "@/components/levels/LevelProgress";
import BadgeCard from "@/components/badges/BadgeCard";
import styles from "./page.module.scss";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  profileImage?: string;
  userLevel: number;
  experience: number;
  title: string;
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

interface BadgeStats {
  totalEarned: number;
  totalAvailable: number;
  completionRate: number;
  totalPoints: number;
  byCategory: {
    [key: string]: {
      earned: number;
      total: number;
      percentage: number;
    };
  };
  byTier: {
    [key: string]: {
      earned: number;
      total: number;
      percentage: number;
    };
  };
  recentBadges: UserBadge[];
}

interface UserRanking {
  level: { rank: number; value: number } | null;
  monthlyDistance: { rank: number; value: number } | null;
  badges: { rank: number; value: number } | null;
  streak: { rank: number; value: number } | null;
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [userProgress, setUserProgress] = useState<UserLevelProgress | null>(
    null
  );
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [badgeStats, setBadgeStats] = useState<BadgeStats | null>(null);
  const [userRanking, setUserRanking] = useState<UserRanking>({
    level: null,
    monthlyDistance: null,
    badges: null,
    streak: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
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

      // 사용자 배지 조회
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
        setUserBadges(badgesData);
      }

      // 배지 통계 조회
      const statsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/badges/my/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setBadgeStats(statsData);
      }

      // 사용자 순위 정보 조회
      const rankingPromises = [
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/leaderboards/my-rank/level`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/leaderboards/my-rank/monthly_distance`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/leaderboards/my-rank/badges`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/leaderboards/my-rank/streak`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ];

      const rankingResponses = await Promise.all(rankingPromises);
      const rankingData = await Promise.all(
        rankingResponses.map((res) => (res.ok ? res.json() : null))
      );

      setUserRanking({
        level: rankingData[0],
        monthlyDistance: rankingData[1],
        badges: rankingData[2],
        streak: rankingData[3],
      });
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <p>프로필 정보를 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className={styles.loginRequired}>
          <h2>로그인이 필요합니다</h2>
          <p>프로필을 확인하려면 로그인해주세요.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.profileInfo}>
            <div className={styles.avatar}>
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} />
              ) : (
                <span className={styles.avatarText}>
                  {user.name?.[0]?.toUpperCase() || "?"}
                </span>
              )}
            </div>
            <div className={styles.userDetails}>
              <h1>{user.name}</h1>
              <p className={styles.email}>{user.email}</p>
              {userProgress && (
                <p className={styles.title}>{userProgress.title}</p>
              )}
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h2>레벨 진행도</h2>
            {userProgress ? (
              <div className={styles.levelSection}>
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
                <div className={styles.levelStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>현재 레벨</span>
                    <span className={styles.statValue}>
                      {userProgress.currentLevel}
                    </span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>총 경험치</span>
                    <span className={styles.statValue}>
                      {userProgress.totalXPEarned.toLocaleString()} XP
                    </span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>다음 레벨까지</span>
                    <span className={styles.statValue}>
                      {(
                        userProgress.xpForNextLevel - userProgress.currentXP
                      ).toLocaleString()}{" "}
                      XP
                    </span>
                  </div>
                </div>

                {/* 순위 정보 */}
                <div className={styles.rankingInfo}>
                  <h3>내 순위 정보</h3>
                  <div className={styles.rankingGrid}>
                    {userRanking.level && (
                      <div className={styles.rankCard}>
                        <span className={styles.rankLabel}>레벨 순위</span>
                        <span className={styles.rankValue}>
                          #{userRanking.level.rank}
                        </span>
                      </div>
                    )}
                    {userRanking.monthlyDistance && (
                      <div className={styles.rankCard}>
                        <span className={styles.rankLabel}>이달의 거리</span>
                        <span className={styles.rankValue}>
                          #{userRanking.monthlyDistance.rank}
                        </span>
                      </div>
                    )}
                    {userRanking.badges && (
                      <div className={styles.rankCard}>
                        <span className={styles.rankLabel}>배지 수집</span>
                        <span className={styles.rankValue}>
                          #{userRanking.badges.rank}
                        </span>
                      </div>
                    )}
                    {userRanking.streak && (
                      <div className={styles.rankCard}>
                        <span className={styles.rankLabel}>연속 수영</span>
                        <span className={styles.rankValue}>
                          #{userRanking.streak.rank}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={styles.viewLeaderboard}>
                    <button
                      className={styles.leaderboardButton}
                      onClick={() => (window.location.href = "/leaderboards")}
                    >
                      전체 리더보드 보기
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p>레벨 정보를 불러올 수 없습니다.</p>
            )}
          </div>

          <div className={styles.section}>
            <h2>배지 컬렉션</h2>
            {badgeStats ? (
              <div className={styles.badgeSection}>
                <div className={styles.badgeOverview}>
                  <div className={styles.overviewStats}>
                    <div className={styles.statCard}>
                      <h3>획득한 배지</h3>
                      <p className={styles.statNumber}>
                        {badgeStats.totalEarned}/{badgeStats.totalAvailable}
                      </p>
                    </div>
                    <div className={styles.statCard}>
                      <h3>달성률</h3>
                      <p className={styles.statNumber}>
                        {badgeStats.completionRate.toFixed(1)}%
                      </p>
                    </div>
                    <div className={styles.statCard}>
                      <h3>배지 포인트</h3>
                      <p className={styles.statNumber}>
                        {badgeStats.totalPoints.toLocaleString()}P
                      </p>
                    </div>
                  </div>
                </div>

                {/* 카테고리별 진행도 */}
                <div className={styles.categoryProgress}>
                  <h3>카테고리별 진행도</h3>
                  <div className={styles.categoryList}>
                    {Object.entries(badgeStats.byCategory).map(
                      ([category, stats]) => (
                        <div key={category} className={styles.categoryItem}>
                          <div className={styles.categoryHeader}>
                            <span>{getCategoryName(category)}</span>
                            <span>
                              {stats.earned}/{stats.total}
                            </span>
                          </div>
                          <div className={styles.progressBar}>
                            <div
                              className={styles.progressFill}
                              style={{ width: `${stats.percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* 최근 획득한 배지 */}
                {badgeStats.recentBadges.length > 0 && (
                  <div className={styles.recentBadges}>
                    <h3>최근 획득한 배지</h3>
                    <div className={styles.badgeGrid}>
                      {badgeStats.recentBadges.map((userBadge) => (
                        <BadgeCard
                          key={userBadge.id}
                          badge={userBadge.badge}
                          isEarned={true}
                          earnedAt={userBadge.earnedAt}
                          size="medium"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 모든 배지 보기 버튼 */}
                <div className={styles.viewAllBadges}>
                  <button
                    className={styles.viewAllButton}
                    onClick={() => (window.location.href = "/badges")}
                  >
                    모든 배지 보기
                  </button>
                </div>
              </div>
            ) : (
              <p>배지 정보를 불러올 수 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function getCategoryName(category: string): string {
  switch (category) {
    case "distance":
      return "거리";
    case "consecutive":
      return "연속성";
    case "stroke":
      return "영법";
    case "special":
      return "특별";
    default:
      return category;
  }
}
