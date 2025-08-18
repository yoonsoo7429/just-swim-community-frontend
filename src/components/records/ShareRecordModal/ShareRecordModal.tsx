"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { SwimmingRecord } from "@/types";
import { postsAPI } from "@/utils/api";
import styles from "./styles.module.scss";

interface ShareRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: SwimmingRecord;
  onShareSuccess: (postId: number) => void;
}

const ShareRecordModal: React.FC<ShareRecordModalProps> = ({
  isOpen,
  onClose,
  record,
  onShareSuccess,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"기록 공유" | "팁 공유" | "질문">(
    "기록 공유"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 시간 포맷팅 함수
  const formatDuration = (duration: number): string => {
    // duration이 1000 이상이면 초 단위, 그렇지 않으면 분 단위로 가정
    if (duration >= 1000) {
      // 초 단위로 저장된 경우
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = duration % 60;

      if (hours > 0) {
        return `${hours}시간 ${minutes}분 ${seconds}초`;
      } else if (minutes > 0) {
        return `${minutes}분 ${seconds}초`;
      } else {
        return `${seconds}초`;
      }
    } else {
      // 분 단위로 저장된 경우
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;

      if (hours > 0) {
        return `${hours}시간 ${minutes}분`;
      } else {
        return `${minutes}분`;
      }
    }
  };

  // 시간을 초 단위로 변환하는 함수
  const getDurationInSeconds = (duration: number): number => {
    // duration이 1000 이상이면 이미 초 단위, 그렇지 않으면 분을 초로 변환
    return duration >= 1000 ? duration : duration * 60;
  };

  // 기본 제목과 내용 설정
  React.useEffect(() => {
    if (record) {
      const durationInSeconds = getDurationInSeconds(record.totalDuration);
      const hours = Math.floor(durationInSeconds / 3600);
      const minutes = Math.floor((durationInSeconds % 3600) / 60);
      const seconds = durationInSeconds % 60;

      let timeText = "";
      if (hours > 0) {
        timeText = `${hours}시간 ${minutes}분 ${seconds}초`;
      } else if (minutes > 0) {
        timeText = `${minutes}분 ${seconds}초`;
      } else {
        timeText = `${seconds}초`;
      }

      const defaultTitle = `${record.title} - ${record.totalDistance}m 수영 기록 공유`;
      const defaultContent = `오늘 ${
        record.totalDistance
      }m 수영을 완료했습니다! 🏊‍♂️

📊 기록 요약:
• 총 거리: ${record.totalDistance}m
• 총 시간: ${timeText}
• 수영장: ${
        record.poolName
          ? `${record.poolName} (${record.poolLength}m${
              record.poolType
                ? `, ${
                    record.poolType === "indoor"
                      ? "실내"
                      : record.poolType === "outdoor"
                      ? "실외"
                      : "혼합"
                  }`
                : ""
            })`
          : `${record.poolLength}m`
      }
• 소모 칼로리: ${record.calories || 0}kcal

${record.strokes
  .map(
    (stroke) =>
      `• ${
        stroke.style === "freestyle"
          ? "자유형"
          : stroke.style === "backstroke"
          ? "배영"
          : stroke.style === "breaststroke"
          ? "평영"
          : stroke.style === "butterfly"
          ? "접영"
          : stroke.style
      } ${stroke.distance}m`
  )
  .join("\n")}

${record.description ? `\n💭 메모: ${record.description}` : ""}

여러분도 함께 수영해보세요! 💪`;

      setTitle(defaultTitle);
      setContent(defaultContent);
    }
  }, [record]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await postsAPI.createSwimmingRecordPost(
        record.id,
        content
      );

      if (response.data) {
        onShareSuccess(response.data.id);
        onClose();
      }
    } catch (err: any) {
      console.error("기록 공유 실패:", err);
      setError(err.response?.data?.message || "기록 공유에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="수영 기록을 커뮤니티에 공유하기"
      size="large"
      showCloseButton={true}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.recordPreview}>
          <h4>공유할 기록 미리보기</h4>
          <div className={styles.recordInfo}>
            <div className={styles.recordStats}>
              <div className={styles.stat}>
                <span className={styles.label}>거리</span>
                <strong className={styles.value}>
                  {record.totalDistance}m
                </strong>
              </div>
              <div className={styles.stat}>
                <span className={styles.label}>시간</span>
                <strong className={styles.value}>
                  {formatDuration(record.totalDuration)}
                </strong>
              </div>
              <div className={styles.stat}>
                <span className={styles.label}>수영장</span>
                <strong className={styles.value}>
                  {record.poolName ? (
                    <div className={styles.poolInfo}>
                      <div className={styles.poolName}>{record.poolName}</div>
                      <div className={styles.poolLength}>
                        {record.poolLength}m
                      </div>
                    </div>
                  ) : (
                    `${record.poolLength}m`
                  )}
                </strong>
              </div>
            </div>
            {record.strokes && record.strokes.length > 0 && (
              <div className={styles.strokes}>
                <strong>영법별 거리:</strong>
                {record.strokes.map((stroke, index) => (
                  <span key={index} className={styles.stroke}>
                    {stroke.style === "freestyle"
                      ? "자유형"
                      : stroke.style === "backstroke"
                      ? "배영"
                      : stroke.style === "breaststroke"
                      ? "평영"
                      : stroke.style === "butterfly"
                      ? "접영"
                      : stroke.style}{" "}
                    {stroke.distance}m
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category">카테고리</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className={styles.select}
            disabled={isSubmitting}
          >
            <option value="기록 공유">기록 공유</option>
            <option value="팁 공유">팁 공유</option>
            <option value="질문">질문</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="title">제목</label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="게시글 제목을 입력하세요"
            disabled={isSubmitting}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="content">내용</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="게시글 내용을 입력하세요"
            className={styles.textarea}
            rows={8}
            disabled={isSubmitting}
            required
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className={styles.cancelButton}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className={styles.shareButton}
          >
            {isSubmitting ? "공유 중..." : "커뮤니티에 공유하기"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ShareRecordModal;
