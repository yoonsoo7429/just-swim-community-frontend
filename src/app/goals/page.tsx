"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import GoalCard from "@/components/goals/GoalCard";
import StreakCard from "@/components/goals/StreakCard";
import CreateGoalModal from "@/components/goals/CreateGoalModal";
import styles from "./page.module.scss";

interface Goal {
  id: number;
  type: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: string;
  difficulty: string;
  startDate: string;
  endDate: string;
  progressPercentage: number;
  rewardXP: number;
  rewardPoints: number;
  isChallengeGoal?: boolean;
}

interface StreakInfo {
  type: string;
  currentStreak: number;
  longestStreak: number;
  canUseFreezer: boolean;
  nextMilestone: number;
  daysUntilBreak: number;
}

interface GoalRecommendation {
  type: string;
  title: string;
  description: string;
  targetValue: number;
  unit: string;
  difficulty: string;
  duration: number;
  reasoning: string;
}

export default function GoalsPage() {
  const { user, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [challengeGoals, setChallengeGoals] = useState<Goal[]>([]);
  const challengeSectionRef = useRef<HTMLDivElement | null>(null);
  const [streaks, setStreaks] = useState<StreakInfo[]>([]);
  const [recommendations, setRecommendations] = useState<GoalRecommendation[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    if (user) {
      fetchGoalsData();
    }
  }, [user]);

  useEffect(() => {
    const highlight = searchParams?.get("highlight");
    if (highlight === "challenge" && challengeSectionRef.current) {
      setActiveTab("active");
      setTimeout(() => {
        challengeSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    }
  }, [searchParams, challengeGoals.length]);

  const fetchGoalsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      // 통합 대시보드 조회 (개인 목표, 챌린지 연동 목표, 스트릭, 추천 포함)
      const dashboardResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/goals/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (dashboardResponse.ok) {
        const data = await dashboardResponse.json();
        setGoals(data.personalGoals || []);
        setChallengeGoals(data.challengeGoals || []);
        setStreaks(data.streakInfo || []);
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error("Failed to fetch goals data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (goalData: any) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(goalData),
      });

      if (response.ok) {
        await fetchGoalsData(); // 목표 목록 새로고침
      }
    } catch (error) {
      console.error("Failed to create goal:", error);
    }
  };

  const handleCompleteGoal = async (goalId: number) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/goals/${goalId}/complete`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await fetchGoalsData(); // 목표 목록 새로고침
      }
    } catch (error) {
      console.error("Failed to complete goal:", error);
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    if (!confirm("정말로 이 목표를 삭제하시겠습니까?")) return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/goals/${goalId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await fetchGoalsData(); // 목표 목록 새로고침
      }
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  };

  const filteredGoals = goals.filter((goal) => {
    switch (activeTab) {
      case "active":
        return goal.status === "active";
      case "completed":
        return goal.status === "completed";
      case "all":
        return true;
      default:
        return goal.status === "active";
    }
  });

  if (isLoading || loading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <p>목표 정보를 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>🎯 나의 목표</h1>
          <p>목표를 설정하고 달성하여 더 나은 수영러가 되어보세요!</p>
          <button
            className={styles.createBtn}
            onClick={() => setShowCreateModal(true)}
          >
            새 목표 만들기
          </button>
        </div>

        {/* 스트릭 섹션 */}
        {streaks.length > 0 && (
          <div className={styles.section}>
            <h2>🔥 스트릭 현황</h2>
            <div className={styles.streaksGrid}>
              {streaks.map((streak, index) => (
                <StreakCard key={index} streakInfo={streak} />
              ))}
            </div>
          </div>
        )}

        {/* 목표 섹션 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>📋 내 목표</h2>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${
                  activeTab === "active" ? styles.active : ""
                }`}
                onClick={() => setActiveTab("active")}
              >
                진행중 ({goals.filter((g) => g.status === "active").length})
              </button>
              <button
                className={`${styles.tab} ${
                  activeTab === "completed" ? styles.active : ""
                }`}
                onClick={() => setActiveTab("completed")}
              >
                완료됨 ({goals.filter((g) => g.status === "completed").length})
              </button>
              <button
                className={`${styles.tab} ${
                  activeTab === "all" ? styles.active : ""
                }`}
                onClick={() => setActiveTab("all")}
              >
                전체 ({goals.length})
              </button>
            </div>
          </div>

          {filteredGoals.length > 0 ? (
            <div className={styles.goalsGrid}>
              {filteredGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onComplete={handleCompleteGoal}
                  onDelete={handleDeleteGoal}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🎯</div>
              <h3>
                {activeTab === "active"
                  ? "진행중인 목표가 없습니다"
                  : activeTab === "completed"
                  ? "완료된 목표가 없습니다"
                  : "목표가 없습니다"}
              </h3>
              <p>
                {activeTab === "active"
                  ? "새로운 목표를 만들어 수영 동기를 부여해보세요!"
                  : activeTab === "completed"
                  ? "목표를 달성하면 여기에 표시됩니다."
                  : "첫 번째 목표를 만들어보세요!"}
              </p>
              {activeTab === "active" && (
                <button
                  className={styles.createEmptyBtn}
                  onClick={() => setShowCreateModal(true)}
                >
                  첫 목표 만들기
                </button>
              )}
            </div>
          )}
        </div>

        {/* 챌린지 연동 목표 섹션 */}
        {challengeGoals.length > 0 && (
          <div className={styles.section} ref={challengeSectionRef}>
            <h2>🏆 챌린지 연동 목표</h2>
            <div className={styles.goalsGrid}>
              {challengeGoals.map((goal) => (
                <GoalCard
                  key={`challenge-${goal.id}`}
                  goal={goal}
                  onComplete={handleCompleteGoal}
                  onDelete={handleDeleteGoal}
                />
              ))}
            </div>
          </div>
        )}

        {/* 추천 목표 섹션 */}
        {recommendations.length > 0 && activeTab === "active" && (
          <div className={styles.section}>
            <h2>💡 추천 목표</h2>
            <div className={styles.recommendationsGrid}>
              {recommendations.map((rec, index) => (
                <div key={index} className={styles.recommendationCard}>
                  <h3>{rec.title}</h3>
                  <p>{rec.description}</p>
                  <div className={styles.recMeta}>
                    <span className={styles.recTarget}>
                      {rec.targetValue.toLocaleString()}
                      {rec.unit}
                    </span>
                    <span className={styles.recDifficulty}>
                      {rec.difficulty}
                    </span>
                    <span className={styles.recDuration}>{rec.duration}일</span>
                  </div>
                  <div className={styles.recReasoning}>{rec.reasoning}</div>
                  <button
                    className={styles.addRecBtn}
                    onClick={() => {
                      setShowCreateModal(true);
                      // 추천 목표를 모달에 전달하는 로직은 CreateGoalModal에서 처리
                    }}
                  >
                    목표로 추가
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <CreateGoalModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateGoal}
          recommendations={recommendations}
        />
      </div>
    </Layout>
  );
}
