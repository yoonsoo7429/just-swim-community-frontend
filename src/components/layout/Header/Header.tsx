"use client";

import React from "react";
import styles from "./styles.module.scss";
import SignInButton from "../../auth/SignInButton";
import SignUpButton from "../../auth/SignUpButton";
import { useAuth } from "../../../hooks/useAuth";
import Button from "../../ui/Button";

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  const { user, signOut } = useAuth();

  const handleSignIn = (email: string, password: string) => {
    console.log("Sign in:", { email, password });
    // TODO: Implement sign in logic
  };

  const handleSignUp = (
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    console.log("Sign up:", { email, password, confirmPassword });
    // TODO: Implement sign up logic
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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
            {user && (
              <li>
                <a href="/profile" className={styles.navLink}>
                  내 프로필
                </a>
              </li>
            )}
          </ul>
        </nav>

        <div className={styles.authButtons}>
          {user ? (
            // 로그인된 경우: 마이페이지와 로그아웃 버튼
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
            // 로그인되지 않은 경우: 로그인/회원가입 버튼
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
