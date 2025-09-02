"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import BadgeList from "@/components/badges/BadgeList";
import styles from "./page.module.scss";

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

export default function BadgesPage() {
  const { user, isLoading } = useAuth();
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [badgeStats, setBadgeStats] = useState<BadgeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadgeData();
  }, [user]);

  const fetchBadgeData = async () => {
    try {
      setLoading(true);

      // 모든 배지 조회
      const allBadgesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/badges`
      );
      const allBadgesData = await allBadgesResponse.json();
      setAllBadges(allBadgesData);

      if (user) {
        // 사용자 배지 조회
        const userBadgesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/badges/my`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        const userBadgesData = await userBadgesResponse.json();
        setUserBadges(userBadgesData);

        // 배지 통계 조회
        const statsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/badges/my/stats`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        const statsData = await statsResponse.json();
        setBadgeStats(statsData);
      }
    } catch (error) {
      console.error("Failed to fetch badge data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <p>배지 정보를 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className={styles.loginRequired}>
          <h2>로그인이 필요합니다</h2>
          <p>배지를 확인하려면 로그인해주세요.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        {badgeStats && (
          <div className={styles.statsOverview}>
            <div className={styles.mainStats}>
              <div className={styles.statCard}>
                <h3>총 획득 배지</h3>
                <p className={styles.statValue}>
                  {badgeStats.totalEarned}
                  <span className={styles.statTotal}>
                    /{badgeStats.totalAvailable}
                  </span>
                </p>
              </div>

              <div className={styles.statCard}>
                <h3>달성률</h3>
                <p className={styles.statValue}>
                  {badgeStats.completionRate.toFixed(1)}%
                </p>
              </div>

              <div className={styles.statCard}>
                <h3>총 포인트</h3>
                <p className={styles.statValue}>{badgeStats.totalPoints}P</p>
              </div>
            </div>

            <div className={styles.categoryStats}>
              <h3>카테고리별 달성률</h3>
              <div className={styles.categoryGrid}>
                {Object.entries(badgeStats.byCategory).map(
                  ([category, stats]) => (
                    <div key={category} className={styles.categoryCard}>
                      <h4>{getCategoryName(category)}</h4>
                      <div className={styles.categoryProgress}>
                        <div
                          className={styles.categoryBar}
                          style={{ width: `${stats.percentage}%` }}
                        />
                      </div>
                      <p>
                        {stats.earned}/{stats.total}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            {badgeStats.recentBadges.length > 0 && (
              <div className={styles.recentBadges}>
                <h3>최근 획득한 배지</h3>
                <div className={styles.recentBadgesList}>
                  {badgeStats.recentBadges.map((userBadge) => (
                    <div key={userBadge.id} className={styles.recentBadge}>
                      <span className={styles.badgeIcon}>
                        {userBadge.badge.icon}
                      </span>
                      <div>
                        <p className={styles.badgeName}>
                          {userBadge.badge.name}
                        </p>
                        <p className={styles.badgeDate}>
                          {new Date(userBadge.earnedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <BadgeList
          allBadges={allBadges}
          userBadges={userBadges}
          showFilter={true}
        />
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
