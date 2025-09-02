import React, { useState, useEffect } from "react";
import { PostCategory, SwimmingRecord } from "@/types";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { swimmingAPI } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/utils/apiClient";
import styles from "./styles.module.scss";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    content: string;
    category: PostCategory;
    swimmingRecordId?: string;
    challengeId?: number;
  }) => void;
}

const CATEGORIES: PostCategory[] = [
  "기록 공유",
  "팁 공유",
  "질문",
  "훈련 후기",
  "챌린지",
  "가이드",
];

export default function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
}: CreatePostModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<PostCategory>("기록 공유");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myRecords, setMyRecords] = useState<SwimmingRecord[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string>("");
  const [showRecordSelector, setShowRecordSelector] = useState(false);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    if (!isOpen) return;
    if (category === "기록 공유") fetchMyRecords();
    if (category === "챌린지") fetchPublicChallenges();
  }, [isOpen, category]);

  const fetchMyRecords = async () => {
    try {
      const response = await swimmingAPI.getMyRecords();
      setMyRecords(response.data);
    } catch (error) {
      console.error("수영 기록 조회 실패:", error);
    }
  };

  const fetchPublicChallenges = async () => {
    try {
      const res = await apiClient.get("/social/challenges/public", {
        params: { status: "active" },
      });
      setChallenges(res.data || []);
    } catch (error) {
      console.error("챌린지 목록 조회 실패:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    if (category === "기록 공유" && !selectedRecordId) {
      alert("공유할 수영 기록을 선택해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        category,
        swimmingRecordId:
          category === "기록 공유" ? selectedRecordId : undefined,
        challengeId: category === "챌린지" ? selectedChallengeId : undefined,
      });
      handleClose();
    } catch (error) {
      console.error("게시물 작성 실패:", error);
      alert("게시물 작성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setCategory("기록 공유");
    setSelectedRecordId("");
    setShowRecordSelector(false);
    setSelectedChallengeId(undefined);
    onClose();
  };

  const handleCategoryChange = (newCategory: PostCategory) => {
    setCategory(newCategory);
    if (newCategory === "기록 공유") {
      setShowRecordSelector(true);
    } else {
      setShowRecordSelector(false);
      setSelectedRecordId("");
    }
    if (newCategory !== "챌린지") {
      setSelectedChallengeId(undefined);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="새 게시물 작성"
      size="large"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            제목
          </label>
          <Input
            id="title"
            type="text"
            placeholder="게시물 제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category" className={styles.label}>
            카테고리
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) =>
              handleCategoryChange(e.target.value as PostCategory)
            }
            className={styles.select}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {showRecordSelector && (
          <div className={styles.formGroup}>
            <label htmlFor="record" className={styles.label}>
              수영 기록 선택
            </label>
            <select
              id="record"
              value={selectedRecordId}
              onChange={(e) => setSelectedRecordId(e.target.value)}
              className={styles.select}
            >
              <option value="">수영 기록을 선택해주세요</option>
              {myRecords.map((record) => (
                <option key={record.id} value={record.id}>
                  {formatDate(record.sessionDate || record.createdAt)} -{" "}
                  {record.totalDistance}m
                </option>
              ))}
            </select>
          </div>
        )}

        {category === "챌린지" && (
          <div className={styles.formGroup}>
            <label htmlFor="challenge" className={styles.label}>
              챌린지 연결(선택)
            </label>
            <select
              id="challenge"
              value={selectedChallengeId ?? ""}
              onChange={(e) =>
                setSelectedChallengeId(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className={styles.select}
            >
              <option value="">연결하지 않음</option>
              {challenges.map((info) => (
                <option key={info.challenge.id} value={info.challenge.id}>
                  {info.challenge.title} (참가자 {info.participantCount})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="content" className={styles.label}>
            내용
          </label>
          <textarea
            id="content"
            placeholder="게시물 내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={styles.textarea}
            rows={8}
            required
          />
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "작성 중..." : "게시물 작성"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
