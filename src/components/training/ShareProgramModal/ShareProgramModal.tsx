import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { TrainingProgram, PostCategory } from "@/types";
import { postsAPI } from "@/utils/api";
import { getDifficultyText } from "@/utils";
import styles from "./styles.module.scss";

interface ShareProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: TrainingProgram | null;
  onSuccess?: () => void;
}

const CATEGORIES: PostCategory[] = ["훈련 후기", "팁 공유", "질문", "가이드"];

const ShareProgramModal: React.FC<ShareProgramModalProps> = ({
  isOpen,
  onClose,
  program,
  onSuccess,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<PostCategory>("훈련 후기");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 프로그램이 변경될 때마다 기본값 설정
  React.useEffect(() => {
    if (program) {
      setTitle(`${program.title} - 훈련 프로그램 공유`);
      setContent(
        `안녕하세요! 제가 만든 훈련 프로그램을 공유합니다.\n\n프로그램명: ${
          program.title
        }\n난이도: ${getDifficultyText(program.difficulty)}\n설명: ${
          program.description || "설명 없음"
        }\n\n이 프로그램에 대해 궁금한 점이나 함께 훈련하고 싶은 분들이 있으시면 댓글로 소통해주세요!`
      );
    }
  }, [program]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    if (!program) {
      alert("프로그램 정보를 찾을 수 없습니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 커뮤니티에 게시물 작성
      await postsAPI.createPost({
        title: title.trim(),
        content: content.trim(),
        category,
      });

      alert("프로그램이 성공적으로 공유되었습니다!");
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error("프로그램 공유 실패:", error);
      alert("프로그램 공유에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setCategory("훈련 후기");
    onClose();
  };

  if (!program) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="프로그램 공유하기">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>카테고리</label>
          <div className={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`${styles.categoryButton} ${
                  category === cat ? styles.active : ""
                }`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>제목</label>
          <Input
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTitle(e.target.value)
            }
            placeholder="게시물 제목을 입력하세요"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>내용</label>
          <textarea
            value={content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setContent(e.target.value)
            }
            placeholder="프로그램에 대한 설명이나 후기를 작성해주세요"
            className={styles.textarea}
            rows={8}
            required
          />
        </div>

        <div className={styles.programInfo}>
          <h4>공유할 프로그램 정보</h4>
          <div className={styles.programDetails}>
            <p>
              <strong>제목:</strong> {program.title}
            </p>
            <p>
              <strong>난이도:</strong> {getDifficultyText(program.difficulty)}
            </p>
            {program.description && (
              <p>
                <strong>설명:</strong> {program.description}
              </p>
            )}
          </div>
        </div>

        <div className={styles.formActions}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "공유 중..." : "공유하기"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export { ShareProgramModal };
export default ShareProgramModal;
