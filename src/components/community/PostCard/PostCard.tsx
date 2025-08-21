import React from "react";
import { Post } from "@/types";
import { postsAPI } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLikedPosts } from "@/hooks/useLikedPosts";
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
      // 좋아요 기능은 백엔드에서 아직 구현되지 않았으므로 임시로 로컬 상태만 업데이트
      const updatedPost = { ...post, isLiked: !isLiked(post.id) };
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

    if (!confirm("정말로 이 게시물을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await postsAPI.deletePost(post.id);
      if (onDelete) {
        onDelete(post.id);
      }
    } catch (error) {
      console.error("게시물 삭제 실패:", error);
      alert("게시물 삭제에 실패했습니다.");
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/posts/${post.id}/edit`);
  };

  const handlePostClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/posts/${post.id}`);
    }
  };

  return (
    <div className={styles.postCard} onClick={handlePostClick}>
      <div className={styles.postHeader}>
        <div className={styles.authorInfo}>
          <div className={styles.avatar}>
            {post.author?.profileImage ? (
              <img
                src={post.author.profileImage}
                alt={post.author.name}
                className={styles.avatarImage}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {post.author?.name?.charAt(0) || "?"}
              </div>
            )}
          </div>
          <div className={styles.authorDetails}>
            <span className={styles.authorName}>
              {post.author?.name || "익명"}
            </span>
            <span className={styles.postTime}>
              {formatTime(post.createdAt)}
            </span>
          </div>
        </div>

        {isOwnPost && (
          <div className={styles.postActions}>
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

      <div className={styles.postContent}>
        <h3 className={styles.postTitle}>{post.title}</h3>
        <p className={styles.postText}>{post.content}</p>

        {post.category && (
          <span className={styles.postCategory}>{post.category}</span>
        )}
      </div>

      {post.swimmingRecord && (
        <div className={styles.recordPreview} onClick={handleRecordClick}>
          <div className={styles.recordHeader}>
            <span className={styles.recordLabel}>📊 수영 기록</span>
            <span className={styles.recordTime}>
              {formatDuration(post.swimmingRecord.totalDuration || 0)}
            </span>
          </div>
          <div className={styles.recordDetails}>
            <span className={styles.recordStroke}>
              {post.swimmingRecord.strokes &&
              post.swimmingRecord.strokes.length > 0
                ? post.swimmingRecord.strokes
                    .map((stroke) => getStrokeName(stroke.style))
                    .join(", ")
                : getStrokeName(post.swimmingRecord.strokes[0]?.style)}
            </span>
            <span className={styles.recordDistance}>
              {post.swimmingRecord.totalDistance
                ? `${post.swimmingRecord.totalDistance}m`
                : "거리 정보 없음"}
              m
            </span>
          </div>
        </div>
      )}

      {post.recruitmentInfo && (
        <div className={styles.recruitmentPreview}>
          <div className={styles.recruitmentHeader}>
            <span className={styles.recruitmentLabel}>🏊‍♂️ 훈련 모집</span>
            <span
              className={`${styles.recruitmentStatus} ${
                styles[post.recruitmentInfo.status || "open"]
              }`}
            >
              {post.recruitmentInfo.status === "open"
                ? "모집 중"
                : post.recruitmentInfo.status === "full"
                ? "모집 완료"
                : "모집 종료"}
            </span>
          </div>
          <div className={styles.recruitmentDetails}>
            <div className={styles.recruitmentInfo}>
              <span className={styles.recruitmentType}>
                {post.recruitmentInfo.type === "regular"
                  ? "정기 모임"
                  : "단기 모임"}
              </span>
              {post.recruitmentInfo.location && (
                <span className={styles.recruitmentLocation}>
                  📍 {post.recruitmentInfo.location}
                </span>
              )}
            </div>
            {post.recruitmentInfo.type === "regular" &&
              post.recruitmentInfo.meetingDays && (
                <div className={styles.recruitmentSchedule}>
                  <span className={styles.recruitmentDays}>
                    📅{" "}
                    {post.recruitmentInfo.meetingDays
                      .map((day) => {
                        const dayMap: { [key: string]: string } = {
                          monday: "월",
                          tuesday: "화",
                          wednesday: "수",
                          thursday: "목",
                          friday: "금",
                          saturday: "토",
                          sunday: "일",
                        };
                        return dayMap[day] || day;
                      })
                      .join(", ")}
                  </span>
                  {post.recruitmentInfo.meetingTime && (
                    <span className={styles.recruitmentTime}>
                      🕐 {post.recruitmentInfo.meetingTime}
                    </span>
                  )}
                </div>
              )}
            {post.recruitmentInfo.type === "one-time" &&
              post.recruitmentInfo.meetingDateTime && (
                <div className={styles.recruitmentSchedule}>
                  <span className={styles.recruitmentDateTime}>
                    📅{" "}
                    {new Date(
                      post.recruitmentInfo.meetingDateTime
                    ).toLocaleDateString("ko-KR")}
                    🕐{" "}
                    {new Date(
                      post.recruitmentInfo.meetingDateTime
                    ).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            <div className={styles.recruitmentParticipants}>
              <span className={styles.participantsCount}>
                👥 {post.recruitmentInfo.currentParticipants || 0} /{" "}
                {post.recruitmentInfo.maxParticipants || 0}명
              </span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.postFooter}>
        <div className={styles.engagement}>
          <button
            onClick={handleLikeClick}
            className={`${styles.likeButton} ${
              isLiked(post.id) ? styles.liked : ""
            }`}
          >
            ❤️ {post.likes || 0}
          </button>
          <span className={styles.commentsCount}>💬 {post.comments || 0}</span>
        </div>
      </div>
    </div>
  );
}
