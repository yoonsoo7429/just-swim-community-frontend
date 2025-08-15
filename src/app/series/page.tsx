"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { trainingAPI, communityAPI, postsAPI } from "@/utils/api";
import { TrainingSeries } from "@/types";
import { CreateSeriesModal, SeriesCard } from "@/components/training";
import Button from "@/components/ui/Button";
import Layout from "@/components/layout/Layout";
import SignInButton from "@/components/auth/SignInButton";
import SignUpButton from "@/components/auth/SignUpButton";
import styles from "./page.module.scss";

const SeriesPage: React.FC = () => {
  const router = useRouter();
  const { user, signIn, signUp } = useAuth();
  const [mySeries, setMySeries] = useState<TrainingSeries[]>([]);
  const [publicSeries, setPublicSeries] = useState<TrainingSeries[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"my" | "public">("my");
  const [loading, setLoading] = useState(true);
  const [trainingPrograms, setTrainingPrograms] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchSeries();
      fetchTrainingPrograms();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSeries = async () => {
    try {
      setLoading(true);
      const [mySeriesData, publicSeriesData] = await Promise.all([
        trainingAPI.getMySeries(),
        trainingAPI.getPublicSeries(),
      ]);
      setMySeries(mySeriesData.data || []);
      setPublicSeries(publicSeriesData.data || []);
    } catch (error) {
      console.error("시리즈 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainingPrograms = async () => {
    try {
      const response = await trainingAPI.getMyPrograms();
      setTrainingPrograms(response.data || []);
    } catch (error) {
      console.error("훈련 프로그램 조회 실패:", error);
    }
  };

  const handleCreateSeries = async (data: any) => {
    try {
      await trainingAPI.createSeries(data);
      setIsCreateModalOpen(false);
      fetchSeries();
    } catch (error) {
      console.error("시리즈 생성 실패:", error);
      alert("시리즈 생성에 실패했습니다.");
    }
  };

  const handleJoinSeries = async (seriesId: number) => {
    try {
      // 시리즈에 참여하는 로직 (첫 번째 모임에 자동 참여)
      const series = publicSeries.find((s) => s.id === seriesId);
      if (series && series.meetings && series.meetings.length > 0) {
        const firstMeeting = series.meetings[0];
        await trainingAPI.joinMeeting(firstMeeting.id, {
          isRegularParticipant: true,
          notes: "시리즈 참여",
        });
        alert("시리즈에 참여했습니다!");
        fetchSeries();
      } else {
        alert("참여할 수 있는 모임이 없습니다.");
      }
    } catch (error) {
      console.error("시리즈 참여 실패:", error);
      alert("시리즈 참여에 실패했습니다.");
    }
  };

  const handleViewDetails = (seriesId: number) => {
    // 시리즈 상세 페이지로 이동
    router.push(`/series/${seriesId}`);
  };

  const handleShareToCommunity = async (seriesId: number) => {
    try {
      await postsAPI.createTrainingSeriesPost(
        seriesId,
        "정기 모임에 참여하세요!"
      );
      alert("커뮤니티에 공유되었습니다!");
    } catch (error) {
      console.error("커뮤니티 공유 실패:", error);
      alert("커뮤니티 공유에 실패했습니다.");
    }
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

  if (loading) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.loading}>로딩 중...</div>
        </div>
      </Layout>
    );
  }

  // 로그인하지 않은 사용자 처리
  if (!user) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.loginRequired}>
            <div className={styles.loginIcon}>🔐</div>
            <h1>로그인이 필요합니다</h1>
            <p>
              정기 모임을 이용하려면 로그인이 필요합니다. 지금 가입하고 다른
              수영인들과 함께하는 정기 모임에 참여해보세요!
            </p>
            <div className={styles.loginActions}>
              <SignInButton onSignIn={handleSignIn} />
              <SignUpButton onSignUp={handleSignUp} />
            </div>
            <div className={styles.backToHome}>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className={styles.homeButton}
              >
                홈으로 돌아가기
              </Button>
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
          <h1>정기 모임 관리</h1>
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className={styles.createButton}
          >
            새 시리즈 만들기
          </Button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "my" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("my")}
          >
            내 시리즈 ({mySeries.length})
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "public" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("public")}
          >
            참여 가능한 시리즈 ({publicSeries.length})
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === "my" ? (
            <div className={styles.seriesGrid}>
              {mySeries.length > 0 ? (
                mySeries.map((series) => (
                  <SeriesCard
                    key={series.id}
                    series={series}
                    onViewDetails={handleViewDetails}
                    onShareToCommunity={handleShareToCommunity}
                    showActions={true}
                    isMySeries={true}
                  />
                ))
              ) : (
                <div className={styles.emptyState}>
                  <h3>아직 생성한 시리즈가 없습니다</h3>
                  <p>새로운 정기 모임 시리즈를 만들어보세요!</p>
                  <Button
                    variant="primary"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    첫 시리즈 만들기
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.seriesGrid}>
              {publicSeries.length > 0 ? (
                publicSeries.map((series) => (
                  <SeriesCard
                    key={series.id}
                    series={series}
                    onJoin={handleJoinSeries}
                    onViewDetails={handleViewDetails}
                    showActions={true}
                    isMySeries={false}
                  />
                ))
              ) : (
                <div className={styles.emptyState}>
                  <h3>참여 가능한 시리즈가 없습니다</h3>
                  <p>다른 사용자들이 만든 정기 모임을 기다려보세요!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CreateSeriesModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSeries}
        trainingPrograms={trainingPrograms}
      />
    </Layout>
  );
};

export default SeriesPage;
