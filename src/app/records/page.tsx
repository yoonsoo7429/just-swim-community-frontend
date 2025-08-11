"use client";

import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import RecordForm from "../../components/records/RecordForm/RecordForm";
import RecordCard from "../../components/records/RecordCard/RecordCard";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { swimmingAPI } from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";
import { SwimmingRecord } from "../../types";
import styles from "./page.module.scss";

export default function RecordsPage() {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [records, setRecords] = useState<SwimmingRecord[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 수영 기록 목록 가져오기
  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await swimmingAPI.getRecords();
      setRecords(response.data);
    } catch (err: any) {
      console.error("Failed to fetch records:", err);
      setError("수영 기록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

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
      setRecords([response.data, ...records]);
      setIsFormOpen(false);
    } catch (err: any) {
      console.error("Failed to create record:", err);
      alert("수영 기록 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (id: string) => {
    try {
      const record = records.find((r) => r.id.toString() === id);
      if (!record) return;

      if (record.isLiked) {
        await swimmingAPI.removeLike(id);
        // 좋아요 제거 후 상태 업데이트
        setRecords(
          records.map((r) =>
            r.id.toString() === id
              ? {
                  ...r,
                  isLiked: false,
                  likesCount: Math.max(0, r.likesCount - 1),
                }
              : r
          )
        );
      } else {
        await swimmingAPI.addLike(id);
        // 좋아요 추가 후 상태 업데이트
        setRecords(
          records.map((r) =>
            r.id.toString() === id
              ? { ...r, isLiked: true, likesCount: r.likesCount + 1 }
              : r
          )
        );
      }
    } catch (err: any) {
      console.error("Failed to toggle like:", err);
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  const handleComment = async (id: string, content: string) => {
    try {
      const response = await swimmingAPI.addComment(id, content);
      // 댓글 추가 후 댓글 수 증가
      setRecords(
        records.map((r) =>
          r.id.toString() === id
            ? { ...r, commentsCount: r.commentsCount + 1 }
            : r
        )
      );
      return response.data;
    } catch (err: any) {
      console.error("Failed to add comment:", err);
      alert("댓글 등록에 실패했습니다.");
      throw err;
    }
  };

  const handleShare = (id: string) => {
    console.log("Share record:", id);
  };

  const filteredRecords = records.filter((record) => {
    if (filter === "all") return true;
    return record.strokes?.some((stroke) => stroke.style === filter);
  });

  // 영법 한글명 매핑
  const styleLabels: { [key: string]: string } = {
    freestyle: "자유형",
    backstroke: "배영",
    breaststroke: "평영",
    butterfly: "접영",
    medley: "개인혼영",
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

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>수영 기록</h1>
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
              {filter === "all"
                ? "아직 수영 기록이 없습니다."
                : `${styleLabels[filter]} 기록이 없습니다.`}
            </div>
          ) : (
            filteredRecords.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
              />
            ))
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
      </div>
    </Layout>
  );
}
