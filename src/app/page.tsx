"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { swimmingAPI } from "@/utils/api";
import styles from "./page.module.scss";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSwims: 0,
    totalDistance: 0,
    thisWeekSwims: 0,
    currentStreak: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [achievements, setAchievements] = useState<{
    recentAchievement: { title: string; description: string } | null;
    currentChallenge: {
      title: string;
      goal: string;
      progress: number;
      current: number;
      target: number;
    } | null;
    dailyTip: { title: string; content: string } | null;
  }>({
    recentAchievement: null,
    currentChallenge: null,
    dailyTip: null,
  });

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  // 실제 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setIsLoading(true);
        console.log("API 호출 시작...");

        // 개별적으로 호출해서 어느 API에서 에러가 나는지 확인
        let statsResponse: { data: any } = { data: null };
        let recentRecordsResponse: { data: any[] } = { data: [] };

        try {
          statsResponse = await swimmingAPI.getMyStats();
          console.log("getMyStats 응답:", statsResponse);
        } catch (statsError) {
          console.error("getMyStats 에러:", statsError);
          // API 에러가 발생해도 기본값으로 계속 진행
        }

        try {
          recentRecordsResponse = await swimmingAPI.getRecentRecords(5);
          console.log("getRecentRecords 응답:", recentRecordsResponse);
        } catch (recordsError) {
          console.error("getRecentRecords 에러:", recordsError);
          // recentRecords는 선택적이므로 에러가 나도 계속 진행
        }

        // 통계 데이터 설정
        const statsData = statsResponse.data
          ? {
              totalSessions: statsResponse.data.totalSessions || 0,
              totalDistance: statsResponse.data.totalDistance || 0,
              totalDuration: statsResponse.data.totalDuration || 0,
              totalCalories: statsResponse.data.totalCalories || 0,
            }
          : {
              totalSessions: 0,
              totalDistance: 0,
              totalDuration: 0,
              totalCalories: 0,
            };

        setStats({
          totalSwims: statsData.totalSessions,
          totalDistance: statsData.totalDistance / 1000, // 미터를 km로 변환
          thisWeekSwims: 0, // 이번 주 수영 횟수는 별도 계산 필요
          currentStreak: 0, // 연속 기록은 별도 계산 필요
        });

        // 최근 성취 및 도전 과제 설정
        setAchievements({
          recentAchievement:
            statsData.totalSessions >= 10
              ? {
                  title: "10회 수영 달성!",
                  description: "정말 대단해요! 이제 20회를 노려보세요 🎯",
                }
              : null,
          currentChallenge: {
            title: "이번 주 도전",
            goal: "자유형 2km 완주하기",
            progress: Math.min(
              statsData.totalDistance / 2000, // 미터를 km로 변환
              1
            ),
            current: statsData.totalDistance / 1000, // 미터를 km로 변환
            target: 2,
          },
          dailyTip: {
            title: "오늘의 수영 팁",
            content:
              "자유형에서 호흡할 때는 한쪽 눈만 물 밖으로 나오도록 하세요. 이렇게 하면 더 안정적인 호흡이 가능해요!",
          },
        });

        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (isLoading) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.dashboard}>
            <div className={styles.welcome}>
              <h1 className={styles.title}>안녕하세요, {user?.name}님! 👋</h1>
              <p className={styles.subtitle}>데이터를 불러오는 중...</p>
            </div>
            <div className={styles.loadingStats}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>⏳</div>
                <div className={styles.statContent}>
                  <h3>-</h3>
                  <p>연속 수영 기록</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>⏳</div>
                <div className={styles.statContent}>
                  <h3>-</h3>
                  <p>총 수영 횟수</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // 사용자가 없을 때의 처리
  if (!user) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.hero}>
            <h1 className={styles.title}>Just Swim</h1>
            <p className={styles.subtitle}>
              수영 기록 관리, 훈련 프로그램, 그리고 커뮤니티를 한 곳에서
            </p>
            <div className={styles.features}>
              <div
                className={styles.feature}
                onClick={() => handleNavigate("/records")}
              >
                <span className={styles.featureIcon}>📊</span>
                <span>수영 기록 관리</span>
              </div>
              <div
                className={styles.feature}
                onClick={() => handleNavigate("/programs")}
              >
                <span className={styles.featureIcon}>📋</span>
                <span>훈련 프로그램</span>
              </div>
              <div
                className={styles.feature}
                onClick={() => handleNavigate("/community")}
              >
                <span className={styles.featureIcon}>🏊‍♂️</span>
                <span>커뮤니티</span>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.dashboard}>
          <div className={styles.welcome}>
            <h1 className={styles.title}>안녕하세요, {user?.name}님! 👋</h1>
            <p className={styles.subtitle}>오늘도 수영하러 가볼까요?</p>
          </div>

          <div className={styles.mainStats}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🔥</div>
              <div className={styles.statContent}>
                <h3>{stats.currentStreak}일</h3>
                <p>연속 수영 기록</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📊</div>
              <div className={styles.statContent}>
                <h3>{stats.totalSwims}회</h3>
                <p>총 수영 횟수</p>
              </div>
            </div>
          </div>

          <div className={styles.motivationSection}>
            {achievements.recentAchievement && (
              <div className={styles.achievementCard}>
                <div className={styles.achievementIcon}>🏆</div>
                <div className={styles.achievementContent}>
                  <h3>{achievements.recentAchievement.title}</h3>
                  <p>{achievements.recentAchievement.description}</p>
                </div>
              </div>
            )}

            {achievements.currentChallenge && (
              <div className={styles.challengeCard}>
                <div className={styles.challengeHeader}>
                  <h3>{achievements.currentChallenge.title}</h3>
                  <span className={styles.challengeBadge}>NEW</span>
                </div>
                <div className={styles.challengeContent}>
                  <p>🏊‍♂️ {achievements.currentChallenge.goal}</p>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progress}
                      style={{
                        width: `${
                          achievements.currentChallenge.progress * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className={styles.progressText}>
                    {achievements.currentChallenge.current}km /{" "}
                    {achievements.currentChallenge.target}km
                  </span>
                </div>
              </div>
            )}

            {achievements.dailyTip && (
              <div className={styles.tipCard}>
                <div className={styles.tipIcon}>💡</div>
                <div className={styles.tipContent}>
                  <h4>{achievements.dailyTip.title}</h4>
                  <p>"{achievements.dailyTip.content}"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
