"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PostCard from "@/components/community/PostCard";
import CreatePostModal from "@/components/community/CreatePostModal";
import Button from "@/components/ui/Button";
import { Post, TrainingProgram } from "@/types";
import { postsAPI, trainingAPI } from "@/utils/api";
import styles from "./page.module.scss";
import { ProgramCard } from "@/components/training";
import { useAuth } from "@/contexts/AuthContext";

const categories = [
  "전체",
  "기록 공유",
  "팁 공유",
  "질문",
  "훈련 후기",
  "챌린지",
  "가이드",
];

export default function CommunityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [availablePrograms, setAvailablePrograms] = useState<TrainingProgram[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "programs">("posts");

  useEffect(() => {
    // URL 쿼리 파라미터에서 카테고리 확인
    const categoryParam = searchParams.get("category");
    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchPosts();
    if (user) {
      fetchAvailablePrograms();
    }
  }, [selectedCategory, user]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await postsAPI.getPosts();
      let fetchedPosts = response.data || [];

      // 카테고리별 필터링 (클라이언트에서 처리)
      if (selectedCategory !== "전체") {
        fetchedPosts = fetchedPosts.filter(
          (post: any) => post.category === selectedCategory
        );
      }

      console.log("Fetched posts:", fetchedPosts);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("게시물을 불러오는데 실패했습니다:", error);
      setError("게시물을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePrograms = async () => {
    try {
      const response = await trainingAPI.getPublicPrograms();
      setAvailablePrograms(response.data || []);
    } catch (error) {
      console.error("참여 가능한 프로그램 조회 실패:", error);
    }
  };

  const handlePostCreated = () => {
    fetchPosts();
    setIsCreateModalOpen(false);
  };

  const handlePostDeleted = (postId: number) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };

  const handlePostUpdated = () => {
    fetchPosts();
  };

  const handlePostSubmit = async (postData: {
    title: string;
    content: string;
    category: string;
    swimmingRecordId?: string;
  }) => {
    try {
      // 일반 게시물 생성
      await postsAPI.createPost(postData);
      handlePostCreated();
    } catch (error) {
      console.error("게시물 작성에 실패했습니다:", error);
      alert("게시물 작성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // URL 쿼리 파라미터 업데이트
    const params = new URLSearchParams();
    if (category !== "전체") {
      params.set("category", category);
    }
    router.push(`/community?${params.toString()}`);
  };

  const handleJoinProgram = async (programId: number) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await trainingAPI.joinProgram(programId);
      alert("프로그램에 성공적으로 참여했습니다!");
      fetchAvailablePrograms(); // 목록 새로고침
    } catch (error) {
      console.error("프로그램 참여 실패:", error);
      alert("프로그램 참여에 실패했습니다.");
    }
  };

  const handleLeaveProgram = async (programId: number) => {
    try {
      await trainingAPI.leaveProgram(programId);
      alert("프로그램에서 탈퇴했습니다.");
      fetchAvailablePrograms(); // 목록 새로고침
    } catch (error) {
      console.error("프로그램 탈퇴 실패:", error);
      alert("프로그램 탈퇴에 실패했습니다.");
    }
  };

  const handleProgramClick = (programId: number) => {
    router.push(`/programs/${programId}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>커뮤니티</h1>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "posts" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("posts")}
          >
            게시물
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "programs" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("programs")}
          >
            참여 가능한 프로그램
          </button>
        </div>
      </div>

      {activeTab === "posts" && (
        <>
          <div className={styles.categoryFilter}>
            {categories.map((category) => (
              <button
                key={category}
                className={`${styles.categoryButton} ${
                  selectedCategory === category ? styles.active : ""
                }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className={styles.postsSection}>
            <div className={styles.postsHeader}>
              <h2>게시물</h2>
              {user && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  새 게시물 작성
                </Button>
              )}
            </div>

            {loading ? (
              <div className={styles.loading}>로딩 중...</div>
            ) : error ? (
              <div className={styles.error}>{error}</div>
            ) : posts.length === 0 ? (
              <div className={styles.emptyState}>
                <p>게시물이 없습니다.</p>
                {user && <p>첫 번째 게시물을 작성해보세요!</p>}
              </div>
            ) : (
              <div className={styles.postsGrid}>
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onDelete={handlePostDeleted}
                    onLikeUpdate={handlePostUpdated}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "programs" && (
        <div className={styles.programsSection}>
          <div className={styles.programsHeader}>
            <h2>참여 가능한 훈련 프로그램</h2>
            <p>다른 사람들과 함께 참여할 수 있는 훈련 프로그램을 찾아보세요</p>
          </div>

          {!user ? (
            <div className={styles.loginRequired}>
              <p>로그인이 필요합니다.</p>
              <p>다른 사람들의 훈련 프로그램에 참여하려면 로그인해주세요.</p>
            </div>
          ) : availablePrograms.length === 0 ? (
            <div className={styles.emptyState}>
              <p>참여 가능한 훈련 프로그램이 없습니다.</p>
              <p>나중에 다시 확인해보세요!</p>
            </div>
          ) : (
            <div className={styles.programsGrid}>
              {availablePrograms.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  showActions={true}
                  onJoin={handleJoinProgram}
                  onLeave={handleLeaveProgram}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handlePostSubmit}
      />
    </div>
  );
}
