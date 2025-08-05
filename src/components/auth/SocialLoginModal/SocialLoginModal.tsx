"use client";

import React, { useState } from "react";
import styles from "./styles.module.scss";
import Modal from "../../ui/Modal";
import SocialLoginButton from "../SocialLoginButton";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import { useAuth } from "../../../contexts/AuthContext";

interface SocialLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SocialLoginModal: React.FC<SocialLoginModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { socialLogin, signIn, isLoading } = useAuth();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleSocialLogin = async (provider: "kakao" | "google" | "naver") => {
    try {
      await socialLogin(provider);
    } catch (error) {
      console.error("Social login failed:", error);
    }
  };

  const validateEmailForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "올바른 이메일 형식을 입력해주세요.";
    }

    if (!password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateEmailForm()) {
      try {
        await signIn(email, password);
        onClose();
      } catch (error) {
        console.error("Email login failed:", error);
      }
    }
  };

  const handleClose = () => {
    setShowEmailForm(false);
    setEmail("");
    setPassword("");
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="로그인" size="small">
      <div className={styles.container}>
        {!showEmailForm ? (
          <>
            <div className={styles.description}>
              <p>소셜 계정으로 간편하게 로그인하세요</p>
            </div>

            <div className={styles.socialButtons}>
              <SocialLoginButton
                provider="kakao"
                onClick={() => handleSocialLogin("kakao")}
                className={styles.socialButton}
              />

              <SocialLoginButton
                provider="google"
                onClick={() => handleSocialLogin("google")}
                className={styles.socialButton}
              />

              <SocialLoginButton
                provider="naver"
                onClick={() => handleSocialLogin("naver")}
                className={styles.socialButton}
              />
            </div>

            <div className={styles.divider}>
              <span>또는</span>
            </div>

            <div className={styles.emailOption}>
              <Button
                variant="outline"
                onClick={() => setShowEmailForm(true)}
                className={styles.emailButton}
              >
                이메일로 로그인
              </Button>
            </div>
          </>
        ) : (
          <form onSubmit={handleEmailLogin} className={styles.emailForm}>
            <Input
              type="email"
              label="이메일"
              placeholder="이메일을 입력해주세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
            />

            <Input
              type="password"
              label="비밀번호"
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
            />

            <div className={styles.buttonGroup}>
              <Button
                type="submit"
                variant="primary"
                size="large"
                className={styles.submitButton}
                disabled={isLoading}
              >
                로그인
              </Button>

              <Button
                type="button"
                variant="outline"
                size="large"
                onClick={() => setShowEmailForm(false)}
                className={styles.backButton}
              >
                뒤로가기
              </Button>
            </div>
          </form>
        )}

        {isLoading && (
          <div className={styles.loading}>
            <p>로그인 중...</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SocialLoginModal;
