import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./styles.module.scss";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  buttonText?: string;
}

export default function CommentForm({
  onSubmit,
  placeholder = "댓글을 입력하세요...",
  buttonText = "댓글 작성",
}: CommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    try {
      setIsSubmitting(true);
      await onSubmit(content.trim());
      setContent("");
    } catch (error) {
      console.error("댓글 작성 실패:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className={styles.loginPrompt}>
        <p>댓글을 작성하려면 로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.commentForm}>
      <div className={styles.formHeader}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.defaultAvatar}>
                {user.name?.charAt(0) || "?"}
              </div>
            )}
          </div>
          <span className={styles.userName}>{user.name}</span>
        </div>
      </div>

      <div className={styles.formContent}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className={styles.commentInput}
          rows={3}
          disabled={isSubmitting}
        />

        <div className={styles.formFooter}>
          <div className={styles.characterCount}>{content.length}/500</div>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? "작성 중..." : buttonText}
          </button>
        </div>
      </div>
    </form>
  );
}
