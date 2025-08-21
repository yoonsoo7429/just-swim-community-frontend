"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";
import { TrainingProgram } from "@/types";
import { trainingAPI } from "@/utils/api";
import styles from "./page.module.scss";
import Button from "@/components/ui/Button";
import {
  CreateProgramModal,
  ProgramCard,
  ShareProgramModal,
} from "@/components/training";

import { useAuth } from "@/contexts/AuthContext";
import SignInButton from "@/components/auth/SignInButton";
import SignUpButton from "@/components/auth/SignUpButton";

const ProgramsPage: React.FC = () => {
  const router = useRouter();
  const { user, signIn, signUp } = useAuth();
  const [myPrograms, setMyPrograms] = useState<TrainingProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [selectedProgram, setSelectedProgram] =
    useState<TrainingProgram | null>(null);
  const [filter, setFilter] = useState<
    "all" | "beginner" | "intermediate" | "advanced"
  >("all");

  useEffect(() => {
    if (user) {
      fetchMyPrograms();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchMyPrograms = async () => {
    try {
      setIsLoading(true);
      const response = await trainingAPI.getMyPrograms();
      setMyPrograms(response.data || []);
    } catch (error) {
      console.error("내 프로그램 목록 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    fetchMyPrograms();
  };

  const handleShareSuccess = () => {
    // 공유 성공 후 필요한 처리
    alert("프로그램이 성공적으로 공유되었습니다!");
  };

  const handleRecruitmentSuccess = () => {
    // 모집글 작성 성공 후 필요한 처리
    alert("모집글이 성공적으로 작성되었습니다!");
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signIn(email, password);
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  const handleSignUp = async (
    email: string,
    password: string,
    name: string
  ) => {
    try {
      await signUp(email, password, name);
    } catch (error) {
      console.error("Sign up failed:", error);
    }
  };

  const getFilteredPrograms = () => {
    if (filter === "all") return myPrograms;
    return myPrograms.filter((program) => program.difficulty === filter);
  };

  const handleProgramClick = (programId: number) => {
    router.push(`/programs/${programId}`);
  };

  if (!user) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.authContainer}>
            <h1>내 훈련 프로그램</h1>
            <p>로그인하여 내 훈련 프로그램을 관리하세요.</p>
            <div className={styles.authButtons}>
              <SignInButton onSignIn={handleSignIn} />
              <SignUpButton onSignUp={handleSignUp} />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>내 훈련 프로그램</h1>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            새 프로그램 만들기
          </Button>
        </div>

        <div className={styles.filterContainer}>
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

        {isLoading ? (
          <div className={styles.loading}>로딩 중...</div>
        ) : (
          <div className={styles.programsGrid}>
            {getFilteredPrograms().length === 0 ? (
              <div className={styles.emptyState}>
                <p>아직 만든 훈련 프로그램이 없습니다.</p>
                <p>새로운 프로그램을 만들어보세요!</p>
              </div>
            ) : (
              getFilteredPrograms().map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  showActions={true}
                  isMyProgram={true}
                />
              ))
            )}
          </div>
        )}

        <CreateProgramModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />

        <ShareProgramModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          program={selectedProgram}
          onSuccess={handleShareSuccess}
        />
      </div>
    </Layout>
  );
};

export default ProgramsPage;
