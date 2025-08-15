"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./styles.module.scss";
import { SwimmingRecord } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

interface RecordCardProps {
  record: SwimmingRecord;
  viewMode?: "compact" | "detailed";
  isShared?: boolean;
  sharedPostId?: number;
}

const RecordCard: React.FC<RecordCardProps> = ({
  record,
  viewMode = "compact",
  isShared = false,
  sharedPostId,
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const getStrokeName = (stroke: string) => {
    const strokeNames: { [key: string]: string } = {
      freestyle: "자유형",
      backstroke: "배영",
      breaststroke: "평영",
      butterfly: "접영",
      medley: "개인혼영",
    };
    return strokeNames[stroke] || stroke;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDuration = (duration: number): string => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}`;
    }
    return `${minutes}:00`;
  };

  const handleCardClick = () => {
    if (viewMode === "compact") {
      router.push(`/records/${record.id}`);
    }
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // 컴팩트 모드 (전체 보기)
  if (viewMode === "compact") {
    return (
      <div className={styles.cardCompact} onClick={handleCardClick}>
        <div className={styles.headerCompact}>
          <div className={styles.authorCompact}>
            {record.user?.profileImage && (
              <img
                src={record.user.profileImage}
                alt={record.user.name}
                className={styles.avatarCompact}
              />
            )}
            <div className={styles.authorInfoCompact}>
              <h4 className={styles.authorNameCompact}>
                {record.user?.name || "알 수 없음"}
              </h4>
              <span className={styles.dateCompact}>
                {formatDate(record.sessionDate || record.createdAt)}
              </span>
            </div>
          </div>
          <button
            className={styles.expandButton}
            onClick={handleExpandClick}
            aria-label={isExpanded ? "접기" : "펼치기"}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className={`${styles.expandIcon} ${
                isExpanded ? styles.expanded : ""
              }`}
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className={styles.titleCompact}>
          <h3>{record.title}</h3>
          {isShared && (
            <div className={styles.shareStatusCompact}>
              <span className={styles.shareIcon}>🌐</span>
              <span className={styles.shareText}>커뮤니티에 공유됨</span>
            </div>
          )}
        </div>

        <div className={styles.statsCompact}>
          <div className={styles.statCompact}>
            <span className={styles.valueCompact}>{record.totalDistance}m</span>
            <span className={styles.labelCompact}>거리</span>
          </div>
          <div className={styles.statCompact}>
            <span className={styles.valueCompact}>
              {formatDuration(record.totalDuration)}
            </span>
            <span className={styles.labelCompact}>시간</span>
          </div>
          <div className={styles.statCompact}>
            <span className={styles.valueCompact}>{record.poolLength}m</span>
            <span className={styles.labelCompact}>수영장</span>
          </div>
          {record.calories && (
            <div className={styles.statCompact}>
              <span className={styles.valueCompact}>{record.calories}</span>
              <span className={styles.labelCompact}>kcal</span>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className={styles.expandedContent}>
            {record.strokes && record.strokes.length > 0 && (
              <div className={styles.strokesCompact}>
                <h5>영법별 거리</h5>
                <div className={styles.strokeListCompact}>
                  {record.strokes.map((stroke, index) => (
                    <div key={index} className={styles.strokeItemCompact}>
                      <span className={styles.strokeNameCompact}>
                        {getStrokeName(stroke.style)}
                      </span>
                      <span className={styles.strokeDistanceCompact}>
                        {stroke.distance}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {record.description && (
              <div className={styles.descriptionCompact}>
                <p>{record.description}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.author}>
          {record.user?.profileImage && (
            <img
              src={record.user.profileImage}
              alt={record.user.name}
              className={styles.avatar}
            />
          )}
          <div className={styles.authorInfo}>
            <h3 className={styles.authorName}>
              {record.user?.name || "알 수 없음"}
            </h3>
            <span className={styles.date}>
              {formatDate(record.sessionDate || record.createdAt)}
            </span>
          </div>
        </div>
        <div className={styles.title}>
          <h4>{record.title}</h4>
        </div>
      </div>

      <div className={styles.record}>
        <div className={styles.recordInfo}>
          <div className={styles.distance}>
            <span className={styles.label}>총 거리</span>
            <span className={styles.value}>{record.totalDistance}m</span>
          </div>
          <div className={styles.time}>
            <span className={styles.label}>총 시간</span>
            <span className={styles.value}>
              {formatDuration(record.totalDuration)}
            </span>
          </div>
          <div className={styles.poolLength}>
            <span className={styles.label}>수영장</span>
            <span className={styles.value}>{record.poolLength}m</span>
          </div>
        </div>

        {record.strokes && record.strokes.length > 0 && (
          <div className={styles.strokes}>
            <h5>영법별 거리</h5>
            <div className={styles.strokeList}>
              {record.strokes.map((stroke, index) => (
                <div key={index} className={styles.strokeItem}>
                  <span className={styles.strokeName}>
                    {getStrokeName(stroke.style)}
                  </span>
                  <span className={styles.strokeDistance}>
                    {stroke.distance}m
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {record.calories && (
          <div className={styles.calories}>
            <span className={styles.value}>{record.calories} kcal</span>
            <span className={styles.label}>소모 칼로리</span>
          </div>
        )}
      </div>

      {record.description && (
        <div className={styles.description}>
          <p>{record.description}</p>
        </div>
      )}
    </div>
  );
};

export default RecordCard;
