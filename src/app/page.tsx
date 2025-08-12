"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "../components/layout/Layout";
import styles from "./page.module.scss";
import { communityAPI } from "@/utils";
import { CommunityStats, Post } from "@/types";

export default function Home() {
  const router = useRouter();
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [communityStats, setCommunityStats] = useState<CommunityStats>({
    totalMembers: 0,
    todayPosts: 0,
    todayComments: 0,
    activeUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [postsResponse, statsResponse] = await Promise.all([
        communityAPI.getPosts(),
        communityAPI.getCommunityStats(),
      ]);

      setRecentPosts(postsResponse.data.slice(0, 2)); // 최근 2개만 표시
      setCommunityStats(statsResponse.data);
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
      setError(
        "서비스 정보를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAllPosts = () => {
    router.push("/community");
  };

  const handleRecordUpload = () => {
    router.push("/records");
  };

  const handlePostClick = (postId: number) => {
    router.push(`/posts/${postId}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Just Swim을 준비하는 중...</p>
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
            <h1 className={styles.communityTitle}>
              Just Swim에 오신 것을 환영합니다
            </h1>
            <p className={styles.communitySubtitle}>
              수영 기록 관리, 훈련 프로그램, 그리고 커뮤니티를 한 곳에서
            </p>
            <div className={styles.quickActions}>
              <button
                className={styles.actionButton}
                onClick={() => router.push("/community")}
              >
                🏊‍♂️ 커뮤니티 둘러보기
              </button>
            </div>
          </div>
        </section>

        <div className={styles.mainContent}>
          {/* 왼쪽 컬럼 - 주요 기능 안내 */}
          <div className={styles.leftColumn}>
            <section className={styles.featuresOverview}>
              <div className={styles.sectionHeader}>
                <h2>주요 기능</h2>
              </div>
              <div className={styles.featuresList}>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>📊</div>
                  <h3>수영 기록 관리</h3>
                  <p>개인 수영 기록을 체계적으로 관리하고 성장을 추적하세요</p>
                  <button
                    className={styles.featureButton}
                    onClick={() => router.push("/records")}
                  >
                    기록 관리하기
                  </button>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>📋</div>
                  <h3>훈련 프로그램</h3>
                  <p>체계적인 훈련 프로그램으로 수영 실력을 향상시키세요</p>
                  <button
                    className={styles.featureButton}
                    onClick={() => router.push("/programs")}
                  >
                    프로그램 보기
                  </button>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>🏊‍♂️</div>
                  <h3>커뮤니티</h3>
                  <p>다른 수영인들과 경험과 팁을 공유하고 소통하세요</p>
                  <button
                    className={styles.featureButton}
                    onClick={() => router.push("/community")}
                  >
                    커뮤니티 참여
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* 오른쪽 컬럼 - 커뮤니티 미리보기 */}
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

            {/* 최근 게시물 미리보기 */}
            <section className={styles.recentPostsPreview}>
              <div className={styles.sectionHeader}>
                <h3>최근 게시물</h3>
                <button
                  className={styles.viewAllButton}
                  onClick={handleViewAllPosts}
                >
                  전체보기
                </button>
              </div>
              <div className={styles.postsPreview}>
                {recentPosts.length > 0 ? (
                  recentPosts.slice(0, 2).map((post) => (
                    <div
                      key={post.id}
                      className={styles.previewCard}
                      onClick={() => handlePostClick(post.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className={styles.previewHeader}>
                        <span className={styles.category}>{post.category}</span>
                        <span className={styles.time}>
                          {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                      <h4 className={styles.previewTitle}>{post.title}</h4>
                      <div className={styles.previewMeta}>
                        <span className={styles.author}>
                          by {post.author?.name || "익명"}
                        </span>
                        <div className={styles.engagement}>
                          <span className={styles.likes}>❤️ {post.likes}</span>
                          <span className={styles.comments}>
                            💬 {post.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyPreview}>
                    <p>아직 게시물이 없습니다.</p>
                    <button
                      onClick={() => router.push("/community")}
                      className={styles.createFirstPostButton}
                    >
                      커뮤니티 참여하기
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* 게시물 작성 모달 제거 - 더 이상 필요하지 않음 */}
    </Layout>
  );
}
