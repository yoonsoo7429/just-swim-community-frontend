import React, { useState } from "react";
import { Comment } from "@/types";
import { commentsAPI } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLikedComments } from "@/hooks/useLikedComments";
import styles from "./styles.module.scss";

interface CommentItemProps {
  comment: Comment;
  onUpdate: (updatedComment: Comment) => void;
  onDelete: (commentId: number) => void;
}

export default function CommentItem({
  comment,
  onUpdate,
  onDelete,
}: CommentItemProps) {
  const { user } = useAuth();
  const { isLiked, setLiked } = useLikedComments();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const isOwnComment = Boolean(
    user && comment.author && user.id === comment.author.id
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "방금 전";
    if (diffInHours < 24) return `${diffInHours}시간 전`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}일 전`;

    return date.toLocaleDateString("ko-KR");
  };

  const handleLikeClick = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await commentsAPI.toggleLike(comment.id);
      const updatedComment = response.data;

      // 로컬 상태 업데이트
      setLiked(comment.id, updatedComment.isLiked);

      // 부모 컴포넌트에 업데이트된 댓글 전달
      onUpdate(updatedComment);
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content);
  };

  const handleSave = async () => {
    if (!editContent.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const response = await commentsAPI.updateComment(comment.id.toString(), {
        content: editContent.trim(),
      });
      const updatedComment = response.data;
      onUpdate(updatedComment);
      setIsEditing(false);
    } catch (error) {
      console.error("댓글 수정 실패:", error);
      alert("댓글 수정에 실패했습니다.");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleDelete = async () => {
    if (!confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await commentsAPI.deleteComment(comment.id.toString());
      onDelete(comment.id);
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  if (isEditing) {
    return (
      <div className={styles.commentItem}>
        <div className={styles.editForm}>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className={styles.editTextarea}
            rows={3}
          />
          <div className={styles.editActions}>
            <button onClick={handleSave} className={styles.saveButton}>
              저장
            </button>
            <button onClick={handleCancel} className={styles.cancelButton}>
              취소
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.commentItem}>
      <div className={styles.commentHeader}>
        <div className={styles.authorInfo}>
          <span className={styles.authorName}>
            {comment.author?.name || "익명"}
          </span>
          <span className={styles.commentTime}>
            {formatTime(comment.createdAt)}
          </span>
        </div>
        {isOwnComment && (
          <div className={styles.commentActions}>
            <button
              onClick={handleEdit}
              className={styles.editButton}
              title="수정"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              className={styles.deleteButton}
              title="삭제"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      <div className={styles.commentContent}>
        <p>{comment.content}</p>
      </div>

      <div className={styles.commentFooter}>
        <button
          onClick={handleLikeClick}
          className={`${styles.likeButton} ${
            isLiked(comment.id) ? styles.liked : ""
          }`}
        >
          ❤️ {comment.likes || 0}
        </button>
      </div>
    </div>
  );
}
