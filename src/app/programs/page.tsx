"use client";

import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import Button from "../../components/ui/Button";
import styles from "./page.module.scss";

// 임시 데이터
const mockPrograms = [
  {
    id: "1",
    title: "자유형 기초 훈련",
    description: "자유형을 처음 배우는 분들을 위한 4주 훈련 프로그램",
    duration: "4주",
    level: "초급",
    author: "김수영",
    likes: 45,
    shares: 12,
    image: "https://via.placeholder.com/300x200",
    exercises: [
      "기본 자세 연습",
      "호흡법 훈련",
      "팔 동작 연습",
      "다리 동작 연습",
    ],
  },
  {
    id: "2",
    title: "지구력 향상 훈련",
    description: "수영 지구력을 향상시키는 6주 훈련 프로그램",
    duration: "6주",
    level: "중급",
    author: "박영수",
    likes: 32,
    shares: 8,
    image: "https://via.placeholder.com/300x200",
    exercises: [
      "인터벌 훈련",
      "거리별 훈련",
      "기술 개선",
      "체력 관리",
    ],
  },
  {
    id: "3",
    title: "경영 기술 훈련",
    description: "경영을 위한 고급 기술 훈련 프로그램",
    duration: "8주",
    level: "고급",
    author: "이영희",
    likes: 28,
    shares: 15,
    image: "https://via.placeholder.com/300x200",
    exercises: [
      "스타트 훈련",
      "턴 기술",
      "경영 전략",
      "심리 관리",
    ],
  },
];

export default function ProgramsPage() {
  const [filter, setFilter] = useState("all");

  const filteredPrograms = mockPrograms.filter((program) => {
    if (filter === "all") return true;
    return program.level === filter;
  });

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>훈련 프로그램</h1>
          <Button variant="primary" className={styles.addButton}>
            프로그램 공유하기
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
            className={`${styles.filterButton} ${filter === "초급" ? styles.active : ""}`}
            onClick={() => setFilter("초급")}
          >
            초급
          </button>
          <button
            className={`${styles.filterButton} ${filter === "중급" ? styles.active : ""}`}
            onClick={() => setFilter("중급")}
          >
            중급
          </button>
          <button
            className={`${styles.filterButton} ${filter === "고급" ? styles.active : ""}`}
            onClick={() => setFilter("고급")}
          >
            고급
          </button>
        </div>

        <div className={styles.programsGrid}>
          {filteredPrograms.map((program) => (
            <div key={program.id} className={styles.programCard}>
              <div className={styles.programImage}>
                <img src={program.image} alt={program.title} />
                <div className={styles.levelBadge}>{program.level}</div>
              </div>
              
              <div className={styles.programContent}>
                <h3 className={styles.programTitle}>{program.title}</h3>
                <p className={styles.programDescription}>{program.description}</p>
                
                <div className={styles.programMeta}>
                  <span className={styles.duration}>{program.duration}</span>
                  <span className={styles.author}>by {program.author}</span>
                </div>

                <div className={styles.exercises}>
                  <h4>주요 훈련 내용</h4>
                  <ul>
                    {program.exercises.map((exercise, index) => (
                      <li key={index}>{exercise}</li>
                    ))}
                  </ul>
                </div>

                <div className={styles.programActions}>
                  <button className={styles.actionButton}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                    {program.likes}
                  </button>
                  
                  <button className={styles.actionButton}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                    {program.shares}
                  </button>

                  <Button variant="outline" size="small">
                    자세히 보기
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
} 