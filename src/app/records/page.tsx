"use client";

import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import RecordForm from "../../components/records/RecordForm/RecordForm";
import RecordCard from "../../components/records/RecordCard/RecordCard";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { swimmingAPI } from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./page.module.scss";

interface SwimmingRecord {
  id: number;
  title: string;
  description?: string;
  duration: number;
  distance: number;
  style: string;
  sessionDate?: string;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

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

  const handleSubmitRecord = async (recordData: any) => {
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

  const handleLike = (id: string) => {
    console.log("Like record:", id);
  };

  const handleComment = (id: string) => {
    console.log("Comment on record:", id);
  };

  const handleShare = (id: string) => {
    console.log("Share record:", id);
  };

  // 분을 MM:SS 형식으로 변환
  const formatDuration = (duration: number): string => {
    const minutes = Math.floor(duration);
    const seconds = Math.round((duration - minutes) * 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const filteredRecords = records.filter((record) => {
    if (filter === "all") return true;
    return record.style === filter;
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
            className={`${styles.filterButton} ${filter === "all" ? styles.active : ""}`}
            onClick={() => setFilter("all")}
          >
            전체
          </button>
          <button
            className={`${styles.filterButton} ${filter === "freestyle" ? styles.active : ""}`}
            onClick={() => setFilter("freestyle")}
          >
            자유형
          </button>
          <button
            className={`${styles.filterButton} ${filter === "backstroke" ? styles.active : ""}`}
            onClick={() => setFilter("backstroke")}
          >
            배영
          </button>
          <button
            className={`${styles.filterButton} ${filter === "breaststroke" ? styles.active : ""}`}
            onClick={() => setFilter("breaststroke")}
          >
            평영
          </button>
          <button
            className={`${styles.filterButton} ${filter === "butterfly" ? styles.active : ""}`}
            onClick={() => setFilter("butterfly")}
          >
            접영
          </button>
        </div>

        <div className={styles.recordsList}>
          {filteredRecords.length === 0 ? (
            <div className={styles.emptyState}>
              {filter === "all" ? "아직 수영 기록이 없습니다." : `${styleLabels[filter]} 기록이 없습니다.`}
            </div>
          ) : (
            filteredRecords.map((record) => (
              <RecordCard
                key={record.id}
                record={{
                  id: record.id.toString(),
                  distance: record.distance,
                  time: formatDuration(record.duration),
                  stroke: record.style,
                  description: record.description || "",
                  date: record.sessionDate || record.createdAt.split('T')[0],
                  author: {
                    name: record.user?.name || "알 수 없음",
                    avatar: "https://via.placeholder.com/40",
                  },
                  likes: 0,
                  comments: 0,
                }}
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
            <div className={styles.submitting}>
              기록을 등록하는 중...
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
} 