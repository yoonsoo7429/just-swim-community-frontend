"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import styles from "./page.module.scss";

interface User {
  id: number;
  name: string;
  profileImage?: string;
  userLevel: number;
}

interface Message {
  id: number;
  content: string;
  createdAt: string;
  isRead: boolean;
  senderId: number;
  receiverId: number;
  messageType: string;
  sender: User;
  receiver: User;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [friend, setFriend] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const friendId = params.friendId as string;

  useEffect(() => {
    if (friendId && currentUser) {
      fetchMessages();
    }
  }, [friendId, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/messages/conversations/${friendId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.reverse()); // 최신 메시지가 아래로 오도록 역순 정렬

        // 첫 번째 메시지에서 상대방 정보 추출
        if (data.length > 0) {
          const firstMessage = data[0];
          const friendUser =
            firstMessage.senderId === parseInt(friendId)
              ? firstMessage.sender
              : firstMessage.receiver;
          setFriend(friendUser);
        }
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            receiverId: parseInt(friendId),
            content: newMessage.trim(),
            messageType: "text",
          }),
        }
      );

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages((prev) => [...prev, sentMessage]);
        setNewMessage("");
      } else {
        alert("메시지 전송에 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("메시지 전송에 실패했습니다.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "오늘";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "어제";
    } else {
      return date.toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getLevelIcon = (level: number): string => {
    if (level >= 10) return "👑";
    if (level >= 8) return "💎";
    if (level >= 6) return "🏆";
    if (level >= 4) return "💪";
    if (level >= 2) return "🏊";
    return "🌊";
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <p>메시지를 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  if (!friend) {
    return (
      <Layout>
        <div className={styles.error}>
          <p>대화를 찾을 수 없습니다.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            ←
          </button>

          <div className={styles.friendInfo}>
            <div className={styles.avatar}>
              {friend.profileImage ? (
                <img
                  src={friend.profileImage}
                  alt={friend.name}
                  className={styles.avatarImage}
                />
              ) : (
                <span className={styles.avatarText}>
                  {friend.name?.[0]?.toUpperCase() || "?"}
                </span>
              )}
              <span className={styles.levelBadge}>
                {getLevelIcon(friend.userLevel)}
              </span>
            </div>

            <div className={styles.friendDetails}>
              <h2 className={styles.friendName}>{friend.name}</h2>
              <span className={styles.friendLevel}>Lv.{friend.userLevel}</span>
            </div>
          </div>
        </div>

        <div className={styles.messagesContainer}>
          {messages.length > 0 ? (
            <div className={styles.messagesList}>
              {messages.map((message, index) => {
                const isOwn = message.senderId === currentUser?.id;
                const showDate =
                  index === 0 ||
                  formatDate(messages[index - 1].createdAt) !==
                    formatDate(message.createdAt);

                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className={styles.dateDivider}>
                        {formatDate(message.createdAt)}
                      </div>
                    )}

                    <div
                      className={`${styles.message} ${
                        isOwn ? styles.own : styles.other
                      }`}
                    >
                      {!isOwn && (
                        <div className={styles.messageAvatar}>
                          {friend.profileImage ? (
                            <img
                              src={friend.profileImage}
                              alt={friend.name}
                              className={styles.avatarImage}
                            />
                          ) : (
                            <span className={styles.avatarText}>
                              {friend.name?.[0]?.toUpperCase() || "?"}
                            </span>
                          )}
                        </div>
                      )}

                      <div className={styles.messageContent}>
                        <div className={styles.messageBubble}>
                          <p className={styles.messageText}>
                            {message.content}
                          </p>
                          <span className={styles.messageTime}>
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>💬</div>
              <p>아직 메시지가 없습니다.</p>
              <p>첫 메시지를 보내보세요!</p>
            </div>
          )}
        </div>

        <div className={styles.inputContainer}>
          <div className={styles.inputWrapper}>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className={styles.messageInput}
              rows={1}
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className={styles.sendBtn}
            >
              {sending ? "전송 중..." : "전송"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}


