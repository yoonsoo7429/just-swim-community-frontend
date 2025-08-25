"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Layout from "@/components/layout/Layout";
import PostCard from "@/components/community/PostCard";
import CreatePostModal from "@/components/community/CreatePostModal";

import Button from "@/components/ui/Button";
import { Post } from "@/types";
import { postsAPI } from "@/utils/api";
import styles from "./page.module.scss";
import IconArrowLeft from "@assets/icon_arrow_left.svg";
import { useAuth } from "@/contexts/AuthContext";

const categories = [
  "전체",
  "기록 공유",
  "팁 공유",
  "질문",
  "훈련 후기",
  "훈련 모집",
  "챌린지",
  "가이드",
];

export default function CommunityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // URL 쿼리 파라미터에서 카테고리 확인
    const categoryParam = searchParams.get("category");
    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

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

      setPosts(fetchedPosts);
    } catch (error) {
      console.error("게시물을 불러오는데 실패했습니다:", error);
      setError("게시물을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    fetchPosts();
    setIsCreateModalOpen(false);
  };

  const handlePostDeleted = (postId: number) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };

  const handlePostUpdated = (updatedPost: Post) => {
    // 특정 게시물만 업데이트
    setPosts((prevPosts) =>
      prevPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
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

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <button
                onClick={() => router.push("/")}
                className={styles.backButton}
                title="뒤로 가기"
              >
                <IconArrowLeft width={20} height={20} />
              </button>
              <h1>커뮤니티</h1>
            </div>
            <p>수영에 대한 이야기를 나누고 훈련 파트너를 찾아보세요!</p>
          </div>
        </div>

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
            <h2>{selectedCategory === "훈련 모집" ? "훈련 모집" : "게시물"}</h2>
            {user && (
              <div className={styles.postActions}>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  새 게시물
                </Button>
              </div>
            )}
          </div>

          {loading ? (
            <div className={styles.loading}>로딩 중...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : posts.length === 0 ? (
            <div className={styles.emptyState}>
              {selectedCategory === "훈련 모집" ? (
                <>
                  <p>아직 훈련 모집글이 없습니다.</p>
                  <p>훈련 프로그램을 게시하면 자동으로 모집글이 생성됩니다!</p>
                </>
              ) : (
                <>
                  <p>게시물이 없습니다.</p>
                  {user && <p>첫 번째 게시물을 작성해보세요!</p>}
                </>
              )}
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

        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handlePostSubmit}
        />
      </div>
    </Layout>
  );
}
