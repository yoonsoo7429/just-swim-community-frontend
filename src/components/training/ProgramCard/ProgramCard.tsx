import React from "react";
import Link from "next/link";
import { TrainingProgram } from "@/types";
import { getDifficultyText } from "@/utils";
import styles from "./styles.module.scss";

interface ProgramCardProps {
  program: TrainingProgram;
  viewMode?: "compact" | "detailed";
  onJoin?: (programId: number) => void;
  onLeave?: (programId: number) => void;
  showActions?: boolean;
  isMyProgram?: boolean;
}

const ProgramCard: React.FC<ProgramCardProps> = ({
  program,
  viewMode = "compact",
  onJoin,
  onLeave,
  showActions = false,
  isMyProgram = false,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "#10b981";
      case "intermediate":
        return "#f59e0b";
      case "advanced":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "방금 전";
    if (diffInHours < 24) return `${diffInHours}시간 전`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}일 전`;

    return date.toLocaleDateString("ko-KR");
  };

  const handleJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onJoin) {
      onJoin(program.id);
    }
  };

  const handleLeave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLeave) {
      onLeave(program.id);
    }
  };

  // 컴팩트 모드 (전체 보기)
  if (viewMode === "compact") {
    return (
      <div className={styles.programCard}>
        <Link href={`/programs/${program.id}`}>
          <div className={styles.programHeader}>
            <div className={styles.authorInfo}>
              <div className={styles.avatar}>
                <div className={styles.avatarPlaceholder}>
                  {program.user?.name?.charAt(0) || "?"}
                </div>
              </div>
              <div className={styles.authorDetails}>
                <div className={styles.authorName}>
                  {program.user?.name || "알 수 없음"}
                </div>
                <div className={styles.programTime}>
                  {formatTime(program.createdAt)}
                </div>
              </div>
            </div>
            <div className={styles.programActions}>
              <span
                className={styles.difficultyBadge}
                style={{
                  backgroundColor: getDifficultyColor(program.difficulty),
                }}
              >
                {getDifficultyText(program.difficulty)}
              </span>
            </div>
          </div>

          <div className={styles.programContent}>
            <h3 className={styles.programTitle}>{program.title}</h3>

            {program.description && (
              <p className={styles.programDescription}>
                {program.description.length > 100
                  ? `${program.description.substring(0, 100)}...`
                  : program.description}
              </p>
            )}

            <div className={styles.programMeta}>
              <span
                className={`${styles.statusBadge} ${styles.visibilityBadge}`}
              >
                {program.visibility === "public" ? "공개" : "비공개"}
              </span>
              <span className={`${styles.statusBadge} ${styles.publishBadge}`}>
                {program.isPublished ? "게시됨" : "임시저장"}
              </span>
            </div>
          </div>
        </Link>

        {/* 액션 버튼들 */}
        {showActions && (
          <div className={styles.cardActions}>
            {!isMyProgram ? (
              <button className={styles.joinButton} onClick={handleJoin}>
                참여하기
              </button>
            ) : (
              <button
                className={styles.editButton}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                수정하기
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // 상세 모드
  return (
    <div className={styles.programCardDetailed}>
      <Link href={`/programs/${program.id}`} className={styles.cardLink}>
        <div className={styles.programHeader}>
          <div className={styles.authorInfo}>
            <div className={styles.avatar}>
              <div className={styles.avatarPlaceholder}>
                {program.user?.name?.charAt(0) || "?"}
              </div>
            </div>
            <div className={styles.authorDetails}>
              <div className={styles.authorName}>
                {program.user?.name || "알 수 없음"}
              </div>
              <div className={styles.programTime}>
                {formatTime(program.createdAt)}
              </div>
            </div>
          </div>
          <div className={styles.programActions}>
            <span
              className={styles.difficultyBadge}
              style={{
                backgroundColor: getDifficultyColor(program.difficulty),
              }}
            >
              {getDifficultyText(program.difficulty)}
            </span>
          </div>
        </div>

        <div className={styles.programContent}>
          <h3 className={styles.programTitle}>{program.title}</h3>

          {program.description && (
            <p className={styles.programDescription}>{program.description}</p>
          )}

          <div className={styles.programMeta}>
            <span className={`${styles.statusBadge} ${styles.visibilityBadge}`}>
              {program.visibility === "public" ? "공개" : "비공개"}
            </span>
            <span className={`${styles.statusBadge} ${styles.publishBadge}`}>
              {program.isPublished ? "게시됨" : "임시저장"}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProgramCard;
