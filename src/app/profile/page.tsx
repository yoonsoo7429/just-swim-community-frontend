"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import styles from "./page.module.scss";

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!user) {
    router.push("/");
    return null;
  }

  const quickActions = [
    {
      title: "수영 기록",
      description: "개인 수영 기록을 관리하고 성장을 추적하세요",
      icon: "📊",
      path: "/records",
      color: "#3b82f6",
    },
    {
      title: "훈련 프로그램",
      description: "체계적인 훈련 프로그램으로 실력을 향상시키세요",
      icon: "📋",
      path: "/programs",
      color: "#10b981",
    },
    {
      title: "정기 모임",
      description: "다른 수영인들과 함께하는 정기 모임에 참여하세요",
      icon: "🏊‍♂️",
      path: "/series",
      color: "#f59e0b",
    },
    {
      title: "커뮤니티",
      description: "수영 경험과 팁을 공유하고 소통하세요",
      icon: "💬",
      path: "/community",
      color: "#8b5cf6",
    },
  ];

  return (
    <Layout>
      <div className={styles.container}>
        {/* 프로필 헤더 */}
        <section className={styles.profileHeader}>
          <div className={styles.profileInfo}>
            <div className={styles.avatarSection}>
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.defaultAvatar}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className={styles.userDetails}>
              <h1 className={styles.userName}>{user.name}</h1>
              <p className={styles.userEmail}>{user.email}</p>
              <p className={styles.welcomeMessage}>
                Just Swim에 오신 것을 환영합니다! 🏊‍♂️
              </p>
            </div>
          </div>
        </section>

        {/* 빠른 액션 */}
        <section className={styles.quickActions}>
          <h2 className={styles.sectionTitle}>빠른 액션</h2>
          <div className={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <div
                key={index}
                className={styles.actionCard}
                onClick={() => router.push(action.path)}
                style={{ borderLeftColor: action.color }}
              >
                <div
                  className={styles.actionIcon}
                  style={{ color: action.color }}
                >
                  {action.icon}
                </div>
                <div className={styles.actionContent}>
                  <h3 className={styles.actionTitle}>{action.title}</h3>
                  <p className={styles.actionDescription}>
                    {action.description}
                  </p>
                </div>
                <div className={styles.actionArrow}>→</div>
              </div>
            ))}
          </div>
        </section>

        {/* 계정 관리 */}
        <section className={styles.accountManagement}>
          <h2 className={styles.sectionTitle}>계정 관리</h2>
          <div className={styles.accountActions}>
            <Button
              variant="outline"
              onClick={() => router.push("/profile/edit")}
              className={styles.accountButton}
            >
              프로필 수정
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/profile/settings")}
              className={styles.accountButton}
            >
              설정
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/profile/help")}
              className={styles.accountButton}
            >
              도움말
            </Button>
          </div>
        </section>

        {/* 로그아웃 */}
        <section className={styles.logoutSection}>
          <Button
            variant="outline"
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            로그아웃
          </Button>
        </section>
      </div>
    </Layout>
  );
}
