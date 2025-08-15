"use client";

import React, { useState } from "react";
import styles from "./styles.module.scss";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import SocialLoginButton from "@/components/auth/SocialLoginButton";
import { useAuth } from "@/contexts/AuthContext";

interface SignUpButtonProps {
  onSignUp?: (email: string, password: string, confirmPassword: string) => void;
  className?: string;
}

const SignUpButton: React.FC<SignUpButtonProps> = ({
  onSignUp,
  className = "",
}) => {
  const { socialLogin, signUp, isLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    name?: string;
  }>({});

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setShowEmailForm(false);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setErrors({});
  };

  const handleSocialSignUp = async (provider: "kakao" | "google" | "naver") => {
    try {
      await socialLogin(provider);
      handleCloseModal();
    } catch (error) {
      console.error("Social signup failed:", error);
    }
  };

  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
      name?: string;
    } = {};

    if (!name) {
      newErrors.name = "이름을 입력해주세요.";
    }

    if (!email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "올바른 이메일 형식을 입력해주세요.";
    }

    if (!password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else if (password.length < 6) {
      newErrors.password = "비밀번호는 최소 6자 이상이어야 합니다.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        await signUp(email, password, name);
        handleCloseModal(); // 회원가입 성공 후 모달 닫기
      } catch (error) {
        console.error("Email signup failed:", error);
        // 에러 처리는 useAuth에서 이미 하고 있으므로 여기서는 추가 처리 불필요
      }
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={handleOpenModal}
        className={`${styles.signUpButton} ${className}`}
      >
        회원가입
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="회원가입"
        size="small"
      >
        <div className={styles.container}>
          {!showEmailForm ? (
            <>
              <div className={styles.description}>
                <p>소셜 계정으로 간편하게 회원가입하세요</p>
              </div>

              <div className={styles.socialButtons}>
                <SocialLoginButton
                  provider="kakao"
                  onClick={() => handleSocialSignUp("kakao")}
                  className={styles.socialButton}
                />

                <SocialLoginButton
                  provider="google"
                  onClick={() => handleSocialSignUp("google")}
                  className={styles.socialButton}
                />

                <SocialLoginButton
                  provider="naver"
                  onClick={() => handleSocialSignUp("naver")}
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
                  이메일로 회원가입
                </Button>
              </div>
            </>
          ) : (
            <form onSubmit={handleEmailSignUp} className={styles.emailForm}>
              <Input
                type="text"
                label="이름"
                placeholder="이름을 입력해주세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                required
              />

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

              <Input
                type="password"
                label="비밀번호 확인"
                placeholder="비밀번호를 다시 입력해주세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
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
                  회원가입
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
              <p>회원가입 중...</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default SignUpButton;
