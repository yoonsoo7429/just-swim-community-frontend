"use client";

import React from "react";
import styles from "./ChallengeCard.module.scss";

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
}

interface ChallengeParticipant {
  id: number;
  user: User;
  status: string;
  currentProgress: number;
  progressPercentage: number;
  ranking: number;
}

interface ChallengeInfo {
  challenge: Challenge;
  participantCount: number;
  userParticipation?: ChallengeParticipant;
  topParticipants: ChallengeParticipant[];
}

interface ChallengeCardProps {
  challengeInfo: ChallengeInfo;
  onJoin?: (challengeId: number) => void;
  onView?: (challengeId: number) => void;
  showActions?: boolean;
}

export default function ChallengeCard({
  challengeInfo,
  onJoin,
  onView,
  showActions = true,
}: ChallengeCardProps) {
  const { challenge, participantCount, userParticipation, topParticipants } =
    challengeInfo;

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
    const endDate = new Date(challenge.endDate);
    const today = new Date();
    const timeDiff = endDate.getTime() - today.getTime();
    return Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
  };

  const isParticipating = !!userParticipation;
  const canJoin =
    challenge.status === "active" || challenge.status === "upcoming";
  const isFull =
    challenge.maxParticipants > 0 &&
    participantCount >= challenge.maxParticipants;

  return (
    <div className={`${styles.challengeCard} ${styles[challenge.status]}`}>
      {challenge.bannerImage && (
        <div className={styles.banner}>
          <img src={challenge.bannerImage} alt={challenge.title} />
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <span className={styles.categoryIcon}>
              {getCategoryIcon(challenge.category)}
            </span>
            <div className={styles.titleInfo}>
              <h3 className={styles.title}>{challenge.title}</h3>
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

          {showActions && (
            <div className={styles.actions}>
              {!isParticipating && canJoin && !isFull && (
                <button
                  className={styles.joinBtn}
                  onClick={() => onJoin?.(challenge.id)}
                >
                  참가하기
                </button>
              )}
              <button
                className={styles.viewBtn}
                onClick={() => onView?.(challenge.id)}
              >
                상세보기
              </button>
              {isParticipating && (
                <a
                  className={styles.viewBtn}
                  href={`/goals?highlight=challenge`}
                  title="목표로 보기"
                >
                  목표로 보기
                </a>
              )}
            </div>
          )}
        </div>

        <p className={styles.description}>{challenge.description}</p>

        <div className={styles.targetInfo}>
          <div className={styles.target}>
            <span className={styles.targetLabel}>목표:</span>
            <span className={styles.targetValue}>
              {formatValue(challenge.targetValue, challenge.unit)}
            </span>
          </div>

          <div className={styles.reward}>
            <span className={styles.rewardLabel}>보상:</span>
            <span className={styles.rewardValue}>
              {challenge.rewardXP}XP + {challenge.rewardPoints}P
            </span>
          </div>
        </div>

        {userParticipation && (
          <div className={styles.userProgress}>
            <div className={styles.progressHeader}>
              <span>내 진행도</span>
              <span className={styles.percentage}>
                {userParticipation.progressPercentage}%
              </span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${userParticipation.progressPercentage}%` }}
              />
            </div>
            <div className={styles.progressText}>
              {formatValue(userParticipation.currentProgress, challenge.unit)} /{" "}
              {formatValue(challenge.targetValue, challenge.unit)}
            </div>
          </div>
        )}

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{participantCount}</span>
            <span className={styles.statLabel}>참가자</span>
          </div>

          <div className={styles.stat}>
            <span className={styles.statValue}>{getDaysRemaining()}</span>
            <span className={styles.statLabel}>남은 일수</span>
          </div>

          {isFull && (
            <div className={styles.stat}>
              <span className={styles.fullBadge}>마감</span>
            </div>
          )}
        </div>

        {topParticipants.length > 0 && (
          <div className={styles.topParticipants}>
            <h4>상위 참가자</h4>
            <div className={styles.participantsList}>
              {topParticipants.slice(0, 3).map((participant, index) => (
                <div key={participant.id} className={styles.participant}>
                  <div className={styles.rank}>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                  </div>
                  <div className={styles.participantInfo}>
                    <span className={styles.participantName}>
                      {participant.user.name}
                    </span>
                    <span className={styles.participantProgress}>
                      {formatValue(participant.currentProgress, challenge.unit)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.creatorInfo}>
          <span className={styles.createdBy}>
            만든이: {challenge.creator.name}
          </span>
        </div>
      </div>
    </div>
  );
}
