"use client";

import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import RecordForm from "../../components/records/RecordForm/RecordForm";
import RecordCard from "../../components/records/RecordCard/RecordCard";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { swimmingAPI, communityAPI } from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";
import { SwimmingRecord } from "../../types";
import styles from "./page.module.scss";

interface RecordWithShareStatus extends SwimmingRecord {
  isShared?: boolean;
  sharedPostId?: number;
}

export default function RecordsPage() {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [records, setRecords] = useState<RecordWithShareStatus[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 내 수영 기록 목록 가져오기
  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await swimmingAPI.getMyRecords();
      const recordsData = response.data;

      // 각 기록의 공유 상태 확인
      const recordsWithShareStatus = await Promise.all(
        recordsData.map(async (record: SwimmingRecord) => {
          try {
            const shareStatusResponse =
              await communityAPI.getSwimmingRecordShareStatus(
                record.id.toString()
              );
            return {
              ...record,
              isShared: shareStatusResponse.data.isShared,
              sharedPostId: shareStatusResponse.data.postId,
            };
          } catch (error) {
            console.error(
              `공유 상태 확인 실패 (기록 ID: ${record.id}):`,
              error
            );
            return {
              ...record,
              isShared: false,
              sharedPostId: undefined,
            };
          }
        })
      );

      setRecords(recordsWithShareStatus);
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

  // 필터링된 기록 목록
  const filteredRecords = records.filter((record) => {
    if (filter === "all") return true;
    return record.strokes.some((stroke) => stroke.style === filter);
  });

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

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>내 수영 기록</h1>
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
      </div>
    </Layout>
  );
}
