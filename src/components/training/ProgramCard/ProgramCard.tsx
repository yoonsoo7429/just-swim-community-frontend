import React, { useState } from "react";
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
        return "#4CAF50";
      case "intermediate":
        return "#FF9800";
      case "advanced":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const handleJoin = () => {
    if (onJoin) {
      onJoin(program.id);
    }
  };

  const handleLeave = () => {
    if (onLeave) {
      onLeave(program.id);
    }
  };

  // 컴팩트 모드 (전체 보기)
  if (viewMode === "compact") {
    return (
      <div className={styles.programCardCompact}>
        <Link href={`/programs/${program.id}`} className={styles.cardLink}>
          <div className={styles.headerCompact}>
            <div className={styles.titleSectionCompact}>
              <h3 className={styles.titleCompact}>{program.title}</h3>
              <span
                className={styles.difficultyCompact}
                style={{
                  backgroundColor: getDifficultyColor(program.difficulty),
                }}
              >
                {getDifficultyText(program.difficulty)}
              </span>
            </div>
          </div>

          {/* 기본 정보 (항상 표시) */}
          <div className={styles.basicInfo}>
            <div className={styles.statusTags}>
              <span className={styles.visibilityTag}>
                {program.visibility === "public" ? "공개" : "비공개"}
              </span>
              <span className={styles.publishTag}>
                {program.isPublished ? "게시됨" : "임시저장"}
              </span>
            </div>

            {program.description && (
              <p className={styles.descriptionPreview}>
                {program.description.length > 50
                  ? `${program.description.substring(0, 50)}...`
                  : program.description}
              </p>
            )}
          </div>
        </Link>

        {/* 액션 버튼들 */}
        <div className={styles.cardActions}>
          {showActions && !isMyProgram && (
            <div className={styles.participationActions}>
              <button
                className={styles.joinButton}
                onClick={() => handleJoin()}
              >
                참여하기
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 상세 모드
  return (
    <Link href={`/programs/${program.id}`} className={styles.programCard}>
      <div className={styles.header}>
        <h3 className={styles.title}>{program.title}</h3>
        <span
          className={styles.difficulty}
          style={{ backgroundColor: getDifficultyColor(program.difficulty) }}
        >
          {getDifficultyText(program.difficulty)}
        </span>
      </div>

      {program.description && (
        <p className={styles.description}>{program.description}</p>
      )}

      <div className={styles.footer}>
        <span className={styles.visibility}>
          {program.visibility === "public" ? "공개" : "비공개"}
        </span>
        <span className={styles.status}>
          {program.isPublished ? "게시됨" : "임시저장"}
        </span>
      </div>
    </Link>
  );
};

export default ProgramCard;
