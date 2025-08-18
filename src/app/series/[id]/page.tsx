"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { trainingAPI } from "@/utils/api";
import { TrainingSeries, TrainingMeeting } from "@/types";
import { Button } from "@/components/ui";
import styles from "./page.module.scss";
import IconArrowLeft from "@assets/icon_arrow_left.svg";

const SeriesDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [series, setSeries] = useState<TrainingSeries | null>(null);
  const [meetings, setMeetings] = useState<TrainingMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "meetings" | "participants"
  >("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const seriesId = Number(params.id);

  useEffect(() => {
    if (seriesId && user) {
      fetchSeriesDetails();
    }
  }, [seriesId, user]);

  const fetchSeriesDetails = async () => {
    try {
      setLoading(true);
      const [seriesData, meetingsData] = await Promise.all([
        trainingAPI.getSeries(),
        trainingAPI.getMeetingsBySeries(seriesId),
      ]);
      setSeries(seriesData.data);
      setMeetings(meetingsData.data || []);
    } catch (error) {
      console.error("시리즈 상세 정보 조회 실패:", error);
      alert("시리즈 정보를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMeetings = async () => {
    try {
      await trainingAPI.generateNextMeetings(seriesId);
      alert("다음 모임들이 생성되었습니다!");
      fetchSeriesDetails();
    } catch (error) {
      console.error("모임 생성 실패:", error);
      alert("모임 생성에 실패했습니다.");
    }
  };

  const handlePublishSeries = async () => {
    try {
      if (series?.isPublished) {
        await trainingAPI.unpublishSeries(seriesId);
        alert("시리즈가 비공개되었습니다.");
      } else {
        await trainingAPI.publishSeries(seriesId);
        alert("시리즈가 공개되었습니다.");
      }
      fetchSeriesDetails();
    } catch (error) {
      console.error("시리즈 상태 변경 실패:", error);
      alert("시리즈 상태 변경에 실패했습니다.");
    }
  };

  const handleEditSeries = () => {
    // 시리즈 수정 페이지로 이동 (향후 구현)
    alert("시리즈 수정 기능은 준비 중입니다.");
  };

  const handleDeleteSeries = async () => {
    if (!confirm("정말로 이 시리즈를 삭제하시겠습니까?")) return;

    try {
      await trainingAPI.deleteSeries(seriesId);
      alert("시리즈가 삭제되었습니다.");
      router.push("/series");
    } catch (error) {
      console.error("시리즈 삭제 실패:", error);
      alert("시리즈 삭제에 실패했습니다.");
    }
  };

  const formatRepeatDays = (days: string[]) => {
    const dayMap: { [key: string]: string } = {
      monday: "월요일",
      tuesday: "화요일",
      wednesday: "수요일",
      thursday: "목요일",
      friday: "금요일",
      saturday: "토요일",
      sunday: "일요일",
    };
    return days?.map((day) => dayMap[day] || day).join(", ") || "설정 없음";
  };

  const getDifficultyLabel = (difficulty: string) => {
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "one-time":
        return "일회성";
      case "recurring":
        return "정기";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>시리즈를 찾을 수 없습니다.</div>
      </div>
    );
  }

  const isOwner = user?.id === series.userId;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backButton} onClick={() => router.back()}>
            <IconArrowLeft width={20} height={20} />
          </button>
          <h1>{series.title}</h1>
        </div>

        {isOwner && (
          <div className={styles.headerActions}>
            <Button variant="outline" onClick={handleEditSeries}>
              수정
            </Button>
            <Button
              variant={series.isPublished ? "secondary" : "primary"}
              onClick={handlePublishSeries}
            >
              {series.isPublished ? "비공개" : "공개"}
            </Button>
            <Button
              variant="outline"
              onClick={handleGenerateMeetings}
              disabled={series.type !== "recurring"}
            >
              다음 모임 생성
            </Button>
            <Button
              variant="secondary"
              onClick={handleDeleteSeries}
              className={styles.deleteButton}
            >
              삭제
            </Button>
          </div>
        )}
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            activeTab === "overview" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("overview")}
        >
          개요
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "meetings" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("meetings")}
        >
          모임 목록 ({meetings.length})
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "participants" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("participants")}
        >
          참여자
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === "overview" && (
          <div className={styles.overview}>
            <div className={styles.infoSection}>
              <h3>기본 정보</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>설명</span>
                  <span className={styles.value}>
                    {series.description || "설명이 없습니다."}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>난이도</span>
                  <span className={styles.value}>
                    {getDifficultyLabel(series.difficulty)}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>타입</span>
                  <span className={styles.value}>
                    {getTypeLabel(series.type)}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>상태</span>
                  <span
                    className={`${styles.status} ${
                      series.isPublished ? styles.published : styles.draft
                    }`}
                  >
                    {series.isPublished ? "공개" : "초안"}
                  </span>
                </div>
              </div>
            </div>

            {series.type === "recurring" && (
              <div className={styles.infoSection}>
                <h3>반복 설정</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>반복 요일</span>
                    <span className={styles.value}>
                      {formatRepeatDays(series.repeatDays || [])}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>시작 시간</span>
                    <span className={styles.value}>
                      {series.repeatTime || "설정 없음"}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>소요 시간</span>
                    <span className={styles.value}>
                      {series.duration
                        ? `${Math.floor(series.duration / 60)}시간 ${
                            series.duration % 60
                          }분`
                        : "설정 없음"}
                    </span>
                  </div>
                  {series.startDate && (
                    <div className={styles.infoItem}>
                      <span className={styles.label}>시작일</span>
                      <span className={styles.value}>
                        {new Date(series.startDate).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  )}
                  {series.endDate && (
                    <div className={styles.infoItem}>
                      <span className={styles.label}>종료일</span>
                      <span className={styles.value}>
                        {new Date(series.endDate).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className={styles.infoSection}>
              <h3>장소 및 인원</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>장소</span>
                  <span className={styles.value}>
                    {series.defaultLocation || "설정 없음"}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>참여자 수</span>
                  <span className={styles.value}>
                    {series.defaultMinParticipants}~
                    {series.defaultMaxParticipants}명
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.infoSection}>
              <h3>연결된 훈련 프로그램</h3>
              <div className={styles.programInfo}>
                <span className={styles.programTitle}>
                  {series.trainingProgram?.title || "연결된 프로그램 없음"}
                </span>
                {series.trainingProgram && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(`/programs/${series.trainingProgram?.id}`)
                    }
                  >
                    프로그램 보기
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "meetings" && (
          <div className={styles.meetings}>
            <div className={styles.meetingsHeader}>
              <h3>모임 목록</h3>
              {isOwner && series.type === "recurring" && (
                <Button variant="primary" onClick={handleGenerateMeetings}>
                  다음 모임 생성
                </Button>
              )}
            </div>

            {meetings.length > 0 ? (
              <div className={styles.meetingsList}>
                {meetings.map((meeting) => (
                  <div key={meeting.id} className={styles.meetingItem}>
                    <div className={styles.meetingInfo}>
                      <div className={styles.meetingDate}>
                        {new Date(meeting.meetingDate).toLocaleDateString(
                          "ko-KR"
                        )}
                      </div>
                      <div className={styles.meetingTime}>
                        {meeting.startTime}
                      </div>
                      <div className={styles.meetingLocation}>
                        {meeting.location}
                      </div>
                      <div className={styles.meetingStatus}>
                        <span
                          className={`${styles.status} ${
                            styles[meeting.status]
                          }`}
                        >
                          {meeting.status === "open"
                            ? "모집중"
                            : meeting.status === "full"
                            ? "마감"
                            : meeting.status === "cancelled"
                            ? "취소됨"
                            : meeting.status === "completed"
                            ? "완료"
                            : meeting.status}
                        </span>
                      </div>
                    </div>
                    <div className={styles.meetingParticipants}>
                      {meeting.currentParticipants}/{meeting.maxParticipants}명
                    </div>
                    {meeting.isModified && (
                      <div className={styles.modifiedBadge}>수정됨</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>아직 생성된 모임이 없습니다.</p>
                {isOwner && series.type === "recurring" && (
                  <Button variant="primary" onClick={handleGenerateMeetings}>
                    첫 모임 생성하기
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "participants" && (
          <div className={styles.participants}>
            <h3>참여자 관리</h3>
            <p>참여자 관리 기능은 준비 중입니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeriesDetailPage;
