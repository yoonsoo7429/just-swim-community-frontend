"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Layout } from "@/components/layout";
import {
  trainingAPI,
  trainingProgressAPI,
  trainingReviewAPI,
} from "@/utils/api";
import { ProgramProgressCard, ProgramReviewCard } from "@/components/training";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./page.module.scss";

const ProgramDetailPage: React.FC = () => {
  const params = useParams();
  const programId = Number(params.id);
  const { user } = useAuth();

  const [program, setProgram] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "progress" | "reviews" | "statistics"
  >("overview");
  const [programProgress, setProgramProgress] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [isStartingProgram, setIsStartingProgram] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (programId) {
      fetchProgramData();
    }
  }, [programId]);

  useEffect(() => {
    if (user && program) {
      fetchAdditionalData();
    }
  }, [user, program]);

  const fetchProgramData = async () => {
    try {
      setLoading(true);
      const [programResponse, sessionsResponse] = await Promise.all([
        trainingAPI.getProgramById(programId),
        trainingAPI.getSessionsByProgram(programId),
      ]);

      setProgram(programResponse.data);
      setSessions(sessionsResponse.data || []);
    } catch (error) {
      console.error("프로그램 데이터 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdditionalData = async () => {
    try {
      const [progressResponse, reviewsResponse, statisticsResponse] =
        await Promise.all([
          trainingProgressAPI.getProgramProgress(programId).catch(() => null),
          trainingReviewAPI.getProgramReviews(programId),
          trainingReviewAPI.getProgramReviewStatistics(programId),
        ]);

      setProgramProgress(progressResponse?.data || null);
      setReviews(reviewsResponse.data || []);
      setStatistics(statisticsResponse.data || null);
    } catch (error) {
      console.error("추가 데이터 조회 실패:", error);
    }
  };

  const handleStartProgram = async () => {
    if (!user || !program) return;

    try {
      setIsStartingProgram(true);
      await trainingProgressAPI.startProgram(programId, sessions.length);
      await fetchAdditionalData(); // 진행률 데이터 새로고침
    } catch (error) {
      console.error("프로그램 시작 실패:", error);
    } finally {
      setIsStartingProgram(false);
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    if (!user || !program) return;

    try {
      await trainingProgressAPI.completeSession(Number(sessionId), programId, {
        status: "completed",
        completedDate: new Date().toISOString(),
      });
      await fetchAdditionalData();
    } catch (error) {
      console.error("세션 완료 실패:", error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className={styles.overview}>
            <div className={styles.programInfo}>
              <h2>{program?.title}</h2>
              <p className={styles.description}>{program?.description}</p>
              <div className={styles.meta}>
                <span>난이도: {program?.difficulty}</span>
                <span>유형: {program?.type}</span>
                <span>총 세션: {sessions.length}개</span>
              </div>
            </div>

            <div className={styles.sessions}>
              <h3>세션 목록</h3>
              {sessions.map((session) => (
                <div key={session.id} className={styles.sessionItem}>
                  <h4>{session.title}</h4>
                  <p>{session.description}</p>
                  <div className={styles.sessionMeta}>
                    <span>주차: {session.weekNumber}</span>
                    <span>세션: {session.sessionNumber}</span>
                    <span>거리: {session.totalDistance}m</span>
                    <span>예상 시간: {session.estimatedDuration}분</span>
                  </div>
                  {user && (
                    <button
                      onClick={() => handleCompleteSession(session.id)}
                      className={styles.completeButton}
                    >
                      완료
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "progress":
        return (
          <div className={styles.progress}>
            {programProgress ? (
              <ProgramProgressCard
                program={program}
                progress={{
                  completedSessions: programProgress.completedSessions,
                  totalSessions: programProgress.totalSessions,
                  progressPercentage: programProgress.progressPercentage,
                  status: programProgress.status,
                  startDate: programProgress.startDate,
                  lastCompletedDate: programProgress.lastCompletedDate,
                }}
                onCompleteSession={handleCompleteSession}
              />
            ) : (
              <div className={styles.noData}>
                <p>아직 프로그램을 시작하지 않았습니다.</p>
                {user && (
                  <button
                    onClick={handleStartProgram}
                    disabled={isStartingProgram}
                    className={styles.startButton}
                  >
                    {isStartingProgram ? "시작 중..." : "프로그램 시작하기"}
                  </button>
                )}
              </div>
            )}
          </div>
        );

      case "reviews":
        return (
          <div className={styles.reviews}>
            <h3>프로그램 리뷰</h3>
            {reviews.length > 0 ? (
              <div className={styles.reviewList}>
                {reviews.map((review) => (
                  <ProgramReviewCard
                    key={review.id}
                    review={review}
                    isMyReview={review.userId === user?.id}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.noData}>
                <p>아직 리뷰가 없습니다.</p>
              </div>
            )}
          </div>
        );

      case "statistics":
        return (
          <div className={styles.statistics}>
            <h3>프로그램 통계</h3>
            {statistics ? (
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <h4>평균 평점</h4>
                  <p className={styles.statValue}>
                    {statistics.averageRating.toFixed(1)}
                  </p>
                </div>
                <div className={styles.statCard}>
                  <h4>총 리뷰 수</h4>
                  <p className={styles.statValue}>{statistics.totalReviews}</p>
                </div>
                {statistics.categoryRatings && (
                  <div className={styles.statCard}>
                    <h4>카테고리별 평점</h4>
                    <div className={styles.categoryRatings}>
                      {Object.entries(statistics.categoryRatings).map(
                        ([category, rating]) => (
                          <div key={category} className={styles.categoryRating}>
                            <span>{category}:</span>
                            <span>{Number(rating).toFixed(1)}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.noData}>
                <p>아직 통계 데이터가 없습니다.</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <p>로딩 중...</p>
        </div>
      </Layout>
    );
  }

  if (!program) {
    return (
      <Layout>
        <div className={styles.error}>
          <p>프로그램을 찾을 수 없습니다.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>{program.title}</h1>
          <div className={styles.actions}>
            {user && program.userId === user.id && (
              <>
                <button className={styles.editButton}>수정</button>
                <button className={styles.deleteButton}>삭제</button>
              </>
            )}
            {user && program.visibility === "public" && (
              <button className={styles.joinButton}>참여하기</button>
            )}
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "overview" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("overview")}
          >
            개요
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "progress" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("progress")}
          >
            진행률
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "reviews" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("reviews")}
          >
            리뷰
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "statistics" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("statistics")}
          >
            통계
          </button>
        </div>

        <div className={styles.tabContent}>{renderTabContent()}</div>
      </div>
    </Layout>
  );
};

export default ProgramDetailPage;
