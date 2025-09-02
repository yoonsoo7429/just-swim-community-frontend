"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SignInButton from "@/components/auth/SignInButton";
import SignUpButton from "@/components/auth/SignUpButton";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import UserLevelBadge from "./UserLevelBadge";
import styles from "./styles.module.scss";

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  const router = useRouter();
  const { user, signOut, signIn, signUp, isLoading, isInitialized } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      console.log("Header - Sign in completed");
      setIsLoginModalOpen(false);
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  const handleSignUp = async (
    email: string,
    password: string,
    name: string
  ) => {
    try {
      await signUp(email, password, name);
      console.log("Header - Sign up completed");
      setIsSignupModalOpen(false);
    } catch (error) {
      console.error("Sign up failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  // 초기화가 완료되지 않았으면 스켈레톤 표시
  if (!isInitialized) {
    return (
      <header className={`${styles.header} ${className}`}>
        <div className={styles.container}>
          <div className={styles.logo}>
            <a href="/" className={styles.logoLink}>
              <h1>Just Swim</h1>
            </a>
          </div>
          <div className={styles.authButtons}>
            <div className={styles.loadingSkeleton}>
              <div className={styles.skeletonButton}></div>
              <div className={styles.skeletonButton}></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`${styles.header} ${className}`}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <a href="/" className={styles.logoLink}>
            <h1>Just Swim</h1>
          </a>
        </div>

        {user && (
          <nav className={styles.navigation}>
            <a href="/leaderboards" className={styles.navLink}>
              🏆 리더보드
            </a>
            <a href="/goals" className={styles.navLink}>
              🎯 목표
            </a>
            <a href="/social" className={styles.navLink}>
              👥 소셜
            </a>
            <a href="/messages" className={styles.navLink}>
              💬 메시지
            </a>
          </nav>
        )}

        <div className={styles.authButtons}>
          {user ? (
            <>
              <UserLevelBadge userId={user.id} />
              <div className={styles.userInfo} onClick={handleProfileClick}>
                <span className={styles.userName}>{user.name}</span>
                {user.profileImage && (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className={styles.userAvatar}
                  />
                )}
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className={styles.logoutButton}
              >
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <SignInButton onSignIn={handleSignIn} />
              <SignUpButton onSignUp={handleSignUp} />
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
