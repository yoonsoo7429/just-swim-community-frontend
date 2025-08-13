import React from "react";
import { Post } from "../../../types";
import { communityAPI } from "../../../utils/api";
import { useAuth } from "../../../contexts/AuthContext";
import { useLikedPosts } from "../../../hooks/useLikedPosts";
import { useRouter } from "next/navigation";
import styles from "./styles.module.scss";

interface PostCardProps {
  post: Post;
  onClick?: () => void;
  onLikeUpdate?: (updatedPost: Post) => void;
  onDelete?: (postId: number) => void;
}

export default function PostCard({
  post,
  onClick,
  onLikeUpdate,
  onDelete,
}: PostCardProps) {
  const { user } = useAuth();
  const { isLiked, setLiked } = useLikedPosts();
  const router = useRouter();

  // 현재 사용자가 게시물 작성자인지 확인
  const isOwnPost = Boolean(user && post.author && user.id === post.author.id);

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

  const formatDuration = (duration: number): string => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}`;
    }
    return `${minutes}:00`;
  };

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

  const handleRecordClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.swimmingRecord) {
      router.push(`/records/${post.swimmingRecord.id}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isOwnPost) return;

    if (confirm("정말로 이 게시물을 삭제하시겠습니까?")) {
      try {
        await communityAPI.deletePost(post.id);
        if (onDelete) {
          onDelete(post.id);
        }
      } catch (error) {
        console.error("게시물 삭제 실패:", error);
        alert("게시물 삭제에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  return (
    <div className={styles.postCard} onClick={onClick}>
      <div className={styles.postHeader}>
        <span className={styles.category}>{post.category}</span>
        <span className={styles.time}>{formatTime(post.createdAt)}</span>
      </div>
      <h3 className={styles.postTitle}>{post.title}</h3>

      {/* 연동된 수영 기록 표시 */}
      {post.swimmingRecord && (
        <div className={styles.linkedRecord} onClick={handleRecordClick}>
          <div className={styles.recordHeader}>
            <span className={styles.recordIcon}>🏊‍♂️</span>
            <span className={styles.recordTitle}>연동된 수영 기록</span>
            <span className={styles.viewRecord}>상세 보기 →</span>
          </div>
          <div className={styles.recordStats}>
            <div className={styles.recordStat}>
              <span className={styles.statValue}>
                {post.swimmingRecord.totalDistance}m
              </span>
              <span className={styles.statLabel}>거리</span>
            </div>
            <div className={styles.recordStat}>
              <span className={styles.statValue}>
                {formatDuration(post.swimmingRecord.totalDuration)}
              </span>
              <span className={styles.statLabel}>시간</span>
            </div>
            <div className={styles.recordStat}>
              <span className={styles.statValue}>
                {post.swimmingRecord.poolLength}m
              </span>
              <span className={styles.statLabel}>수영장</span>
            </div>
            {post.swimmingRecord.calories && (
              <div className={styles.recordStat}>
                <span className={styles.statValue}>
                  {post.swimmingRecord.calories}
                </span>
                <span className={styles.statLabel}>kcal</span>
              </div>
            )}
          </div>
          {post.swimmingRecord.strokes &&
            post.swimmingRecord.strokes.length > 0 && (
              <div className={styles.recordStrokes}>
                <span className={styles.strokesLabel}>영법별 거리:</span>
                {post.swimmingRecord.strokes.map((stroke, index) => (
                  <span key={index} className={styles.strokeItem}>
                    {getStrokeName(stroke.style)} {stroke.distance}m
                  </span>
                ))}
              </div>
            )}
        </div>
      )}

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
          {isOwnPost && (
            <button
              className={styles.deleteButton}
              onClick={handleDelete}
              title="게시물 삭제"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
