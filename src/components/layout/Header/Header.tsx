"use client";

import React from "react";
import styles from "./styles.module.scss";
import SignInButton from "../../auth/SignInButton";
import SignUpButton from "../../auth/SignUpButton";
import { useAuth } from "../../../contexts/AuthContext";
import Button from "../../ui/Button";

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  const { user, signOut, signIn, signUp, isLoading, isInitialized } = useAuth();

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      console.log("Header - Sign in completed");
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

  // 초기화가 완료되지 않았으면 스켈레톤 표시
  if (!isInitialized) {
    return (
      <header className={`${styles.header} ${className}`}>
        <div className={styles.container}>
          <div className={styles.logo}>
            <h1>Just Swim</h1>
          </div>
          <nav className={styles.navigation}>
            <ul className={styles.navList}>
              <li>
                <a href="/" className={styles.navLink}>
                  홈
                </a>
              </li>
              <li>
                <a href="/records" className={styles.navLink}>
                  수영 기록
                </a>
              </li>
              <li>
                <a href="/programs" className={styles.navLink}>
                  훈련 프로그램
                </a>
              </li>
              <li>
                <a href="/community" className={styles.navLink}>
                  커뮤니티
                </a>
              </li>
            </ul>
          </nav>
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
          <h1>Just Swim</h1>
        </div>

        <nav className={styles.navigation}>
          <ul className={styles.navList}>
            <li>
              <a href="/" className={styles.navLink}>
                홈
              </a>
            </li>
            <li>
              <a href="/records" className={styles.navLink}>
                수영 기록
              </a>
            </li>
            <li>
              <a href="/programs" className={styles.navLink}>
                훈련 프로그램
              </a>
            </li>
            <li>
              <a href="/community" className={styles.navLink}>
                커뮤니티
              </a>
            </li>
          </ul>
        </nav>

        <div className={styles.authButtons}>
          {user ? (
            <>
              <div className={styles.userInfo}>
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
                variant="secondary"
                onClick={() => (window.location.href = "/profile")}
                className={styles.profileButton}
              >
                마이페이지
              </Button>
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
