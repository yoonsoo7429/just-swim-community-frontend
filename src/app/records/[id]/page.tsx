"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "../../../components/layout/Layout";
import RecordCard from "../../../components/records/RecordCard/RecordCard";
import Button from "../../../components/ui/Button";
import { swimmingAPI, communityAPI } from "../../../utils/api";
import { useAuth } from "../../../contexts/AuthContext";
import { SwimmingRecord } from "../../../types";
import styles from "./page.module.scss";

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

  useEffect(() => {
    if (params.id) {
      console.log("현재 사용자:", user);
      console.log("액세스 토큰:", localStorage.getItem("access_token"));

      fetchRecord(params.id as string);
      checkSharedStatus(params.id as string);
    }
  }, [params.id]);

  const fetchRecord = async (id: string) => {
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
  const checkSharedStatus = async (recordId: string) => {
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

  // 커뮤니티에 공유하기
  const handleShareToCommunity = async () => {
    if (!record) return;

    try {
      setIsSharing(true);

      // 수영 기록을 커뮤니티에 연동하여 게시물 생성
      const response = await communityAPI.createSwimmingRecordPost(
        record.id.toString(),
        `${record.title} - 수영 기록을 공유합니다.`
      );

      // 성공 시 공유 상태 업데이트
      setIsShared(true);
      setSharedPostId(response.data.id);

      alert("수영 기록이 커뮤니티에 성공적으로 공유되었습니다!");

      // 공유 상태 다시 확인
      await checkSharedStatus(record.id.toString());
    } catch (error: any) {
      console.error("커뮤니티 공유 실패:", error);
      alert("커뮤니티 공유에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSharing(false);
    }
  };

  // 공유 취소하기
  const handleUnshareFromCommunity = async () => {
    if (!sharedPostId) return;

    if (!confirm("정말로 이 수영 기록의 공유를 취소하시겠습니까?")) {
      return;
    }

    try {
      setIsUnsharing(true);

      // 공유된 게시물 삭제
      await communityAPI.deletePost(sharedPostId);

      // 성공 시 공유 상태 업데이트
      setIsShared(false);
      setSharedPostId(null);

      alert("수영 기록 공유가 취소되었습니다.");
    } catch (error: any) {
      console.error("공유 취소 실패:", error);
      alert("공유 취소에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsUnsharing(false);
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
            ←
          </button>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>수영 기록 상세</h1>
              <div className={styles.shareStatus}>
                {!isShared ? (
                  <button
                    onClick={handleShareToCommunity}
                    disabled={isSharing}
                    className={styles.shareButton}
                  >
                    {isSharing ? "공유 중..." : "커뮤니티에 공유"}
                  </button>
                ) : (
                  <div className={styles.sharedStatus}>
                    <span className={styles.sharedText}>✓ 커뮤니티에 공유됨</span>
                    <button
                      onClick={handleUnshareFromCommunity}
                      disabled={isUnsharing}
                      className={styles.unshareButton}
                    >
                      {isUnsharing ? "취소 중..." : "공유 취소"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.recordDetail}>
          <RecordCard record={record} viewMode="detailed" />
        </div>

        <div className={styles.additionalInfo}>
          <div className={styles.infoSection}>
            <h3>기록 통계</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>평균 속도</span>
                <span className={styles.statValue}>
                  {record.totalDistance > 0
                    ? (
                        record.totalDistance /
                        (record.totalDuration / 60)
                      ).toFixed(1)
                    : 0}{" "}
                  m/min
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>100m당 시간</span>
                <span className={styles.statValue}>
                  {record.totalDistance > 0
                    ? (
                        record.totalDuration /
                        60 /
                        (record.totalDistance / 100)
                      ).toFixed(1)
                    : 0}{" "}
                  min/100m
                </span>
              </div>
              {record.calories && (
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>분당 칼로리</span>
                  <span className={styles.statValue}>
                    {record.totalDuration > 0
                      ? (record.calories / (record.totalDuration / 60)).toFixed(
                          1
                        )
                      : 0}{" "}
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
      </div>
    </Layout>
  );
}
