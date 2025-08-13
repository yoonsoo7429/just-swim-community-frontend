import React, { useState } from "react";
import Link from "next/link";
import { TrainingProgram } from "../../../types";
import styles from "./styles.module.scss";

interface ProgramCardProps {
  program: TrainingProgram;
  viewMode?: "compact" | "detailed";
}

const ProgramCard: React.FC<ProgramCardProps> = ({
  program,
  viewMode = "compact",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "초급";
      case "intermediate":
        return "중급";
      case "advanced":
        return "고급";
      default:
        return difficulty;
    }
  };

  // 컴팩트 모드 (전체 보기)
  if (viewMode === "compact") {
    return (
      <div className={styles.programCardCompact}>
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
          <button
            className={styles.expandButton}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "접기" : "펼치기"}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className={`${styles.expandIcon} ${
                isExpanded ? styles.expanded : ""
              }`}
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className={styles.statsCompact}>
          <div className={styles.statCompact}>
            <span className={styles.valueCompact}>{program.totalWeeks}주</span>
            <span className={styles.labelCompact}>총 주차</span>
          </div>
          <div className={styles.statCompact}>
            <span className={styles.valueCompact}>
              {program.sessionsPerWeek}회
            </span>
            <span className={styles.labelCompact}>주당 세션</span>
          </div>
          <div className={styles.statCompact}>
            <span className={styles.valueCompact}>
              {program.totalWeeks * program.sessionsPerWeek}회
            </span>
            <span className={styles.labelCompact}>총 세션</span>
          </div>
        </div>

        {isExpanded && (
          <div className={styles.expandedContent}>
            {program.description && (
              <p className={styles.descriptionCompact}>{program.description}</p>
            )}

            <div className={styles.footerCompact}>
              <span className={styles.visibilityCompact}>
                {program.visibility === "public" ? "공개" : "비공개"}
              </span>
              <span className={styles.statusCompact}>
                {program.isPublished ? "게시됨" : "임시저장"}
              </span>
            </div>

            <div className={styles.actionsCompact}>
              <Link
                href={`/programs/${program.id}`}
                className={styles.viewDetailsButton}
              >
                상세 보기
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 상세 모드 (기존 코드)
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

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.label}>총 주차</span>
          <span className={styles.value}>{program.totalWeeks}주</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>주당 세션</span>
          <span className={styles.value}>{program.sessionsPerWeek}회</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>총 세션</span>
          <span className={styles.value}>
            {program.totalWeeks * program.sessionsPerWeek}회
          </span>
        </div>
      </div>

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
