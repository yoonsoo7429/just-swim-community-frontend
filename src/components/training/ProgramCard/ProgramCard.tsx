import React from "react";
import Link from "next/link";
import { TrainingProgram } from "../../../types";
import styles from "./styles.module.scss";

interface ProgramCardProps {
  program: TrainingProgram;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
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
