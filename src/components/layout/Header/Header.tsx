"use client";

import React from "react";
import styles from "./styles.module.scss";
import SignInButton from "../../auth/SignInButton";
import SignUpButton from "../../auth/SignUpButton";

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = "" }) => {
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
            <li>
              <a href="/profile" className={styles.navLink}>
                내 프로필
              </a>
            </li>
          </ul>
        </nav>

        <div className={styles.authButtons}>
          <SignInButton onSignIn={handleSignIn} />
          <SignUpButton onSignUp={handleSignUp} />
        </div>
      </div>
    </header>
  );
};

export default Header;
