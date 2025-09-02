"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import FriendCard from "@/components/social/FriendCard";
import ChallengeCard from "@/components/social/ChallengeCard";
import styles from "./page.module.scss";

interface User {
  id: number;
  name: string;
  profileImage?: string;
  userLevel: number;
  title?: string;
}

interface SocialActivity {
  id: number;
  type: string;
  title: string;
  description?: string;
  createdAt: string;
  user: User;
}

interface FriendInfo {
  user: User;
  mutualFriends: number;
  recentActivity?: SocialActivity;
}

interface ChallengeInfo {
  challenge: any;
  participantCount: number;
  userParticipation?: any;
  topParticipants: any[];
}

export default function SocialPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [friends, setFriends] = useState<FriendInfo[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [challenges, setChallenges] = useState<ChallengeInfo[]>([]);
  const [socialFeed, setSocialFeed] = useState<SocialActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("friends");

  useEffect(() => {
    if (user) {
      fetchSocialData();
    }
  }, [user]);

  const fetchSocialData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      // 친구 목록 조회
      const friendsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/social/friends`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (friendsResponse.ok) {
        const friendsData = await friendsResponse.json();
        setFriends(friendsData);
      }

      // 친구 요청 조회
      const requestsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/social/friends/requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        setFriendRequests(requestsData);
      }

      // 친구 추천 조회
      const suggestionsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/social/friends/suggestions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (suggestionsResponse.ok) {
        const suggestionsData = await suggestionsResponse.json();
        setSuggestions(suggestionsData);
      }

      // 공개 챌린지 조회
      const challengesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/social/challenges/public?status=active`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (challengesResponse.ok) {
        const challengesData = await challengesResponse.json();
        setChallenges(challengesData);
      }

      // 소셜 피드 조회
      const feedResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/social/feed`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (feedResponse.ok) {
        const feedData = await feedResponse.json();
        setSocialFeed(feedData);
      }
    } catch (error) {
      console.error("Failed to fetch social data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (addresseeId: number) => {
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
            addresseeId,
            message: "안녕하세요! 친구가 되어요 🏊‍♂️",
          }),
        }
      );

      if (response.ok) {
        await fetchSocialData(); // 데이터 새로고침
      }
    } catch (error) {
      console.error("Failed to send friend request:", error);
    }
  };

  const handleRespondFriendRequest = async (
    friendshipId: number,
    status: "accepted" | "rejected"
  ) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/social/friends/requests/${friendshipId}/respond`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (response.ok) {
        await fetchSocialData(); // 데이터 새로고침
      }
    } catch (error) {
      console.error("Failed to respond to friend request:", error);
    }
  };

  const handleJoinChallenge = async (challengeId: number) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/social/challenges/${challengeId}/join`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await fetchSocialData(); // 데이터 새로고침
        if (typeof window !== "undefined") {
          alert("챌린지에 참가했습니다! 목표에 자동으로 연동되었어요.");
        }
      }
    } catch (error) {
      console.error("Failed to join challenge:", error);
    }
  };

  const handleMessage = (friendId: number) => {
    router.push(`/messages/${friendId}`);
  };

  const handleChallenge = (friendId: number) => {
    router.push(`/challenge/create/${friendId}`);
  };

  const getActivityIcon = (type: string): string => {
    switch (type) {
      case "swimming_record":
        return "🏊‍♂️";
      case "goal_completed":
        return "🎯";
      case "badge_earned":
        return "🏆";
      case "level_up":
        return "⭐";
      case "challenge_completed":
        return "🏅";
      case "streak_milestone":
        return "🔥";
      case "friendship_accepted":
        return "👥";
      default:
        return "📝";
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "방금 전";
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)}일 전`;
    return date.toLocaleDateString();
  };

  if (isLoading || loading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <p>소셜 정보를 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>👥 소셜</h1>
          <p>친구들과 함께 수영하고 챌린지에 도전해보세요!</p>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "friends" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("friends")}
          >
            친구 ({friends.length})
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "challenges" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("challenges")}
          >
            챌린지 ({challenges.length})
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "feed" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("feed")}
          >
            피드
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === "friends" && (
            <>
              {/* 친구 요청 */}
              {friendRequests.length > 0 && (
                <div className={styles.section}>
                  <h2>🔔 친구 요청</h2>
                  <div className={styles.requestsList}>
                    {friendRequests.map((request) => (
                      <div key={request.id} className={styles.requestCard}>
                        <div className={styles.requestUser}>
                          <div className={styles.avatar}>
                            {request.requester.profileImage ? (
                              <img
                                src={request.requester.profileImage}
                                alt={request.requester.name}
                              />
                            ) : (
                              <span>
                                {request.requester.name?.[0]?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className={styles.requestInfo}>
                            <h4>{request.requester.name}</h4>
                            {request.message && <p>{request.message}</p>}
                          </div>
                        </div>
                        <div className={styles.requestActions}>
                          <button
                            className={styles.acceptBtn}
                            onClick={() =>
                              handleRespondFriendRequest(request.id, "accepted")
                            }
                          >
                            수락
                          </button>
                          <button
                            className={styles.rejectBtn}
                            onClick={() =>
                              handleRespondFriendRequest(request.id, "rejected")
                            }
                          >
                            거절
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 친구 추천 */}
              {suggestions.length > 0 && (
                <div className={styles.section}>
                  <h2>💡 친구 추천</h2>
                  <div className={styles.suggestionsList}>
                    {suggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className={styles.suggestionCard}
                      >
                        <div className={styles.avatar}>
                          {suggestion.profileImage ? (
                            <img
                              src={suggestion.profileImage}
                              alt={suggestion.name}
                            />
                          ) : (
                            <span>{suggestion.name?.[0]?.toUpperCase()}</span>
                          )}
                        </div>
                        <div className={styles.suggestionInfo}>
                          <h4>{suggestion.name}</h4>
                          <span className={styles.level}>
                            Lv.{suggestion.userLevel}
                          </span>
                        </div>
                        <button
                          className={styles.addBtn}
                          onClick={() => handleSendFriendRequest(suggestion.id)}
                        >
                          친구 추가
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 친구 목록 */}
              <div className={styles.section}>
                <h2>👫 내 친구들</h2>
                {friends.length > 0 ? (
                  <div className={styles.friendsGrid}>
                    {friends.map((friendInfo) => (
                      <FriendCard
                        key={friendInfo.user.id}
                        friendInfo={friendInfo}
                        onViewProfile={(friendId) =>
                          router.push(`/profile/${friendId}`)
                        }
                        onMessage={(friendId) => handleMessage(friendId)}
                        onChallenge={(friendId) => handleChallenge(friendId)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <p>아직 친구가 없습니다. 새로운 친구를 찾아보세요!</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "challenges" && (
            <div className={styles.section}>
              <h2>🏆 활성 챌린지</h2>
              {challenges.length > 0 ? (
                <div className={styles.challengesGrid}>
                  {challenges.map((challengeInfo) => (
                    <ChallengeCard
                      key={challengeInfo.challenge.id}
                      challengeInfo={challengeInfo}
                      onJoin={handleJoinChallenge}
                      onView={(challengeId) =>
                        router.push(`/challenge/${challengeId}`)
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>현재 활성 챌린지가 없습니다.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "feed" && (
            <div className={styles.section}>
              <h2>📰 소셜 피드</h2>
              {socialFeed.length > 0 ? (
                <div className={styles.feedList}>
                  {socialFeed.map((activity) => (
                    <div key={activity.id} className={styles.feedItem}>
                      <div className={styles.feedUser}>
                        <div className={styles.avatar}>
                          {activity.user.profileImage ? (
                            <img
                              src={activity.user.profileImage}
                              alt={activity.user.name}
                            />
                          ) : (
                            <span>
                              {activity.user.name?.[0]?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className={styles.feedInfo}>
                          <h4>{activity.user.name}</h4>
                          <span className={styles.feedTime}>
                            {formatTimeAgo(activity.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className={styles.feedContent}>
                        <div className={styles.feedIcon}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className={styles.feedText}>
                          <h5>{activity.title}</h5>
                          {activity.description && (
                            <p>{activity.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>피드에 표시할 활동이 없습니다.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
