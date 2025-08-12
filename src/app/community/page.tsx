"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PostCard from "@/components/community/PostCard";
import CreatePostModal from "@/components/community/CreatePostModal";
import Button from "@/components/ui/Button";
import { Post } from "@/types";
import { communityAPI } from "@/utils/api";
import styles from "./page.module.scss";

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    todayPosts: 0,
    todayComments: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    // URL 쿼리 파라미터에서 카테고리 확인
    const categoryParam = searchParams.get("category");
    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchPosts();
    fetchPopularPosts();
    fetchStats();
  }, [selectedCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let fetchedPosts;
      if (selectedCategory === "전체") {
        const response = await communityAPI.getPosts();
        fetchedPosts = response.data;
      } else {
        const response = await communityAPI.getPostsByCategory(
          selectedCategory
        );
        fetchedPosts = response.data;
      }
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("게시물을 불러오는데 실패했습니다:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularPosts = async () => {
    try {
      const response = await communityAPI.getPopularPosts();
      setPopularPosts(response.data);
    } catch (error) {
      console.error("인기 게시물을 불러오는데 실패했습니다:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await communityAPI.getCommunityStats();
      setStats(response.data);
    } catch (error) {
      console.error("커뮤니티 통계를 불러오는데 실패했습니다:", error);
    }
  };

  const handlePostCreated = () => {
    setIsCreateModalOpen(false);
    fetchPosts();
    fetchStats();
  };

  const handlePostDeleted = () => {
    fetchPosts();
    fetchStats();
  };

  const handlePostUpdated = () => {
    fetchPosts();
  };

  const handleLikeToggle = async (postId: number) => {
    try {
      await communityAPI.toggleLike(postId);
      fetchPosts();
      fetchPopularPosts();
    } catch (error) {
      console.error("좋아요 처리에 실패했습니다:", error);
    }
  };

  const handlePostSubmit = async (postData: {
    title: string;
    content: string;
    category: string;
  }) => {
    try {
      await communityAPI.createPost(postData);
      handlePostCreated();
    } catch (error) {
      console.error("게시물 작성에 실패했습니다:", error);
    }
  };

  const handleLikeUpdate = (updatedPost: Post) => {
    // 게시물 목록에서 해당 게시물 업데이트
    setPosts((prevPosts) =>
      prevPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );

    // 인기 게시물도 업데이트
    setPopularPosts((prevPopular) =>
      prevPopular.map((post) =>
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  };

  const handleHomeClick = () => {
    router.push("/");
  };

  const handlePostClick = (postId: number) => {
    router.push(`/posts/${postId}`);
  };

  return (
    <div className={styles.communityPage}>
      {/* 헤더 섹션 */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.navigationRow}>
            <Button
              onClick={handleHomeClick}
              variant="outline"
              className={styles.homeButton}
            >
              🏠 홈으로
            </Button>
          </div>
          <h1>커뮤니티</h1>
          <p>수영 애호가들과 경험과 팁을 공유해보세요</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className={styles.createButton}
        >
          글쓰기
        </Button>
      </div>

      {/* 통계 섹션 */}
      <div className={styles.statsSection}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{stats.totalMembers}</span>
          <span className={styles.statLabel}>전체 회원</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{stats.todayPosts}</span>
          <span className={styles.statLabel}>오늘 게시물</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{stats.todayComments}</span>
          <span className={styles.statLabel}>오늘 댓글</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{stats.activeUsers}</span>
          <span className={styles.statLabel}>활성 사용자</span>
        </div>
      </div>

      {/* 인기 게시물 섹션 */}
      {popularPosts.length > 0 && (
        <div className={styles.popularSection}>
          <h2>🔥 인기 게시물</h2>
          <div className={styles.popularPosts}>
            {popularPosts.slice(0, 3).map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => handlePostClick(post.id)}
                onLikeUpdate={handleLikeUpdate}
              />
            ))}
          </div>
        </div>
      )}

      {/* 카테고리 필터 */}
      <div className={styles.categoryFilter}>
        {categories.map((category) => (
          <button
            key={category}
            className={`${styles.categoryButton} ${
              selectedCategory === category ? styles.active : ""
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 게시물 목록 */}
      <div className={styles.postsSection}>
        <div className={styles.sectionHeader}>
          <h2>
            {selectedCategory === "전체" ? "전체 게시물" : selectedCategory}
          </h2>
          <span className={styles.postCount}>{posts.length}개</span>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>게시물을 불러오는 중...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>아직 게시물이 없습니다.</p>
            <p>첫 번째 게시물을 작성해보세요!</p>
          </div>
        ) : (
          <div className={styles.postsGrid}>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => handlePostClick(post.id)}
                onLikeUpdate={handleLikeUpdate}
              />
            ))}
          </div>
        )}
      </div>

      {/* 게시물 작성 모달 */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handlePostSubmit}
      />
    </div>
  );
}
