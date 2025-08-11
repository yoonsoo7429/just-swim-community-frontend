"use client";

import React, { useState, useEffect } from "react";
import { Layout } from "../../components/layout";
import { TrainingProgram } from "../../types";
import { trainingAPI } from "../../utils/api";
import styles from "./page.module.scss";
import { Button } from "@/components";
import { CreateProgramModal, ProgramCard } from "@/components/training";

const ProgramsPage: React.FC = () => {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "beginner" | "intermediate" | "advanced"
  >("all");

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setIsLoading(true);
      const response = await trainingAPI.getPrograms();
      setPrograms(response.data);
    } catch (error) {
      console.error("프로그램 목록 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    fetchPrograms();
  };

  const filteredPrograms = programs.filter((program) => {
    if (filter === "all") return true;
    return program.difficulty === filter;
  });

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

  if (isLoading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>프로그램을 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>훈련 프로그램</h1>
            <p className={styles.subtitle}>
              체계적인 수영 훈련을 위한 프로그램을 찾아보세요
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className={styles.createButton}
          >
            새 프로그램 만들기
          </Button>
        </div>

        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${
              filter === "all" ? styles.active : ""
            }`}
            onClick={() => setFilter("all")}
          >
            전체
          </button>
          <button
            className={`${styles.filterButton} ${
              filter === "beginner" ? styles.active : ""
            }`}
            onClick={() => setFilter("beginner")}
          >
            초급
          </button>
          <button
            className={`${styles.filterButton} ${
              filter === "intermediate" ? styles.active : ""
            }`}
            onClick={() => setFilter("intermediate")}
          >
            중급
          </button>
          <button
            className={`${styles.filterButton} ${
              filter === "advanced" ? styles.active : ""
            }`}
            onClick={() => setFilter("advanced")}
          >
            고급
          </button>
        </div>

        {filteredPrograms.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏊‍♂️</div>
            <h3>아직 프로그램이 없습니다</h3>
            <p>첫 번째 훈련 프로그램을 만들어보세요!</p>
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              프로그램 만들기
            </Button>
          </div>
        ) : (
          <div className={styles.programsGrid}>
            {filteredPrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        )}
      </div>

      <CreateProgramModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </Layout>
  );
};

export default ProgramsPage;
