import React from "react";
import { Post } from "../../../types";
import { communityAPI } from "../../../utils/api";
import { useAuth } from "../../../contexts/AuthContext";
import { useLikedPosts } from "../../../hooks/useLikedPosts";
import styles from "./styles.module.scss";

interface PostCardProps {
  post: Post;
  onClick?: () => void;
  onLikeUpdate?: (updatedPost: Post) => void;
}

export default function PostCard({
  post,
  onClick,
  onLikeUpdate,
}: PostCardProps) {
  const { user } = useAuth();
  const { isLiked, setLiked } = useLikedPosts();

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
    e.stopPropagation(); // 게시물 클릭 이벤트 방지

    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await communityAPI.toggleLike(post.id);
      const updatedPost = response.data;

      // 로컬 상태 업데이트
      setLiked(post.id, updatedPost.isLiked);

      if (onLikeUpdate) {
        onLikeUpdate(updatedPost);
      }
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  return (
    <div className={styles.postCard} onClick={onClick}>
      <div className={styles.postHeader}>
        <span className={styles.category}>{post.category}</span>
        <span className={styles.time}>{formatTime(post.createdAt)}</span>
      </div>
      <h3 className={styles.postTitle}>{post.title}</h3>
      <div className={styles.postMeta}>
        <span className={styles.author}>by {post.author?.name || "익명"}</span>
        <div className={styles.engagement}>
          <span
            className={styles.likes}
            onClick={handleLikeClick}
            style={{ cursor: user ? "pointer" : "default" }}
          >
            {isLiked(post.id) ? "❤️" : "🤍"} {post.likes}
          </span>
          <span className={styles.comments}>💬 {post.comments}</span>
        </div>
      </div>
    </div>
  );
}
