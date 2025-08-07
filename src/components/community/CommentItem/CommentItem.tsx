import React from "react";
import { Comment } from "../../../types";
import { likeComment, deleteComment } from "../../../utils/communityApi";
import { useAuth } from "../../../contexts/AuthContext";
import { useLikedComments } from "../../../hooks/useLikedComments";
import styles from "./styles.module.scss";

interface CommentItemProps {
  comment: Comment;
  onCommentUpdate?: (updatedComment: Comment) => void;
  onDelete?: (commentId: number) => void;
}

export default function CommentItem({
  comment,
  onCommentUpdate,
  onDelete,
}: CommentItemProps) {
  console.log("Rendering CommentItem:", comment);
  const { user } = useAuth();
  const { isLiked, setLiked } = useLikedComments();

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

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const updatedComment = await likeComment(comment.id);
      setLiked(comment.id, updatedComment.isLiked || false);

      if (onCommentUpdate) {
        onCommentUpdate(updatedComment);
      }
    } catch (error) {
      console.error("댓글 좋아요 처리 실패:", error);
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!user || comment.author.id !== user.id) {
      alert("삭제 권한이 없습니다.");
      return;
    }

    if (window.confirm("댓글을 삭제하시겠습니까?")) {
      try {
        await deleteComment(comment.id);
        if (onDelete) {
          onDelete(comment.id);
        }
      } catch (error) {
        console.error("댓글 삭제 실패:", error);
        alert("댓글 삭제에 실패했습니다.");
      }
    }
  };

  const isAuthor = user && comment.author.id === user.id;

  return (
    <div className={styles.commentItem}>
      <div className={styles.commentHeader}>
        <div className={styles.authorInfo}>
          <div className={styles.authorAvatar}>
            {comment.author?.profileImage ? (
              <img
                src={comment.author.profileImage}
                alt={comment.author.name}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.defaultAvatar}>
                {comment.author?.name?.charAt(0) || "?"}
              </div>
            )}
          </div>
          <div className={styles.authorDetails}>
            <span className={styles.authorName}>
              {comment.author?.name || "익명"}
            </span>
            <span className={styles.commentTime}>
              {formatTime(comment.createdAt)}
            </span>
          </div>
        </div>
        <div className={styles.commentActions}>
          {isAuthor && (
            <button
              onClick={handleDelete}
              className={styles.deleteButton}
              title="댓글 삭제"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <div className={styles.commentContent}>
        <p>{comment.content}</p>
      </div>

      <div className={styles.commentFooter}>
        <button
          className={`${styles.likeButton} ${
            isLiked(comment.id) ? styles.liked : ""
          }`}
          onClick={handleLikeClick}
          disabled={!user}
        >
          {isLiked(comment.id) ? "❤️" : "🤍"} {comment.likes || 0}
        </button>
      </div>
    </div>
  );
}
