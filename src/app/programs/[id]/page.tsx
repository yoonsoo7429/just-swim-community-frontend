"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import styles from "./page.module.scss";
import { Button, Layout } from "@/components";
import { trainingAPI } from "@/utils";
import { TrainingProgram, TrainingSession } from "@/types";

const ProgramDetailPage: React.FC = () => {
  const params = useParams();
  const programId = parseInt(params.id as string);

  const [program, setProgram] = useState<TrainingProgram | null>(null);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState(1);

  useEffect(() => {
    if (programId) {
      fetchProgramData();
    }
  }, [programId]);

  const fetchProgramData = async () => {
    try {
      setIsLoading(true);
      const [programResponse, sessionsResponse] = await Promise.all([
        trainingAPI.getProgram(programId.toString()),
        trainingAPI.getSessionsByProgram(programId.toString()),
      ]);

      setProgram(programResponse.data);
      setSessions(sessionsResponse.data);
    } catch (error) {
      console.error("프로그램 데이터 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "초급";
      case "intermediate":
        return "중급";
      case "advanced":
        return "고급";
      default:
        return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "#4CAF50";
      case "intermediate":
        return "#FF9800";
      case "advanced":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const getWeekSessions = (weekNumber: number) => {
    return sessions.filter((session) => session.weekNumber === weekNumber);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>프로그램을 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  if (!program) {
    return (
      <Layout>
        <div className={styles.error}>
          <h2>프로그램을 찾을 수 없습니다</h2>
          <p>요청하신 프로그램이 존재하지 않거나 삭제되었습니다.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.backButton}>
            <Button variant="secondary" onClick={() => window.history.back()}>
              ← 뒤로가기
            </Button>
          </div>

          <div className={styles.programInfo}>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>{program.title}</h1>
              <span
                className={styles.difficulty}
                style={{
                  backgroundColor: getDifficultyColor(program.difficulty),
                }}
              >
                {getDifficultyText(program.difficulty)}
              </span>
            </div>

            {program.description && (
              <p className={styles.description}>{program.description}</p>
            )}

            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.label}>총 주차</span>
                <span className={styles.value}>{program.totalWeeks}주</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.label}>주당 세션</span>
                <span className={styles.value}>
                  {program.sessionsPerWeek}회
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.label}>총 세션</span>
                <span className={styles.value}>
                  {program.totalWeeks * program.sessionsPerWeek}회
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.weeksNavigation}>
            <h3>주차별 훈련</h3>
            <div className={styles.weekTabs}>
              {Array.from({ length: program.totalWeeks }, (_, i) => i + 1).map(
                (week) => (
                  <button
                    key={week}
                    className={`${styles.weekTab} ${
                      activeWeek === week ? styles.active : ""
                    }`}
                    onClick={() => setActiveWeek(week)}
                  >
                    {week}주차
                  </button>
                )
              )}
            </div>
          </div>

          <div className={styles.sessionsList}>
            {getWeekSessions(activeWeek).length === 0 ? (
              <div className={styles.emptyWeek}>
                <p>이 주차에는 아직 훈련 세션이 없습니다.</p>
              </div>
            ) : (
              getWeekSessions(activeWeek)
                .sort((a, b) => a.sessionNumber - b.sessionNumber)
                .map((session) => (
                  <div key={session.id} className={styles.sessionCard}>
                    <div className={styles.sessionHeader}>
                      <h4 className={styles.sessionTitle}>{session.title}</h4>
                      <span className={styles.sessionNumber}>
                        {session.sessionNumber}번째 세션
                      </span>
                    </div>

                    {session.description && (
                      <p className={styles.sessionDescription}>
                        {session.description}
                      </p>
                    )}

                    <div className={styles.sessionDetails}>
                      <div className={styles.detail}>
                        <span className={styles.detailLabel}>총 거리</span>
                        <span className={styles.detailValue}>
                          {session.totalDistance}m
                        </span>
                      </div>
                      <div className={styles.detail}>
                        <span className={styles.detailLabel}>예상 시간</span>
                        <span className={styles.detailValue}>
                          {session.estimatedDuration}분
                        </span>
                      </div>
                    </div>

                    <div className={styles.workout}>
                      <h5>훈련 내용</h5>
                      <div className={styles.workoutContent}>
                        {session.workout.split("\n").map((line, index) => (
                          <p key={index} className={styles.workoutLine}>
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProgramDetailPage;
