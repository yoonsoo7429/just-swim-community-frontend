"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import styles from "./page.module.scss";

interface User {
  id: number;
  name: string;
  profileImage?: string;
  userLevel: number;
}

interface LastMessage {
  id: number;
  content: string;
  createdAt: string;
  isRead: boolean;
  senderId: number;
}

interface Conversation {
  user: User;
  lastMessage?: LastMessage;
  unreadCount: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/messages/conversations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (friendId: number) => {
    router.push(`/messages/${friendId}`);
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    if (diffInMinutes < 10080)
      return `${Math.floor(diffInMinutes / 1440)}일 전`;
    return date.toLocaleDateString();
  };

  const getLevelIcon = (level: number): string => {
    if (level >= 10) return "👑";
    if (level >= 8) return "💎";
    if (level >= 6) return "🏆";
    if (level >= 4) return "💪";
    if (level >= 2) return "🏊";
    return "🌊";
  };

  if (isLoading || loading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <p>메시지를 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>💬 메시지</h1>
          <p>친구들과 대화를 나눠보세요!</p>
        </div>

        {conversations.length > 0 ? (
          <div className={styles.conversationsList}>
            {conversations.map((conversation) => (
              <div
                key={conversation.user.id}
                className={styles.conversationItem}
                onClick={() => handleConversationClick(conversation.user.id)}
              >
                <div className={styles.avatar}>
                  {conversation.user.profileImage ? (
                    <img
                      src={conversation.user.profileImage}
                      alt={conversation.user.name}
                      className={styles.avatarImage}
                    />
                  ) : (
                    <span className={styles.avatarText}>
                      {conversation.user.name?.[0]?.toUpperCase() || "?"}
                    </span>
                  )}
                  <span className={styles.levelBadge}>
                    {getLevelIcon(conversation.user.userLevel)}
                  </span>
                </div>

                <div className={styles.conversationInfo}>
                  <div className={styles.userInfo}>
                    <h3 className={styles.userName}>
                      {conversation.user.name}
                    </h3>
                    <span className={styles.userLevel}>
                      Lv.{conversation.user.userLevel}
                    </span>
                  </div>

                  {conversation.lastMessage && (
                    <div className={styles.messagePreview}>
                      <p
                        className={`${styles.messageContent} ${
                          !conversation.lastMessage.isRead &&
                          conversation.lastMessage.senderId !== user?.id
                            ? styles.unread
                            : ""
                        }`}
                      >
                        {conversation.lastMessage.senderId === user?.id
                          ? "나: "
                          : ""}
                        {conversation.lastMessage.content}
                      </p>
                      <span className={styles.messageTime}>
                        {formatTimeAgo(conversation.lastMessage.createdAt)}
                      </span>
                    </div>
                  )}

                  {!conversation.lastMessage && (
                    <p className={styles.noMessage}>
                      아직 대화가 없습니다. 메시지를 보내보세요!
                    </p>
                  )}
                </div>

                {conversation.unreadCount > 0 && (
                  <div className={styles.unreadBadge}>
                    {conversation.unreadCount}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💬</div>
            <h2>아직 대화가 없습니다</h2>
            <p>친구들과 메시지를 주고받아보세요!</p>
            <button
              className={styles.goToSocialBtn}
              onClick={() => router.push("/social")}
            >
              친구 찾기
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
