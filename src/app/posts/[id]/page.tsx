"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";
import { Post, Comment } from "@/types";
import { communityAPI } from "@/utils/api";
import { useLikedPosts } from "@/hooks/useLikedPosts";
import { useAuth } from "@/contexts/AuthContext";
import { CommentItem, CommentForm } from "@/components/community";
import styles from "./page.module.scss";
import IconArrowLeft from "@assets/icon_arrow_left.svg";

export default function PostDetail() {
  const params = useParams();
  const router = useRouter();
  const postId = Number(params.id);
  const { isLiked, setLiked } = useLikedPosts();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      loadData();
    }
  }, [postId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [postResponse, commentsResponse] = await Promise.all([
        communityAPI.getPost(postId),
        communityAPI.getComments(postId),
      ]);
      setPost(postResponse.data);
      setComments(commentsResponse.data);
    } catch (error) {
      console.error("게시물 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;

    try {
      const response = await communityAPI.toggleLike(post.id);
      const updatedPost = response.data;
      setLiked(post.id, updatedPost.isLiked || false);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              likes: updatedPost.likes,
              isLiked: updatedPost.isLiked,
            }
          : null
      );
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
    }
  };

  const handleCommentSubmit = async (content: string) => {
    try {
      const response = await communityAPI.createComment(postId, content);
      const comment = response.data;
      setComments((prev) => [...prev, comment]);
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert("댓글 작성에 실패했습니다.");
    }
  };

  const handleCommentUpdate = (updatedComment: Comment) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === updatedComment.id ? updatedComment : comment
      )
    );
  };

  const handleCommentDelete = (commentId: number) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
  };

  const handleJoinTraining = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await communityAPI.joinTrainingRecruitment(postId);
      alert("훈련에 성공적으로 참여했습니다!");

      // 페이지 새로고침 대신 상태 업데이트
      setPost((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          isParticipating: true,
          participants: [...(prev.participants || []), user],
          recruitmentInfo: {
            ...prev.recruitmentInfo!,
            currentParticipants:
              (prev.recruitmentInfo?.currentParticipants || 0) + 1,
          },
        };
      });
    } catch (error) {
      console.error("훈련 참여 실패:", error);
      alert("훈련 참여에 실패했습니다.");
    }
  };

  const handleLeaveTraining = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await communityAPI.leaveTrainingRecruitment(postId);
      alert("훈련 참여를 취소했습니다.");

      // 페이지 새로고침 대신 상태 업데이트
      setPost((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          isParticipating: false,
          participants: (prev.participants || []).filter(
            (p) => p.id !== user.id
          ),
          recruitmentInfo: {
            ...prev.recruitmentInfo!,
            currentParticipants: Math.max(
              0,
              (prev.recruitmentInfo?.currentParticipants || 0) - 1
            ),
          },
        };
      });
    } catch (error) {
      console.error("훈련 참여 취소 실패:", error);
      alert("훈련 참여 취소에 실패했습니다.");
    }
  };

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

  if (isLoading) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>게시물을 불러오는 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.error}>
            <p>게시물을 찾을 수 없습니다.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.postDetail}>
          {/* 게시물 헤더 */}
          <div className={styles.postHeader}>
            <div className={styles.postMeta}>
              <div className={styles.backButtonContainer}>
                <button
                  onClick={() => router.push("/community")}
                  className={styles.backButton}
                  aria-label="뒤로 가기"
                >
                  <IconArrowLeft width={20} height={20} />
                </button>
                <span className={styles.category}>{post.category}</span>
              </div>
              <span className={styles.time}>{formatTime(post.createdAt)}</span>
            </div>
            <h1 className={styles.title}>{post.title}</h1>
            <div className={styles.authorInfo}>
              <span className={styles.author}>by {post.author.name}</span>
            </div>
          </div>

          {/* 게시물 내용 */}
          <div className={styles.content}>
            <p>{post.content}</p>
          </div>

          {/* 훈련 모집 정보 (훈련 모집 카테고리인 경우에만 표시) */}
          {post.recruitmentInfo && (
            <div className={styles.recruitmentInfo}>
              <h3>🏊‍♂️ 훈련 모집 정보</h3>
              <div className={styles.recruitmentDetails}>
                <div className={styles.recruitmentType}>
                  <strong>훈련 유형:</strong>{" "}
                  {post.recruitmentInfo.type === "regular"
                    ? "정기 모임"
                    : "단기 모임"}
                </div>

                {post.recruitmentInfo.location && (
                  <div className={styles.recruitmentLocation}>
                    <strong>장소:</strong> 📍 {post.recruitmentInfo.location}
                  </div>
                )}

                {post.recruitmentInfo.type === "regular" &&
                  post.recruitmentInfo.meetingDays && (
                    <div className={styles.recruitmentSchedule}>
                      <strong>훈련 요일:</strong> 📅{" "}
                      {post.recruitmentInfo.meetingDays
                        .map((day) => {
                          const dayMap: { [key: string]: string } = {
                            monday: "월요일",
                            tuesday: "화요일",
                            wednesday: "수요일",
                            thursday: "목요일",
                            friday: "금요일",
                            saturday: "토요일",
                            sunday: "일요일",
                          };
                          return dayMap[day] || day;
                        })
                        .join(", ")}
                    </div>
                  )}

                {post.recruitmentInfo.meetingTime && (
                  <div className={styles.recruitmentTime}>
                    <strong>훈련 시간:</strong> 🕐{" "}
                    {post.recruitmentInfo.meetingTime}
                  </div>
                )}

                {post.recruitmentInfo.type === "one-time" &&
                  post.recruitmentInfo.meetingDateTime && (
                    <div className={styles.recruitmentDateTime}>
                      <strong>훈련 일시:</strong> 📅{" "}
                      {new Date(
                        post.recruitmentInfo.meetingDateTime
                      ).toLocaleDateString("ko-KR")}{" "}
                      🕐{" "}
                      {new Date(
                        post.recruitmentInfo.meetingDateTime
                      ).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}

                <div className={styles.recruitmentParticipants}>
                  <strong>참가자:</strong> 👥{" "}
                  {post.recruitmentInfo.currentParticipants} /{" "}
                  {post.recruitmentInfo.maxParticipants}명
                </div>

                <div className={styles.recruitmentStatus}>
                  <strong>상태:</strong>{" "}
                  <span
                    className={`${styles.statusBadge} ${
                      styles[post.recruitmentInfo.status]
                    }`}
                  >
                    {post.recruitmentInfo.status === "open"
                      ? "모집 중"
                      : post.recruitmentInfo.status === "full"
                      ? "모집 완료"
                      : "모집 종료"}
                  </span>
                </div>

                {/* 참여 버튼 */}
                {post.recruitmentInfo.status === "open" &&
                  user &&
                  user.id !== post.author.id && (
                    <div className={styles.joinSection}>
                      {/* 현재 사용자가 이미 참여 중인지 확인 (participants 배열 직접 확인) */}
                      {post.participants?.some(
                        (participant) => participant.id === user.id
                      ) ? (
                        // 이미 참여 중인 경우
                        <div className={styles.participationStatus}>
                          <span className={styles.alreadyJoined}>
                            ✅ 이미 참여 중입니다
                          </span>
                          <button
                            onClick={handleLeaveTraining}
                            className={`${styles.joinButton} ${styles.leaveButton}`}
                          >
                            참여 취소하기
                          </button>
                        </div>
                      ) : (
                        // 아직 참여하지 않은 경우
                        <button
                          onClick={handleJoinTraining}
                          className={styles.joinButton}
                          disabled={
                            post.recruitmentInfo.currentParticipants >=
                            post.recruitmentInfo.maxParticipants
                          }
                        >
                          {post.recruitmentInfo.currentParticipants >=
                          post.recruitmentInfo.maxParticipants
                            ? "모집 완료"
                            : "훈련 참여하기"}
                        </button>
                      )}
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* 게시물 액션 */}
          <div className={styles.actions}>
            <button
              className={`${styles.likeButton} ${
                isLiked(post.id) ? styles.liked : ""
              }`}
              onClick={handleLike}
            >
              {isLiked(post.id) ? "❤️" : "🤍"} {post.likes}
            </button>
            <span className={styles.commentCount}>💬 {comments.length}</span>
          </div>

          {/* 댓글 섹션 */}
          <div className={styles.commentsSection}>
            <h3>댓글 ({comments.length})</h3>

            {/* 댓글 작성 폼 */}
            <CommentForm onSubmit={handleCommentSubmit} />

            {/* 댓글 목록 */}
            <div className={styles.commentsList}>
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onUpdate={handleCommentUpdate}
                    onDelete={handleCommentDelete}
                  />
                ))
              ) : (
                <div className={styles.emptyComments}>
                  <p>아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
