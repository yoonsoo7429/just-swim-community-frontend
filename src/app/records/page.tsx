"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";
import RecordForm from "@/components/records/RecordForm/RecordForm";
import RecordCard from "@/components/records/RecordCard/RecordCard";
import ShareRecordModal from "@/components/records/ShareRecordModal";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { swimmingAPI, communityAPI } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import { SwimmingRecord } from "@/types";
import SignInButton from "@/components/auth/SignInButton";
import SignUpButton from "@/components/auth/SignUpButton";
import styles from "./page.module.scss";
import IconArrowLeft from "@assets/icon_arrow_left.svg";

interface RecordWithShareStatus extends SwimmingRecord {
  isShared?: boolean;
  sharedPostId: number | null;
}

export default function RecordsPage() {
  const router = useRouter();
  const { user, signIn, signUp } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SwimmingRecord | null>(
    null
  );
  const [records, setRecords] = useState<RecordWithShareStatus[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRecords();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await swimmingAPI.getMyRecords();
      const recordsData = response.data || [];

      // 각 기록의 공유 상태 확인
      const recordsWithShareStatus = await Promise.all(
        recordsData.map(async (record: any) => {
          try {
            const shareStatusResponse =
              await communityAPI.getSwimmingRecordShareStatus(record.id);
            return {
              ...record,
              isShared: shareStatusResponse.data?.isShared || false,
              sharedPostId: shareStatusResponse.data?.postId || null,
            };
          } catch (error) {
            console.error(`기록 ${record.id}의 공유 상태 확인 실패:`, error);
            return {
              ...record,
              isShared: false,
              sharedPostId: null,
            };
          }
        })
      );

      setRecords(recordsWithShareStatus);
    } catch (error) {
      console.error("기록 조회 실패:", error);
      setError("기록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRecord = async (recordData: {
    title: string;
    description?: string;
    poolLength: 25 | 50;
    sessionStartTime: string;
    sessionEndTime: string;
    strokes: { style: string; distance: string }[];
    totalDistance: number;
    totalDuration: number;
    calories?: number;
    sessionDate?: string;
  }) => {
    try {
      setSubmitting(true);
      const response = await swimmingAPI.createRecord(recordData);

      // 새로 생성된 기록에 공유 상태 추가 (기본적으로 공유되지 않음)
      const newRecord: RecordWithShareStatus = {
        ...response.data,
        isShared: false,
        sharedPostId: undefined,
      };

      setRecords([newRecord, ...records]);
      setIsFormOpen(false);
    } catch (err: any) {
      console.error("Failed to create record:", err);
      alert("수영 기록 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
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

  const handleShareRecord = (record: SwimmingRecord) => {
    setSelectedRecord(record);
    setIsShareModalOpen(true);
  };

  const handleShareSuccess = (postId: number) => {
    if (selectedRecord) {
      // 해당 기록의 공유 상태를 업데이트
      setRecords((prevRecords) =>
        prevRecords.map((record) =>
          record.id === selectedRecord.id
            ? { ...record, isShared: true, sharedPostId: postId }
            : record
        )
      );

      alert("기록이 성공적으로 커뮤니티에 공유되었습니다!");

      // 커뮤니티 페이지로 이동할지 확인
      if (confirm("공유된 게시글을 확인하시겠습니까?")) {
        router.push(`/community`);
      }
    }
  };

  // 필터링된 기록 목록
  const filteredRecords = records.filter((record) => {
    if (filter === "all") return true;
    return record.strokes.some((stroke) => stroke.style === filter);
  });

  console.log("Filtered Records:", filteredRecords);

  const styleLabels: { [key: string]: string } = {
    all: "전체",
    freestyle: "자유형",
    backstroke: "배영",
    breaststroke: "평영",
    butterfly: "접영",
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

  // 로그인하지 않은 사용자 처리
  if (!user) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.loginRequired}>
            <div className={styles.loginIcon}>🔐</div>
            <h1>로그인이 필요합니다</h1>
            <p>
              수영 기록을 관리하려면 로그인이 필요합니다. 지금 가입하고 개인
              수영 기록을 시작해보세요!
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
          <div className={styles.title}>
            <button
              onClick={() => router.push("/")}
              className={styles.backButton}
              aria-label="뒤로 가기"
            >
              <IconArrowLeft width={20} height={20} />
            </button>
            <h1>내 수영 기록</h1>
          </div>
          <Button
            variant="primary"
            onClick={() => setIsFormOpen(true)}
            className={styles.addButton}
          >
            기록 올리기
          </Button>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
            <Button
              variant="outline"
              size="small"
              onClick={fetchRecords}
              className={styles.retryButton}
            >
              다시 시도
            </Button>
          </div>
        )}

        <div className={styles.filters}>
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
              filter === "freestyle" ? styles.active : ""
            }`}
            onClick={() => setFilter("freestyle")}
          >
            자유형
          </button>
          <button
            className={`${styles.filterButton} ${
              filter === "backstroke" ? styles.active : ""
            }`}
            onClick={() => setFilter("backstroke")}
          >
            배영
          </button>
          <button
            className={`${styles.filterButton} ${
              filter === "breaststroke" ? styles.active : ""
            }`}
            onClick={() => setFilter("breaststroke")}
          >
            평영
          </button>
          <button
            className={`${styles.filterButton} ${
              filter === "butterfly" ? styles.active : ""
            }`}
            onClick={() => setFilter("butterfly")}
          >
            접영
          </button>
        </div>

        <div className={styles.recordsList}>
          {filteredRecords.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🏊‍♂️</div>
              <h3>
                {filter === "all"
                  ? "아직 수영 기록이 없습니다"
                  : `${styleLabels[filter]} 기록이 없습니다`}
              </h3>
              <p>
                {filter === "all"
                  ? "첫 번째 수영 기록을 올려보세요!"
                  : "다른 영법의 기록을 작성해보세요"}
              </p>
              {filter === "all" && (
                <Button
                  variant="primary"
                  onClick={() => setIsFormOpen(true)}
                  className={styles.emptyStateButton}
                >
                  기록 올리기
                </Button>
              )}
            </div>
          ) : (
            <div className={styles.recordsGrid}>
              {filteredRecords.map((record) => (
                <RecordCard
                  key={record.id}
                  record={record}
                  viewMode="compact"
                  isShared={record.isShared}
                  sharedPostId={record.sharedPostId}
                  onShare={() => handleShareRecord(record)}
                />
              ))}
            </div>
          )}
        </div>

        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title="수영 기록 올리기"
          size="large"
        >
          <RecordForm
            onSubmit={handleSubmitRecord}
            onCancel={() => setIsFormOpen(false)}
          />
          {submitting && (
            <div className={styles.submitting}>기록을 등록하는 중...</div>
          )}
        </Modal>

        {selectedRecord && (
          <ShareRecordModal
            isOpen={isShareModalOpen}
            onClose={() => {
              setIsShareModalOpen(false);
              setSelectedRecord(null);
            }}
            record={selectedRecord}
            onShareSuccess={handleShareSuccess}
          />
        )}
      </div>
    </Layout>
  );
}
