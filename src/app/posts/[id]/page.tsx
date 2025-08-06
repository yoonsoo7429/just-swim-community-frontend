"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Layout from "../../../components/layout/Layout";
import { Post, Comment } from "../../../types";
import {
  getPost,
  getComments,
  createComment,
  likePost,
} from "../../../utils/communityApi";
import styles from "./page.module.scss";

export default function PostDetail() {
  const params = useParams();
  const postId = Number(params.id);

  const [post, setPost] = useState<Post | null>(null);
  console.error("Post ID:", post);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      setIsLoading(true);
      const [postData, commentsData] = await Promise.all([
        getPost(postId),
        getComments(postId),
      ]);
      setPost(postData);
      setComments(commentsData);
    } catch (error) {
      console.error("게시물 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;

    try {
      await likePost(post.id);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
              isLiked: !prev.isLiked,
            }
          : null
      );
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const comment = await createComment(postId, newComment.trim());
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert("댓글 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
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
              <span className={styles.category}>{post.category}</span>
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

          {/* 게시물 액션 */}
          <div className={styles.actions}>
            <button
              className={`${styles.likeButton} ${
                post.isLiked ? styles.liked : ""
              }`}
              onClick={handleLike}
            >
              {post.isLiked ? "❤️" : "🤍"} {post.likes}
            </button>
            <span className={styles.commentCount}>💬 {comments.length}</span>
          </div>

          {/* 댓글 섹션 */}
          <div className={styles.commentsSection}>
            <h3>댓글 ({comments.length})</h3>

            {/* 댓글 작성 폼 */}
            <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                className={styles.commentInput}
                rows={3}
                disabled={isSubmitting}
              />
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting || !newComment.trim()}
              >
                {isSubmitting ? "작성 중..." : "댓글 작성"}
              </button>
            </form>

            {/* 댓글 목록 */}
            <div className={styles.commentsList}>
              {comments.map((comment) => (
                <div key={comment.id} className={styles.comment}>
                  <div className={styles.commentHeader}>
                    <span className={styles.commentAuthor}>
                      {comment.author.name}
                    </span>
                    <span className={styles.commentTime}>
                      {formatTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className={styles.commentContent}>{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
