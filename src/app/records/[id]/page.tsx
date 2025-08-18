"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";
import RecordCard from "@/components/records/RecordCard/RecordCard";
import ShareRecordModal from "@/components/records/ShareRecordModal";
import Button from "@/components/ui/Button";
import { swimmingAPI, communityAPI } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import { SwimmingRecord } from "@/types";
import styles from "./page.module.scss";
import IconArrowLeft from "@assets/icon_arrow_left.svg";

export default function RecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [record, setRecord] = useState<SwimmingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShared, setIsShared] = useState(false);
  const [sharedPostId, setSharedPostId] = useState<number | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isUnsharing, setIsUnsharing] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // 시간을 초 단위로 변환하는 함수
  const getDurationInSeconds = (duration: number): number => {
    return duration >= 1000 ? duration : duration * 60;
  };

  // 평균 속도 계산 함수
  const calculateAverageSpeed = (
    distance: number,
    duration: number
  ): string => {
    if (distance <= 0) return "0";
    const durationInSeconds = getDurationInSeconds(duration);
    return (distance / (durationInSeconds / 60)).toFixed(1);
  };

  // 100m당 시간 계산 함수
  const calculateTimePer100m = (distance: number, duration: number): string => {
    if (distance <= 0) return "0";
    const durationInSeconds = getDurationInSeconds(duration);
    return (durationInSeconds / 60 / (distance / 100)).toFixed(1);
  };

  // 분당 칼로리 계산 함수
  const calculateCaloriesPerMinute = (
    calories: number,
    duration: number
  ): string => {
    if (calories <= 0) return "0";
    const durationInSeconds = getDurationInSeconds(duration);
    return (calories / (durationInSeconds / 60)).toFixed(1);
  };

  useEffect(() => {
    if (params.id) {
      console.log("현재 사용자:", user);
      console.log("액세스 토큰:", localStorage.getItem("access_token"));

      fetchRecord(Number(params.id));
      checkSharedStatus(Number(params.id));
    }
  }, [params.id]);

  const fetchRecord = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await swimmingAPI.getRecord(id);
      setRecord(response.data);
    } catch (err: any) {
      console.error("Failed to fetch record:", err);
      setError("수영 기록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 이 수영 기록이 커뮤니티에 공유되었는지 확인
  const checkSharedStatus = async (recordId: number) => {
    try {
      console.log(`공유 상태 확인 중... 기록 ID: ${recordId}`);
      const response = await communityAPI.getSwimmingRecordShareStatus(
        recordId
      );
      console.log("공유 상태 응답:", response.data);
      setIsShared(response.data.isShared);
      setSharedPostId(response.data.postId || null);
      console.log(
        `공유 상태 설정: isShared=${response.data.isShared}, postId=${response.data.postId}`
      );
    } catch (error) {
      console.error("공유 상태 확인 실패:", error);
      // 에러 발생 시 공유되지 않은 상태로 설정
      setIsShared(false);
      setSharedPostId(null);
    }
  };

  const handleShareRecord = () => {
    setIsShareModalOpen(true);
  };

  const handleShareSuccess = (postId: number) => {
    setIsShared(true);
    setSharedPostId(postId);
    alert("기록이 성공적으로 커뮤니티에 공유되었습니다!");

    // 커뮤니티 페이지로 이동할지 확인
    if (confirm("공유된 게시글을 확인하시겠습니까?")) {
      router.push(`/community`);
    }
  };

  const handleUnshareRecord = async () => {
    try {
      if (!sharedPostId) {
        alert("공유된 게시글을 찾을 수 없습니다.");
        return;
      }

      setIsUnsharing(true);

      // 게시글 삭제
      await communityAPI.deletePost(sharedPostId);

      alert("기록 공유가 해제되었습니다.");
      setIsShared(false);
      setSharedPostId(null);
    } catch (error) {
      console.error("기록 공유 해제 실패:", error);
      alert("기록 공유 해제에 실패했습니다.");
    } finally {
      setIsUnsharing(false);
    }
  };

  const handleViewSharedPost = () => {
    if (sharedPostId) {
      router.push(`/posts/${sharedPostId}`);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.loading}>수영 기록을 불러오는 중...</div>
        </div>
      </Layout>
    );
  }

  if (error || !record) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.error}>
            {error || "수영 기록을 찾을 수 없습니다."}
            <Button
              variant="outline"
              size="small"
              onClick={() => router.push("/records")}
              className={styles.backButton}
            >
              목록으로 돌아가기
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <button
            onClick={() => router.push("/records")}
            className={styles.backButton}
            aria-label="뒤로 가기"
          >
            <IconArrowLeft width={20} height={20} />
          </button>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>수영 기록 상세</h1>
              <div className={styles.shareStatus}>
                {!isShared ? (
                  <button
                    onClick={handleShareRecord}
                    disabled={isSharing}
                    className={styles.shareButton}
                  >
                    {isSharing ? "공유 중..." : "커뮤니티에 공유"}
                  </button>
                ) : (
                  <div className={styles.sharedStatus}>
                    <div className={styles.sharedActions}>
                      <button
                        onClick={handleViewSharedPost}
                        className={styles.viewSharedButton}
                      >
                        게시글 보기
                      </button>
                      <button
                        onClick={handleUnshareRecord}
                        disabled={isUnsharing}
                        className={styles.unshareButton}
                      >
                        {isUnsharing ? "취소 중..." : "공유 취소"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.recordDetail}>
          <RecordCard
            record={record}
            viewMode="detailed"
            isShared={isShared}
            sharedPostId={sharedPostId}
            onShare={handleShareRecord}
          />
        </div>

        <div className={styles.additionalInfo}>
          <div className={styles.infoSection}>
            <h3>기록 통계</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>평균 속도</span>
                <span className={styles.statValue}>
                  {calculateAverageSpeed(
                    record.totalDistance,
                    record.totalDuration
                  )}{" "}
                  m/min
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>100m당 시간</span>
                <span className={styles.statValue}>
                  {calculateTimePer100m(
                    record.totalDistance,
                    record.totalDuration
                  )}{" "}
                  min/100m
                </span>
              </div>
              {record.calories && (
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>분당 칼로리</span>
                  <span className={styles.statValue}>
                    {calculateCaloriesPerMinute(
                      record.calories,
                      record.totalDuration
                    )}{" "}
                    kcal/min
                  </span>
                </div>
              )}
            </div>
          </div>

          {record.strokes && record.strokes.length > 0 && (
            <div className={styles.infoSection}>
              <h3>영법별 상세 분석</h3>
              <div className={styles.strokesAnalysis}>
                {record.strokes.map((stroke, index) => (
                  <div key={index} className={styles.strokeAnalysis}>
                    <div className={styles.strokeHeader}>
                      <span className={styles.strokeName}>
                        {stroke.style === "freestyle"
                          ? "자유형"
                          : stroke.style === "backstroke"
                          ? "배영"
                          : stroke.style === "breaststroke"
                          ? "평영"
                          : stroke.style === "butterfly"
                          ? "접영"
                          : stroke.style === "medley"
                          ? "개인혼영"
                          : stroke.style}
                      </span>
                      <span className={styles.strokeDistance}>
                        {stroke.distance}m
                      </span>
                    </div>
                    <div className={styles.strokePercentage}>
                      {(
                        (parseInt(stroke.distance) / record.totalDistance) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {record && (
          <ShareRecordModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            record={record}
            onShareSuccess={handleShareSuccess}
          />
        )}
      </div>
    </Layout>
  );
}
