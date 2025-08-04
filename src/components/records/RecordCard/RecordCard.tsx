"use client";

import React, { useState } from "react";
import styles from "./styles.module.scss";
import Button from "../../ui/Button";

interface RecordCardProps {
  record: {
    id: string;
    distance: number;
    time: string;
    stroke: string;
    description: string;
    date: string;
    author: {
      name: string;
      avatar?: string;
    };
    likes: number;
    comments: number;
  };
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
  onShare?: (id: string) => void;
}

const RecordCard: React.FC<RecordCardProps> = ({
  record,
  onLike,
  onComment,
  onShare,
}) => {
  const [isLiked, setIsLiked] = useState(false);

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

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(record.id);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.author}>
          {record.author.avatar && (
            <img
              src={record.author.avatar}
              alt={record.author.name}
              className={styles.avatar}
            />
          )}
          <div className={styles.authorInfo}>
            <h3 className={styles.authorName}>{record.author.name}</h3>
            <span className={styles.date}>{formatDate(record.date)}</span>
          </div>
        </div>
        <div className={styles.stroke}>
          <span className={styles.strokeBadge}>
            {getStrokeName(record.stroke)}
          </span>
        </div>
      </div>

      <div className={styles.record}>
        <div className={styles.recordInfo}>
          <div className={styles.distance}>
            <span className={styles.value}>{record.distance}m</span>
            <span className={styles.label}>거리</span>
          </div>
          <div className={styles.time}>
            <span className={styles.value}>{record.time}</span>
            <span className={styles.label}>시간</span>
          </div>
          <div className={styles.pace}>
            <span className={styles.value}>
              {calculatePace(record.distance, record.time)}
            </span>
            <span className={styles.label}>페이스</span>
          </div>
        </div>
      </div>

      {record.description && (
        <div className={styles.description}>
          <p>{record.description}</p>
        </div>
      )}

      <div className={styles.actions}>
        <button
          className={`${styles.actionButton} ${isLiked ? styles.liked : ""}`}
          onClick={handleLike}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{record.likes + (isLiked ? 1 : 0)}</span>
        </button>

        <button
          className={styles.actionButton}
          onClick={() => onComment?.(record.id)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{record.comments}</span>
        </button>

        <button
          className={styles.actionButton}
          onClick={() => onShare?.(record.id)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>공유</span>
        </button>
      </div>
    </div>
  );
};

// 페이스 계산 함수 (100m당 시간)
const calculatePace = (distance: number, time: string): string => {
  const [minutes, seconds] = time.split(":").map(Number);
  const totalSeconds = minutes * 60 + seconds;
  const paceSeconds = (totalSeconds / distance) * 100;
  const paceMinutes = Math.floor(paceSeconds / 60);
  const paceRemainingSeconds = Math.floor(paceSeconds % 60);
  return `${paceMinutes}:${paceRemainingSeconds.toString().padStart(2, "0")}`;
};

export default RecordCard; 