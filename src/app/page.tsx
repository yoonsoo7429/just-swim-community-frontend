"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "../components/layout/Layout";
import { PostCard, CreatePostModal } from "../components/community";
import { Post, CommunityStats, PostCategory } from "../types";
import {
  getPosts,
  getPopularPosts,
  getCommunityStats,
  createPost,
  likePost,
} from "../utils/communityApi";
import { useAuth } from "../contexts/AuthContext";
import { useLikedPosts } from "../hooks/useLikedPosts";
import styles from "./page.module.scss";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { isLiked, setLiked } = useLikedPosts();
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [communityStats, setCommunityStats] = useState<CommunityStats>({
    totalMembers: 0,
    todayPosts: 0,
    todayComments: 0,
    activeUsers: 0,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]); // user가 변경될 때마다 데이터 다시 로드

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [posts, popular, stats] = await Promise.all([
        getPosts(),
        getPopularPosts(),
        getCommunityStats(),
      ]);

      setRecentPosts(posts.slice(0, 4)); // 최근 4개만 표시
      setPopularPosts(popular.slice(0, 2)); // 인기 2개만 표시
      setCommunityStats(stats);
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
      setError("데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (data: {
    title: string;
    content: string;
    category: PostCategory;
  }) => {
    try {
      const newPost = await createPost(data);
      setRecentPosts((prev) => [newPost, ...prev.slice(0, 3)]);
      alert("게시물이 성공적으로 작성되었습니다!");
    } catch (error) {
      console.error("게시물 작성 실패:", error);
      alert("게시물 작성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleLikeUpdate = (updatedPost: Post) => {
    // 최근 게시물 목록 업데이트
    setRecentPosts((prev) =>
      prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );

    // 인기 게시물 목록 업데이트
    setPopularPosts((prev) =>
      prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
  };

  const handlePostClick = (postId: number) => {
    router.push(`/posts/${postId}`);
  };

  const handleCategoryClick = (category: PostCategory) => {
    // 카테고리별 게시물 페이지로 이동 (나중에 구현)
    console.log("카테고리 클릭:", category);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>커뮤니티를 불러오는 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={loadData} className={styles.retryButton}>
              다시 시도
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        {/* 커뮤니티 헤더 */}
        <section className={styles.communityHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.communityTitle}>Just Swim 커뮤니티</h1>
            <p className={styles.communitySubtitle}>
              수영인들과 함께 기록을 공유하고 성장하는 공간
            </p>
            <div className={styles.quickActions}>
              <button
                className={styles.actionButton}
                onClick={() => setIsCreateModalOpen(true)}
              >
                📝 새 글 작성
              </button>
              <button className={styles.actionButton}>📊 기록 올리기</button>
              <button className={styles.actionButton}>💬 질문하기</button>
            </div>
          </div>
        </section>

        <div className={styles.mainContent}>
          {/* 왼쪽 컬럼 - 최근 게시물 */}
          <div className={styles.leftColumn}>
            <section className={styles.recentPosts}>
              <div className={styles.sectionHeader}>
                <h2>최근 게시물</h2>
                <button className={styles.viewAllButton}>전체보기</button>
              </div>
              <div className={styles.postsList}>
                {recentPosts.length > 0 ? (
                  recentPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onClick={() => handlePostClick(post.id)}
                      onLikeUpdate={handleLikeUpdate}
                    />
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <p>아직 게시물이 없습니다.</p>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className={styles.createFirstPostButton}
                    >
                      첫 게시물 작성하기
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* 오른쪽 컬럼 - 사이드바 */}
          <div className={styles.rightColumn}>
            {/* 커뮤니티 통계 */}
            <section className={styles.communityStats}>
              <h3>커뮤니티 현황</h3>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>
                    {communityStats.totalMembers}
                  </div>
                  <div className={styles.statLabel}>총 회원</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>
                    {communityStats.todayPosts}
                  </div>
                  <div className={styles.statLabel}>오늘 글</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>
                    {communityStats.todayComments}
                  </div>
                  <div className={styles.statLabel}>오늘 댓글</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>
                    {communityStats.activeUsers}
                  </div>
                  <div className={styles.statLabel}>활성 사용자</div>
                </div>
              </div>
            </section>

            {/* 인기 게시물 */}
            <section className={styles.popularPosts}>
              <h3>인기 게시물</h3>
              <div className={styles.popularList}>
                {popularPosts.length > 0 ? (
                  popularPosts.map((post) => (
                    <div
                      key={post.id}
                      className={styles.popularCard}
                      onClick={() => handlePostClick(post.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className={styles.popularHeader}>
                        <span className={styles.category}>{post.category}</span>
                        <span className={styles.time}>
                          {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                      <h4 className={styles.popularTitle}>{post.title}</h4>
                      <div className={styles.popularMeta}>
                        <span className={styles.author}>
                          by {post.author?.name || "익명"}
                        </span>
                        <div className={styles.engagement}>
                          <span
                            className={styles.likes}
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (!user) {
                                alert("로그인이 필요합니다.");
                                return;
                              }
                              try {
                                const updatedPost = await likePost(post.id);
                                setLiked(post.id, updatedPost.isLiked || false);
                                handleLikeUpdate(updatedPost);
                              } catch (error) {
                                console.error("좋아요 처리 실패:", error);
                                alert("좋아요 처리에 실패했습니다.");
                              }
                            }}
                            style={{ cursor: user ? "pointer" : "default" }}
                          >
                            {isLiked(post.id) ? "❤️" : "🤍"} {post.likes}
                          </span>
                          <span className={styles.comments}>
                            💬 {post.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyPopular}>
                    <p>아직 인기 게시물이 없습니다.</p>
                  </div>
                )}
              </div>
            </section>

            {/* 카테고리 */}
            <section className={styles.categories}>
              <h3>카테고리</h3>
              <div className={styles.categoryList}>
                {[
                  "기록 공유",
                  "팁 공유",
                  "질문",
                  "훈련 후기",
                  "챌린지",
                  "가이드",
                ].map((category) => (
                  <button
                    key={category}
                    className={styles.categoryButton}
                    onClick={() =>
                      handleCategoryClick(category as PostCategory)
                    }
                  >
                    {category === "기록 공유" && "📊"}
                    {category === "팁 공유" && "💡"}
                    {category === "질문" && "❓"}
                    {category === "훈련 후기" && "📋"}
                    {category === "챌린지" && "🏆"}
                    {category === "가이드" && "📚"}
                    {category}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* 게시물 작성 모달 */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </Layout>
  );
}
