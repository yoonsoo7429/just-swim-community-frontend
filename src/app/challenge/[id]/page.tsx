"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import styles from "./page.module.scss";

interface User {
  id: number;
  name: string;
  profileImage?: string;
  userLevel: number;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  type: string;
  category: string;
  status: string;
  creator: User;
  startDate: string;
  endDate: string;
  targetValue: number;
  unit: string;
  maxParticipants: number;
  rewardXP: number;
  rewardPoints: number;
  isPublic: boolean;
  bannerImage?: string;
  createdAt: string;
}

interface ChallengeParticipant {
  id: number;
  user: User;
  status: string;
  currentProgress: number;
  progressPercentage: number;
  ranking: number;
  completedAt?: string;
  lastActivityAt?: string;
}

interface ChallengeInfo {
  challenge: Challenge;
  participantCount: number;
  userParticipation?: ChallengeParticipant;
  topParticipants: ChallengeParticipant[];
  allParticipants: ChallengeParticipant[];
}

export default function ChallengeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [challengeInfo, setChallengeInfo] = useState<ChallengeInfo | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const challengeId = params.id as string;

  useEffect(() => {
    if (challengeId && currentUser) {
      fetchChallengeDetails();
    }
  }, [challengeId, currentUser]);

  const fetchChallengeDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      // 챌린지 상세 정보 조회
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/social/challenges/${challengeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChallengeInfo(data);
      } else {
        router.push("/404");
      }
    } catch (error) {
      console.error("Failed to fetch challenge details:", error);
      router.push("/404");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = async () => {
    if (!challengeInfo) return;

    try {
      setJoining(true);
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/social/challenges/${challengeId}/join`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await fetchChallengeDetails(); // 데이터 새로고침
        alert("챌린지에 참가했습니다!");
      } else {
        const error = await response.json();
        alert(error.message || "챌린지 참가에 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to join challenge:", error);
      alert("챌린지 참가에 실패했습니다.");
    } finally {
      setJoining(false);
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case "distance":
        return "📏";
      case "duration":
        return "⏱️";
      case "frequency":
        return "📊";
      case "streak":
        return "🔥";
      case "stroke":
        return "🏊‍♂️";
      case "speed":
        return "⚡";
      default:
        return "🎯";
    }
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case "individual":
        return "개인";
      case "group":
        return "그룹";
      case "community":
        return "커뮤니티";
      default:
        return type;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "upcoming":
        return "#ff9800";
      case "active":
        return "#4caf50";
      case "completed":
        return "#2196f3";
      case "cancelled":
        return "#f44336";
      default:
        return "#666";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "upcoming":
        return "시작 예정";
      case "active":
        return "진행중";
      case "completed":
        return "완료됨";
      case "cancelled":
        return "취소됨";
      default:
        return status;
    }
  };

  const formatValue = (value: number, unit: string): string => {
    if (unit === "m") {
      return value >= 1000 ? `${(value / 1000).toFixed(1)}km` : `${value}m`;
    }
    return `${value.toLocaleString()}${unit}`;
  };

  const getDaysRemaining = (): number => {
    if (!challengeInfo) return 0;
    const endDate = new Date(challengeInfo.challenge.endDate);
    const today = new Date();
    const timeDiff = endDate.getTime() - today.getTime();
    return Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
  };

  const getDaysSinceStart = (): number => {
    if (!challengeInfo) return 0;
    const startDate = new Date(challengeInfo.challenge.startDate);
    const today = new Date();
    const timeDiff = today.getTime() - startDate.getTime();
    return Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
  };

  const getLevelIcon = (level: number): string => {
    if (level >= 10) return "👑";
    if (level >= 8) return "💎";
    if (level >= 6) return "🏆";
    if (level >= 4) return "💪";
    if (level >= 2) return "🏊";
    return "🌊";
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <p>챌린지 정보를 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  if (!challengeInfo) {
    return (
      <Layout>
        <div className={styles.error}>
          <p>챌린지를 찾을 수 없습니다.</p>
        </div>
      </Layout>
    );
  }

  const {
    challenge,
    participantCount,
    userParticipation,
    topParticipants,
    allParticipants,
  } = challengeInfo;
  const isParticipating = !!userParticipation;
  const canJoin =
    challenge.status === "active" || challenge.status === "upcoming";
  const isFull =
    challenge.maxParticipants > 0 &&
    participantCount >= challenge.maxParticipants;

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            ← 뒤로가기
          </button>
          <h1>🏆 챌린지 상세</h1>
        </div>

        {challenge.bannerImage && (
          <div className={styles.banner}>
            <img src={challenge.bannerImage} alt={challenge.title} />
          </div>
        )}

        <div className={styles.challengeHeader}>
          <div className={styles.titleSection}>
            <span className={styles.categoryIcon}>
              {getCategoryIcon(challenge.category)}
            </span>
            <div className={styles.titleInfo}>
              <h2 className={styles.title}>{challenge.title}</h2>
              <div className={styles.badges}>
                <span className={styles.typeBadge}>
                  {getTypeLabel(challenge.type)}
                </span>
                <span
                  className={styles.statusBadge}
                  style={{ backgroundColor: getStatusColor(challenge.status) }}
                >
                  {getStatusLabel(challenge.status)}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            {!isParticipating && canJoin && !isFull && (
              <button
                className={styles.joinBtn}
                onClick={handleJoinChallenge}
                disabled={joining}
              >
                {joining ? "참가 중..." : "참가하기"}
              </button>
            )}
            {isParticipating && (
              <a
                className={styles.goalsBtn}
                href={`/goals?highlight=challenge`}
              >
                목표로 보기
              </a>
            )}
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "overview" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("overview")}
          >
            개요
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "participants" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("participants")}
          >
            참가자 ({participantCount})
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "progress" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("progress")}
          >
            진행도
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === "overview" && (
            <div className={styles.overview}>
              <div className={styles.description}>
                <h3>📝 설명</h3>
                <p>{challenge.description}</p>
              </div>

              <div className={styles.challengeInfo}>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>목표</span>
                    <span className={styles.infoValue}>
                      {formatValue(challenge.targetValue, challenge.unit)}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>보상</span>
                    <span className={styles.infoValue}>
                      {challenge.rewardXP}XP + {challenge.rewardPoints}P
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>시작일</span>
                    <span className={styles.infoValue}>
                      {new Date(challenge.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>종료일</span>
                    <span className={styles.infoValue}>
                      {new Date(challenge.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>진행 기간</span>
                    <span className={styles.infoValue}>
                      {getDaysSinceStart()}일 / {getDaysRemaining()}일 남음
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>생성자</span>
                    <span className={styles.infoValue}>
                      {challenge.creator.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "participants" && (
            <div className={styles.participants}>
              <h3>👥 참가자 목록</h3>
              {allParticipants.length > 0 ? (
                <div className={styles.participantsList}>
                  {allParticipants.map((participant, index) => (
                    <div
                      key={participant.id}
                      className={styles.participantCard}
                    >
                      <div className={styles.rank}>
                        {index === 0
                          ? "🥇"
                          : index === 1
                          ? "🥈"
                          : index === 2
                          ? "🥉"
                          : `#${index + 1}`}
                      </div>
                      <div className={styles.avatar}>
                        {participant.user.profileImage ? (
                          <img
                            src={participant.user.profileImage}
                            alt={participant.user.name}
                          />
                        ) : (
                          <span className={styles.avatarText}>
                            {participant.user.name?.[0]?.toUpperCase()}
                          </span>
                        )}
                        <span className={styles.levelBadge}>
                          {getLevelIcon(participant.user.userLevel)}
                        </span>
                      </div>
                      <div className={styles.participantInfo}>
                        <h4>{participant.user.name}</h4>
                        <span className={styles.level}>
                          Lv.{participant.user.userLevel}
                        </span>
                      </div>
                      <div className={styles.progress}>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{
                              width: `${participant.progressPercentage}%`,
                            }}
                          />
                        </div>
                        <span className={styles.progressText}>
                          {formatValue(
                            participant.currentProgress,
                            challenge.unit
                          )}{" "}
                          / {formatValue(challenge.targetValue, challenge.unit)}
                        </span>
                        <span className={styles.percentage}>
                          {participant.progressPercentage}%
                        </span>
                      </div>
                      {participant.status === "completed" && (
                        <div className={styles.completedBadge}>✅ 완료</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>아직 참가자가 없습니다.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "progress" && userParticipation && (
            <div className={styles.progress}>
              <h3>📊 내 진행도</h3>
              <div className={styles.progressCard}>
                <div className={styles.progressHeader}>
                  <span>전체 진행도</span>
                  <span className={styles.percentage}>
                    {userParticipation.progressPercentage}%
                  </span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${userParticipation.progressPercentage}%`,
                    }}
                  />
                </div>
                <div className={styles.progressText}>
                  {formatValue(
                    userParticipation.currentProgress,
                    challenge.unit
                  )}{" "}
                  / {formatValue(challenge.targetValue, challenge.unit)}
                </div>
                {userParticipation.status === "completed" && (
                  <div className={styles.completedMessage}>
                    🎉 챌린지를 완료했습니다!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}


