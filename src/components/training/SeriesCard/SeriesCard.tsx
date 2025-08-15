import React from "react";
import { TrainingSeries } from "@/types";
import { Button } from "@/components/ui";
import styles from "./styles.module.scss";

interface SeriesCardProps {
  series: TrainingSeries;
  onJoin?: (seriesId: number) => void;
  onLeave?: (seriesId: number) => void;
  onViewDetails?: (seriesId: number) => void;
  onShareToCommunity?: (seriesId: number) => void;
  showActions?: boolean;
  isMySeries?: boolean;
}

const SeriesCard: React.FC<SeriesCardProps> = ({
  series,
  onJoin,
  onLeave,
  onViewDetails,
  onShareToCommunity,
  showActions = true,
  isMySeries = false,
}) => {
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

  const formatRepeatDays = (days: string[]) => {
    const dayMap: { [key: string]: string } = {
      monday: "월",
      tuesday: "화",
      wednesday: "수",
      thursday: "목",
      friday: "금",
      saturday: "토",
      sunday: "일",
    };
    return days?.map((day) => dayMap[day] || day).join(", ") || "설정 없음";
  };

  const formatTime = (time: string) => {
    if (!time) return "설정 없음";
    return time;
  };

  const formatDuration = (duration: number) => {
    if (!duration) return "설정 없음";
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0) {
      return `${hours}시간 ${minutes > 0 ? `${minutes}분` : ""}`.trim();
    }
    return `${minutes}분`;
  };

  const getStatusBadge = () => {
    if (!series.isPublished) {
      return (
        <span className={styles.statusBadge + " " + styles.draft}>초안</span>
      );
    }
    if (!series.isActive) {
      return (
        <span className={styles.statusBadge + " " + styles.inactive}>
          비활성
        </span>
      );
    }
    return (
      <span className={styles.statusBadge + " " + styles.active}>활성</span>
    );
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{series.title}</h3>
          {getStatusBadge()}
        </div>
        <div className={styles.meta}>
          <span className={styles.difficulty}>
            {getDifficultyLabel(series.difficulty)}
          </span>
          <span className={styles.type}>{getTypeLabel(series.type)}</span>
        </div>
      </div>

      {series.description && (
        <p className={styles.description}>{series.description}</p>
      )}

      <div className={styles.schedule}>
        <h4>일정 정보</h4>
        <div className={styles.scheduleGrid}>
          {series.type === "recurring" ? (
            <>
              <div className={styles.scheduleItem}>
                <span className={styles.label}>반복 요일:</span>
                <span className={styles.value}>
                  {formatRepeatDays(series.repeatDays || [])}
                </span>
              </div>
              <div className={styles.scheduleItem}>
                <span className={styles.label}>시작 시간:</span>
                <span className={styles.value}>
                  {formatTime(series.repeatTime)}
                </span>
              </div>
              <div className={styles.scheduleItem}>
                <span className={styles.label}>소요 시간:</span>
                <span className={styles.value}>
                  {formatDuration(series.duration)}
                </span>
              </div>
              {series.startDate && (
                <div className={styles.scheduleItem}>
                  <span className={styles.label}>시작일:</span>
                  <span className={styles.value}>
                    {new Date(series.startDate).toLocaleDateString("ko-KR")}
                  </span>
                </div>
              )}
              {series.endDate && (
                <div className={styles.scheduleItem}>
                  <span className={styles.label}>종료일:</span>
                  <span className={styles.value}>
                    {new Date(series.endDate).toLocaleDateString("ko-KR")}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className={styles.scheduleItem}>
              <span className={styles.label}>일회성 모임</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.location}>
        <h4>장소 및 인원</h4>
        <div className={styles.locationGrid}>
          <div className={styles.locationItem}>
            <span className={styles.label}>장소:</span>
            <span className={styles.value}>
              {series.defaultLocation || "설정 없음"}
            </span>
          </div>
          <div className={styles.locationItem}>
            <span className={styles.label}>참여자:</span>
            <span className={styles.value}>
              {series.defaultMinParticipants}~{series.defaultMaxParticipants}명
            </span>
          </div>
        </div>
      </div>

      {series.meetings && series.meetings.length > 0 && (
        <div className={styles.meetings}>
          <h4>예정된 모임</h4>
          <div className={styles.meetingsList}>
            {series.meetings.slice(0, 3).map((meeting) => (
              <div key={meeting.id} className={styles.meetingItem}>
                <span className={styles.meetingDate}>
                  {new Date(meeting.meetingDate).toLocaleDateString("ko-KR")}
                </span>
                <span className={styles.meetingTime}>{meeting.startTime}</span>
                <span className={styles.meetingStatus}>
                  {meeting.status === "open" ? "모집중" : meeting.status}
                </span>
                <span className={styles.meetingParticipants}>
                  {meeting.currentParticipants}/{meeting.maxParticipants}명
                </span>
              </div>
            ))}
            {series.meetings.length > 3 && (
              <div className={styles.moreMeetings}>
                +{series.meetings.length - 3}개 더...
              </div>
            )}
          </div>
        </div>
      )}

      {showActions && (
        <div className={styles.actions}>
          {onViewDetails && (
            <Button
              variant="outline"
              onClick={() => onViewDetails(series.id)}
              className={styles.viewButton}
            >
              상세보기
            </Button>
          )}

          {!isMySeries && series.isPublished && series.isActive && onJoin && (
            <Button
              variant="primary"
              onClick={() => onJoin(series.id)}
              className={styles.joinButton}
            >
              참여하기
            </Button>
          )}

          {isMySeries && (
            <div className={styles.ownerActions}>
              <Button
                variant="secondary"
                onClick={() => onViewDetails?.(series.id)}
                className={styles.manageButton}
              >
                관리하기
              </Button>
              {onShareToCommunity && (
                <Button
                  variant="outline"
                  onClick={() => onShareToCommunity(series.id)}
                  className={styles.shareButton}
                >
                  커뮤니티에 공유
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      <div className={styles.footer}>
        <div className={styles.creator}>
          <span>작성자: {series.user?.name || "알 수 없음"}</span>
        </div>
        <div className={styles.createdAt}>
          {new Date(series.createdAt).toLocaleDateString("ko-KR")}
        </div>
      </div>
    </div>
  );
};

export default SeriesCard;
