"use client";

import React, { useState } from "react";
import styles from "./styles.module.scss";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import { SwimmingRecord } from "../../../types";
import { useAuth } from "../../../contexts/AuthContext";

interface RecordCardProps {
  record: SwimmingRecord;
  onLike?: (id: string) => void;
  onComment?: (id: string, content: string) => Promise<any>;
  onShare?: (id: string) => void;
}

const RecordCard: React.FC<RecordCardProps> = ({
  record,
  onLike,
  onComment,
  onShare,
}) => {
  const { user } = useAuth();
  console.log("RecordCard rendered with record:", record);
  const [isLiked, setIsLiked] = useState(record.isLiked || false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 현재 사용자가 해당 기록의 작성자인지 확인
  const isOwnRecord = user && record.user && user.id === record.user.id;

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

  const handleLike = () => {
    // 자신의 기록에는 좋아요를 누를 수 없음
    if (isOwnRecord) return;

    setIsLiked(!isLiked);
    onLike?.(record.id.toString());
  };

  const handleCommentSubmit = async () => {
    if (!commentContent.trim()) return;

    try {
      setIsSubmitting(true);
      await onComment?.(record.id.toString(), commentContent);
      setCommentContent("");
      setIsCommentModalOpen(false);
    } catch (error) {
      // 에러는 상위에서 처리됨
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <span className={styles.value}>{record.totalDistance}m</span>
            <span className={styles.label}>총 거리</span>
          </div>
          <div className={styles.time}>
            <span className={styles.value}>
              {formatDuration(record.totalDuration)}
            </span>
            <span className={styles.label}>총 시간</span>
          </div>
          <div className={styles.poolLength}>
            <span className={styles.value}>{record.poolLength}m</span>
            <span className={styles.label}>수영장</span>
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

      <div className={styles.actions}>
        <button
          className={`${styles.actionButton} ${isLiked ? styles.liked : ""} ${
            isOwnRecord ? styles.disabled : ""
          }`}
          onClick={handleLike}
          disabled={isOwnRecord || false}
          title={
            isOwnRecord ? "자신의 기록에는 좋아요를 누를 수 없습니다" : "좋아요"
          }
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
          <span>
            {record.likesCount > 0 ? `(${record.likesCount})` : "(0)"}
          </span>
        </button>

        <button
          className={styles.actionButton}
          onClick={() => setIsCommentModalOpen(true)}
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
          <span>
            댓글 {record.commentsCount > 0 && `(${record.commentsCount})`}
          </span>
        </button>

        <button
          className={styles.actionButton}
          onClick={() => onShare?.(record.id.toString())}
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

      {/* 댓글 입력 모달 */}
      <Modal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        title="댓글 작성"
        size="small"
      >
        <div className={styles.commentModal}>
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="댓글을 입력하세요..."
            className={styles.commentInput}
            rows={4}
          />
          <div className={styles.commentActions}>
            <Button
              variant="outline"
              onClick={() => setIsCommentModalOpen(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleCommentSubmit}
              disabled={!commentContent.trim() || isSubmitting}
            >
              {isSubmitting ? "등록 중..." : "댓글 등록"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RecordCard;
