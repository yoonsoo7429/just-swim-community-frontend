"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import LeaderboardTabs from "@/components/leaderboards/LeaderboardTabs";
import LeaderboardCard from "@/components/leaderboards/LeaderboardCard";
import styles from "./page.module.scss";

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

interface UserRank {
  rank: number;
  value: number;
}

export default function LeaderboardsPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("level");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStroke, setSelectedStroke] = useState("freestyle");

  const tabs = [
    {
      id: "level",
      label: "레벨 순위",
      icon: "⭐",
      description: "전체",
    },
    {
      id: "monthly_distance",
      label: "이달의 거리",
      icon: "📊",
      description: "월간",
    },
    {
      id: "weekly_distance",
      label: "이주의 거리",
      icon: "📈",
      description: "주간",
    },
    {
      id: "badges",
      label: "배지 수집",
      icon: "🏆",
      description: "전체",
    },
    {
      id: "streak",
      label: "연속 수영",
      icon: "🔥",
      description: "스트릭",
    },
    {
      id: "stroke",
      label: "영법별",
      icon: "🏊",
      description: "특화",
    },
  ];

  const strokeOptions = [
    { value: "freestyle", label: "자유형", icon: "🏊‍♂️" },
    { value: "backstroke", label: "배영", icon: "🔄" },
    { value: "breaststroke", label: "평영", icon: "🐸" },
    { value: "butterfly", label: "접영", icon: "🦋" },
  ];

  useEffect(() => {
    fetchLeaderboardData();
  }, [activeTab, selectedStroke, user]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      let endpoint = "";

      switch (activeTab) {
        case "level":
          endpoint = "/leaderboards/level";
          break;
        case "monthly_distance":
          endpoint = "/leaderboards/distance/monthly";
          break;
        case "weekly_distance":
          endpoint = "/leaderboards/distance/weekly";
          break;
        case "badges":
          endpoint = "/leaderboards/badges";
          break;
        case "streak":
          endpoint = "/leaderboards/streak";
          break;
        case "stroke":
          endpoint = `/leaderboards/stroke/${selectedStroke}`;
          break;
        default:
          endpoint = "/leaderboards/level";
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}?limit=50`
      );

      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data);
      }

      // 사용자 순위 조회 (로그인된 경우)
      if (user) {
        const rankResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/leaderboards/my-rank/${activeTab}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        if (rankResponse.ok) {
          const rankData = await rankResponse.json();
          setUserRank(rankData);
        }
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getValueUnit = (tabId: string): string => {
    switch (tabId) {
      case "level":
        return "XP";
      case "monthly_distance":
      case "weekly_distance":
      case "stroke":
        return "m";
      case "badges":
        return "개";
      case "streak":
        return "일";
      default:
        return "";
    }
  };

  const getLeaderboardTitle = (tabId: string): string => {
    switch (tabId) {
      case "level":
        return "레벨 순위";
      case "monthly_distance":
        return `${new Date().getMonth() + 1}월 거리 순위`;
      case "weekly_distance":
        return "이번 주 거리 순위";
      case "badges":
        return "배지 수집 순위";
      case "streak":
        return "연속 수영일 순위";
      case "stroke":
        return `${
          strokeOptions.find((s) => s.value === selectedStroke)?.label
        } 순위`;
      default:
        return "리더보드";
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <p>리더보드를 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>🏆 리더보드</h1>
          <p>다른 수영러들과 경쟁하고 자신의 순위를 확인해보세요!</p>
        </div>

        <LeaderboardTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === "stroke" && (
          <div className={styles.strokeSelector}>
            <h3>영법 선택</h3>
            <div className={styles.strokeOptions}>
              {strokeOptions.map((stroke) => (
                <button
                  key={stroke.value}
                  className={`${styles.strokeOption} ${
                    selectedStroke === stroke.value ? styles.active : ""
                  }`}
                  onClick={() => setSelectedStroke(stroke.value)}
                >
                  <span className={styles.strokeIcon}>{stroke.icon}</span>
                  <span className={styles.strokeLabel}>{stroke.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.leaderboardSection}>
          <div className={styles.sectionHeader}>
            <h2>{getLeaderboardTitle(activeTab)}</h2>
            {user && userRank && (
              <div className={styles.userRankInfo}>
                <span className={styles.yourRank}>
                  내 순위: #{userRank.rank} ({userRank.value.toLocaleString()}
                  {getValueUnit(activeTab)})
                </span>
              </div>
            )}
          </div>

          {loading ? (
            <div className={styles.loadingCards}>
              {[...Array(10)].map((_, index) => (
                <div key={index} className={styles.skeletonCard}></div>
              ))}
            </div>
          ) : (
            <div className={styles.leaderboardList}>
              {leaderboardData.length > 0 ? (
                leaderboardData.map((entry) => (
                  <LeaderboardCard
                    key={entry.userId}
                    entry={entry}
                    valueUnit={getValueUnit(activeTab)}
                    showAdditionalInfo={
                      activeTab === "monthly_distance" ||
                      activeTab === "weekly_distance" ||
                      activeTab === "badges"
                    }
                    isCurrentUser={user?.id === entry.userId}
                  />
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>아직 데이터가 없습니다.</p>
                  <p>수영 기록을 등록하고 순위에 도전해보세요!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {user && (
          <div className={styles.motivationSection}>
            <div className={styles.motivationCard}>
              <h3>🎯 순위 올리기 팁</h3>
              <ul>
                <li>꾸준한 수영으로 연속 기록을 늘려보세요</li>
                <li>다양한 영법을 시도하여 배지를 수집하세요</li>
                <li>월간 목표를 세우고 달성해보세요</li>
                <li>긴 거리에 도전하여 경험치를 쌓아보세요</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
