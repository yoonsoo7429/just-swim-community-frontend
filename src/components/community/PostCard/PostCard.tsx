import React, { useState, useEffect } from "react";
import { Post } from "@/types";
import { communityAPI } from "@/utils/api";
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

  // 로컬 상태로 Post 데이터 관리
  const [localPost, setLocalPost] = useState<Post>(post);

  // post prop이 변경될 때 localPost 업데이트
  useEffect(() => {
    setLocalPost(post);
  }, [post]);

  // 현재 사용자가 게시물 작성자인지 확인
  const isOwnPost = Boolean(
    user && localPost.author && user.id === localPost.author.id
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
      const updatedPost = { ...localPost, isLiked: !isLiked(localPost.id) };
      setLiked(localPost.id, updatedPost.isLiked);

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
    if (localPost.swimmingRecord) {
      router.push(`/records/${localPost.swimmingRecord.id}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isOwnPost) return;

    if (!confirm("정말로 이 게시물을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await communityAPI.deletePost(localPost.id);
      if (onDelete) {
        onDelete(localPost.id);
      }
    } catch (error) {
      console.error("게시물 삭제 실패:", error);
      alert("게시물 삭제에 실패했습니다.");
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/posts/${localPost.id}/edit`);
  };

  const handlePostClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/posts/${localPost.id}`);
    }
  };

  const handleJoinTraining = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await communityAPI.joinTrainingRecruitment(localPost.id);

      // 참여 성공 시 로컬 상태 업데이트 (페이지 새로고침 없이)
      const updatedPost = {
        ...localPost,
        isParticipating: true,
        participants: [...(localPost.participants || []), user],
        recruitmentInfo: {
          ...localPost.recruitmentInfo!,
          currentParticipants:
            (localPost.recruitmentInfo?.currentParticipants || 0) + 1,
        },
      };

      // 먼저 로컬 상태 업데이트
      setLocalPost(updatedPost);

      // 그 다음 부모 컴포넌트에 상태 업데이트 알림
      if (onLikeUpdate) {
        onLikeUpdate(updatedPost);
      }
    } catch (error) {
      console.error("훈련 참여 실패:", error);
      alert("훈련 참여에 실패했습니다.");
    }
  };

  return (
    <div className={styles.postCard} onClick={handlePostClick}>
      <div className={styles.postHeader}>
        <div className={styles.authorInfo}>
          <div className={styles.avatar}>
            {localPost.author?.profileImage ? (
              <img
                src={localPost.author.profileImage}
                alt={localPost.author.name}
                className={styles.avatarImage}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {localPost.author?.name?.charAt(0) || "?"}
              </div>
            )}
          </div>
          <div className={styles.authorDetails}>
            <span className={styles.authorName}>
              {localPost.author?.name || "익명"}
            </span>
            <span className={styles.postTime}>
              {formatTime(localPost.createdAt)}
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
        <h3 className={styles.postTitle}>{localPost.title}</h3>
        <p className={styles.postText}>{localPost.content}</p>

        {localPost.category && (
          <span className={styles.postCategory}>{localPost.category}</span>
        )}
      </div>

      {localPost.swimmingRecord && (
        <div className={styles.recordPreview} onClick={handleRecordClick}>
          <div className={styles.recordHeader}>
            <span className={styles.recordLabel}>📊 수영 기록</span>
            <span className={styles.recordTime}>
              {formatDuration(localPost.swimmingRecord.totalDuration || 0)}
            </span>
          </div>
          <div className={styles.recordDetails}>
            <span className={styles.recordStroke}>
              {localPost.swimmingRecord.strokes &&
              localPost.swimmingRecord.strokes.length > 0
                ? localPost.swimmingRecord.strokes
                    .map((stroke) => getStrokeName(stroke.style))
                    .join(", ")
                : getStrokeName(localPost.swimmingRecord.strokes[0]?.style)}
            </span>
            <span className={styles.recordDistance}>
              {localPost.swimmingRecord.totalDistance
                ? `${localPost.swimmingRecord.totalDistance}m`
                : "거리 정보 없음"}
              m
            </span>
          </div>
        </div>
      )}

      {localPost.recruitmentInfo && (
        <div className={styles.recruitmentPreview}>
          <div className={styles.recruitmentHeader}>
            <span className={styles.recruitmentLabel}>🏊‍♂️ 훈련 모집</span>
            <span
              className={`${styles.recruitmentStatus} ${
                styles[localPost.recruitmentInfo.status || "open"]
              }`}
            >
              {localPost.recruitmentInfo.status === "open"
                ? "모집 중"
                : localPost.recruitmentInfo.status === "full"
                ? "모집 완료"
                : "모집 종료"}
            </span>
          </div>
          <div className={styles.recruitmentDetails}>
            <div className={styles.recruitmentInfo}>
              <span className={styles.recruitmentType}>
                {localPost.recruitmentInfo.type === "regular"
                  ? "정기 모임"
                  : "단기 모임"}
              </span>
              {localPost.recruitmentInfo.location && (
                <span className={styles.recruitmentLocation}>
                  📍 {localPost.recruitmentInfo.location}
                </span>
              )}
            </div>
            {localPost.recruitmentInfo.type === "regular" &&
              localPost.recruitmentInfo.meetingDays && (
                <div className={styles.recruitmentSchedule}>
                  <span className={styles.recruitmentDays}>
                    📅{" "}
                    {localPost.recruitmentInfo.meetingDays
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
                  {localPost.recruitmentInfo.meetingTime && (
                    <span className={styles.recruitmentTime}>
                      🕐 {localPost.recruitmentInfo.meetingTime}
                    </span>
                  )}
                </div>
              )}
            {localPost.recruitmentInfo.type === "one-time" &&
              localPost.recruitmentInfo.meetingDateTime && (
                <div className={styles.recruitmentSchedule}>
                  <span className={styles.recruitmentDateTime}>
                    📅{" "}
                    {new Date(
                      localPost.recruitmentInfo.meetingDateTime
                    ).toLocaleDateString("ko-KR")}
                    🕐{" "}
                    {new Date(
                      localPost.recruitmentInfo.meetingDateTime
                    ).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            <div className={styles.recruitmentParticipants}>
              <span className={styles.participantsCount}>
                👥 {localPost.recruitmentInfo.currentParticipants || 0} /{" "}
                {localPost.recruitmentInfo.maxParticipants || 0}명
              </span>
              {localPost.recruitmentInfo.participationFee > 0 ? (
                <span className={styles.participationFee}>
                  💰{" "}
                  {Number(
                    localPost.recruitmentInfo.participationFee
                  ).toLocaleString()}
                  원
                </span>
              ) : (
                <span className={styles.participationFee}>💰 무료</span>
              )}
            </div>

            {/* 참여 버튼 추가 */}
            {localPost.recruitmentInfo.status === "open" &&
              user &&
              !isOwnPost && (
                <div className={styles.recruitmentActions}>
                  {/* 현재 사용자가 이미 참여 중인지 확인 (participants 배열 직접 확인) */}
                  {localPost.participants?.some(
                    (participant) => participant.id === user.id
                  ) ? (
                    // 이미 참여 중인 경우
                    <div className={styles.participationStatus}>
                      <span className={styles.alreadyJoined}>✅ 참여 중</span>
                    </div>
                  ) : (
                    // 아직 참여하지 않은 경우
                    <button
                      onClick={(e) => handleJoinTraining(e)}
                      className={styles.joinButton}
                      disabled={
                        localPost.recruitmentInfo.currentParticipants >=
                        localPost.recruitmentInfo.maxParticipants
                      }
                    >
                      {localPost.recruitmentInfo.currentParticipants >=
                      localPost.recruitmentInfo.maxParticipants
                        ? "모집 완료"
                        : "참여하기"}
                    </button>
                  )}
                </div>
              )}
          </div>
        </div>
      )}

      <div className={styles.postFooter}>
        <div className={styles.engagement}>
          <button
            onClick={handleLikeClick}
            className={`${styles.likeButton} ${
              isLiked(localPost.id) ? styles.liked : ""
            }`}
          >
            ❤️ {localPost.likes || 0}
          </button>
          <span className={styles.commentsCount}>
            💬 {localPost.comments || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
