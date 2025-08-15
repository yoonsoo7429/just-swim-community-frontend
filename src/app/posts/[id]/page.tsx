"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/layout/Layout";
import { Post, Comment } from "@/types";
import { communityAPI } from "@/utils/api";
import { useLikedPosts } from "@/hooks/useLikedPosts";
import { CommentItem, CommentForm } from "@/components/community";
import styles from "./page.module.scss";

export default function PostDetail() {
  const params = useParams();
  const postId = Number(params.id);
  const { isLiked, setLiked } = useLikedPosts();

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
