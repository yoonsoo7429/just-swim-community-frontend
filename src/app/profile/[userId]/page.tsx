"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import styles from "./page.module.scss";

interface User {
  id: number;
  name: string;
  email: string;
  profileImage?: string;
  userLevel: number;
  title?: string;
  bio?: string;
  joinDate: string;
  totalSwimTime: number;
  totalDistance: number;
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  badges: any[];
  recentActivities: any[];
}

interface UserStats {
  weeklyDistance: number;
  monthlyDistance: number;
  averagePace: number;
  favoriteStroke: string;
  personalRecords: any[];
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);

  const userId = params.userId as string;

  useEffect(() => {
    if (userId && currentUser) {
      fetchUserProfile();
      checkFriendshipStatus();
    }
  }, [userId, currentUser]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else if (response.status === 404) {
        router.push("/404");
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkFriendshipStatus = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/social/friends/status/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const status = await response.json();
        setIsFriend(status.isFriend);
        setFriendRequestSent(status.friendRequestSent);
      }
    } catch (error) {
      console.error("Failed to check friendship status:", error);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/social/friends/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            addresseeId: parseInt(userId),
            message: "안녕하세요! 친구가 되어요 🏊‍♂️",
          }),
        }
      );

      if (response.ok) {
        setFriendRequestSent(true);
        alert("친구 요청을 보냈습니다!");
      }
    } catch (error) {
      console.error("Failed to send friend request:", error);
    }
  };

  const handleSendMessage = () => {
    router.push(`/messages/${userId}`);
  };

  const handleChallenge = () => {
    router.push(`/challenge/create/${userId}`);
  };

  const getLevelIcon = (level: number): string => {
    if (level >= 10) return "👑";
    if (level >= 8) return "💎";
    if (level >= 6) return "🏆";
    if (level >= 4) return "💪";
    if (level >= 2) return "🏊";
    return "🌊";
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  };

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)}km`;
    }
    return `${meters}m`;
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <p>프로필을 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className={styles.error}>
          <p>사용자를 찾을 수 없습니다.</p>
        </div>
      </Layout>
    );
  }

  const isOwnProfile = currentUser?.id === parseInt(userId);

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            ← 뒤로가기
          </button>
        </div>

        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div className={styles.avatar}>
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className={styles.avatarImage}
                />
              ) : (
                <span className={styles.avatarText}>
                  {user.name?.[0]?.toUpperCase() || "?"}
                </span>
              )}
              <span className={styles.levelBadge}>
                {getLevelIcon(user.userLevel)}
              </span>
            </div>

            <div className={styles.userInfo}>
              <h1 className={styles.name}>{user.name}</h1>
              <div className={styles.meta}>
                <span className={styles.level}>Lv.{user.userLevel}</span>
                {user.title && (
                  <span className={styles.title}>{user.title}</span>
                )}
              </div>
              {user.bio && <p className={styles.bio}>{user.bio}</p>}
              <p className={styles.joinDate}>
                {formatDate(user.joinDate)} 가입
              </p>
            </div>

            {!isOwnProfile && (
              <div className={styles.actions}>
                {isFriend ? (
                  <>
                    <button
                      className={styles.messageBtn}
                      onClick={handleSendMessage}
                    >
                      💬 메시지
                    </button>
                    <button
                      className={styles.challengeBtn}
                      onClick={handleChallenge}
                    >
                      ⚔️ 챌린지
                    </button>
                  </>
                ) : friendRequestSent ? (
                  <button className={styles.pendingBtn} disabled>
                    친구 요청 대기 중
                  </button>
                ) : (
                  <button
                    className={styles.addFriendBtn}
                    onClick={handleSendFriendRequest}
                  >
                    👥 친구 추가
                  </button>
                )}
              </div>
            )}
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🏊‍♂️</div>
              <div className={styles.statInfo}>
                <h3>{user.totalSessions}</h3>
                <p>총 수영 횟수</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>📏</div>
              <div className={styles.statInfo}>
                <h3>{formatDistance(user.totalDistance)}</h3>
                <p>총 수영 거리</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>⏱️</div>
              <div className={styles.statInfo}>
                <h3>{formatTime(user.totalSwimTime)}</h3>
                <p>총 수영 시간</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>🔥</div>
              <div className={styles.statInfo}>
                <h3>{user.currentStreak}</h3>
                <p>현재 연속 기록</p>
              </div>
            </div>
          </div>
        </div>

        {user.badges && user.badges.length > 0 && (
          <div className={styles.section}>
            <h2>🏆 획득한 배지</h2>
            <div className={styles.badgesGrid}>
              {user.badges.map((badge, index) => (
                <div key={index} className={styles.badge}>
                  <span className={styles.badgeIcon}>{badge.icon}</span>
                  <span className={styles.badgeName}>{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {user.recentActivities && user.recentActivities.length > 0 && (
          <div className={styles.section}>
            <h2>📈 최근 활동</h2>
            <div className={styles.activitiesList}>
              {user.recentActivities.map((activity, index) => (
                <div key={index} className={styles.activity}>
                  <span className={styles.activityIcon}>{activity.icon}</span>
                  <div className={styles.activityInfo}>
                    <h4>{activity.title}</h4>
                    <p>{activity.description}</p>
                    <span className={styles.activityDate}>
                      {formatDate(activity.date)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
