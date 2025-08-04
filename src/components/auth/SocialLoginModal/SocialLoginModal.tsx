"use client";

import React from "react";
import styles from "./styles.module.scss";
import Modal from "../../ui/Modal";
import SocialLoginButton from "../SocialLoginButton";
import { useAuth } from "../../../hooks/useAuth";

interface SocialLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SocialLoginModal: React.FC<SocialLoginModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { socialLogin, isLoading } = useAuth();

  const handleSocialLogin = async (provider: 'kakao' | 'google' | 'naver') => {
    try {
      await socialLogin(provider);
      // 소셜 로그인은 리다이렉트되므로 모달을 닫을 필요가 없음
    } catch (error) {
      console.error('Social login failed:', error);
      // 에러 처리
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="로그인"
      size="small"
    >
      <div className={styles.container}>
        <div className={styles.description}>
          <p>소셜 계정으로 간편하게 로그인하세요</p>
        </div>
        
        <div className={styles.socialButtons}>
          <SocialLoginButton
            provider="kakao"
            onClick={() => handleSocialLogin('kakao')}
            className={styles.socialButton}
          />
          
          <SocialLoginButton
            provider="google"
            onClick={() => handleSocialLogin('google')}
            className={styles.socialButton}
            disabled={true}
          />
          
          <SocialLoginButton
            provider="naver"
            onClick={() => handleSocialLogin('naver')}
            className={styles.socialButton}
            disabled={true}
          />
        </div>
        
        <div className={styles.divider}>
          <span>또는</span>
        </div>
        
        <div className={styles.emailOption}>
          <p>이메일로 로그인하려면 관리자에게 문의하세요</p>
        </div>
        
        <div className={styles.notice}>
          <p>Google과 Naver 로그인은 준비 중입니다.</p>
        </div>
        
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