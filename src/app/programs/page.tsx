"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";
import { TrainingProgram, Post } from "@/types";
import { trainingAPI, postsAPI } from "@/utils/api";
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
import IconArrowLeft from "@assets/icon_arrow_left.svg";

const ProgramsPage: React.FC = () => {
  const router = useRouter();
  const { user, signIn, signUp } = useAuth();
  const [myPrograms, setMyPrograms] = useState<TrainingProgram[]>([]);
  const [participatedPosts, setParticipatedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"myPrograms" | "participated">(
    "myPrograms"
  );

  const [selectedProgram, setSelectedProgram] =
    useState<TrainingProgram | null>(null);
  const [filter, setFilter] = useState<
    "all" | "beginner" | "intermediate" | "advanced"
  >("all");

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [programsResponse, postsResponse] = await Promise.all([
        trainingAPI.getMyPrograms(),
        postsAPI.getPosts(), // 모든 게시물을 가져와서 참여한 것만 필터링
      ]);

      setMyPrograms(programsResponse.data || []);

      // 훈련 모집 카테고리에서 현재 사용자가 참여한 게시물만 필터링
      const participated =
        postsResponse.data?.filter(
          (post: Post) =>
            post.category === "훈련 모집" &&
            post.participants?.some(
              (participant) => participant.id === user?.id
            )
        ) || [];

      setParticipatedPosts(participated);
    } catch (error) {
      console.error("데이터 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    fetchData();
  };

  const handleShareSuccess = () => {
    alert("프로그램이 성공적으로 공유되었습니다!");
  };

  const handleRecruitmentSuccess = () => {
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

  const handlePostClick = (postId: number) => {
    router.push(`/posts/${postId}`);
  };

  if (!user) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.authContainer}>
            <h1>내 훈련</h1>
            <p>로그인하여 내 훈련을 관리하세요.</p>
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
          <div className={styles.headerContent}>
            <button
              onClick={() => router.push("/")}
              className={styles.backButton}
              title="뒤로 가기"
            >
              <IconArrowLeft width={20} height={20} />
            </button>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>🏊‍♂️ 내 훈련</h1>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                새 프로그램 만들기
              </Button>
            </div>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "myPrograms" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("myPrograms")}
          >
            🎯 내가 작성한 훈련
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "participated" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("participated")}
          >
            👥 내가 참여한 훈련
          </button>
        </div>

        {activeTab === "myPrograms" && (
          <>
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
          </>
        )}

        {activeTab === "participated" && (
          <div className={styles.participatedSection}>
            {isLoading ? (
              <div className={styles.loading}>로딩 중...</div>
            ) : (
              <div className={styles.postsGrid}>
                {participatedPosts.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>아직 참여한 훈련이 없습니다.</p>
                    <p>커뮤니티에서 훈련 모집 글을 찾아 참여해보세요!</p>
                  </div>
                ) : (
                  participatedPosts.map((post) => (
                    <div
                      key={post.id}
                      className={styles.participatedPost}
                      onClick={() => handlePostClick(post.id)}
                    >
                      <div className={styles.postHeader}>
                        <h3>{post.title}</h3>
                        <span className={styles.author}>
                          by {post.author.name}
                        </span>
                      </div>
                      <div className={styles.postContent}>
                        <p>{post.content.substring(0, 100)}...</p>
                      </div>
                      {post.recruitmentInfo && (
                        <div className={styles.recruitmentInfo}>
                          <span className={styles.type}>
                            {post.recruitmentInfo.type === "regular"
                              ? "정기 모임"
                              : "단기 모임"}
                          </span>
                          <span className={styles.location}>
                            📍 {post.recruitmentInfo.location}
                          </span>
                          <span className={styles.participants}>
                            👥 {post.recruitmentInfo.currentParticipants} /{" "}
                            {post.recruitmentInfo.maxParticipants}명
                          </span>
                        </div>
                      )}
                      <div className={styles.postFooter}>
                        <span className={styles.participationStatus}>
                          ✅ 참여 중
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
