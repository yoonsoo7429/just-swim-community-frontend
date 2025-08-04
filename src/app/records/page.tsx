"use client";

import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import RecordForm from "../../components/records/RecordForm/RecordForm";
import RecordCard from "../../components/records/RecordCard/RecordCard";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import styles from "./page.module.scss";

// 임시 데이터
const mockRecords = [
  {
    id: "1",
    distance: 100,
    time: "01:45",
    stroke: "freestyle",
    description: "오늘은 자유형 100m를 1분 45초에 완주했습니다. 지난주보다 3초 빨라졌어요!",
    date: "2024-01-15",
    author: {
      name: "김수영",
      avatar: "https://via.placeholder.com/40",
    },
    likes: 12,
    comments: 5,
  },
  {
    id: "2",
    distance: 200,
    time: "03:30",
    stroke: "backstroke",
    description: "배영 200m 훈련. 어깨 회전이 부드러워졌습니다.",
    date: "2024-01-14",
    author: {
      name: "박영수",
      avatar: "https://via.placeholder.com/40",
    },
    likes: 8,
    comments: 3,
  },
  {
    id: "3",
    distance: 50,
    time: "00:45",
    stroke: "butterfly",
    description: "접영 50m 스프린트. 팔 동작에 집중했습니다.",
    date: "2024-01-13",
    author: {
      name: "이영희",
      avatar: "https://via.placeholder.com/40",
    },
    likes: 15,
    comments: 7,
  },
];

export default function RecordsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [records, setRecords] = useState(mockRecords);
  const [filter, setFilter] = useState("all");

  const handleSubmitRecord = (record: any) => {
    const newRecord = {
      id: Date.now().toString(),
      ...record,
      author: {
        name: "나",
        avatar: "https://via.placeholder.com/40",
      },
      likes: 0,
      comments: 0,
    };
    setRecords([newRecord, ...records]);
    setIsFormOpen(false);
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

  const filteredRecords = records.filter((record) => {
    if (filter === "all") return true;
    return record.stroke === filter;
  });

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
          {filteredRecords.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
            />
          ))}
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
        </Modal>
      </div>
    </Layout>
  );
} 