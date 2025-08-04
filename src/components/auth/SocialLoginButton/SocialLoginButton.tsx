"use client";

import React from "react";
import styles from "./styles.module.scss";
import Image from "next/image";

interface SocialLoginButtonProps {
  provider: "kakao" | "google" | "naver";
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({
  provider,
  onClick,
  className = "",
  disabled = false,
}) => {
  const getProviderInfo = () => {
    switch (provider) {
      case "kakao":
        return {
          name: "카카오",
          icon: "/icon_kakao.svg",
          bgColor: "#FEE500",
          textColor: "#000000",
        };
      case "google":
        return {
          name: "구글",
          icon: "/icon_google.svg",
          bgColor: "#FFFFFF",
          textColor: "#000000",
        };
      case "naver":
        return {
          name: "네이버",
          icon: "/icon_naver.svg",
          bgColor: "#03C75A",
          textColor: "#FFFFFF",
        };
      default:
        return {
          name: "",
          icon: "",
          bgColor: "#FFFFFF",
          textColor: "#000000",
        };
    }
  };

  const providerInfo = getProviderInfo();

  return (
    <button
      className={`${styles.socialLoginButton} ${className} ${disabled ? styles.disabled : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? '#f5f5f5' : providerInfo.bgColor,
        color: disabled ? '#999' : providerInfo.textColor,
      }}
    >
      <div className={styles.iconContainer}>
        <Image
          src={providerInfo.icon}
          alt={`${providerInfo.name} 로그인`}
          width={20}
          height={20}
        />
      </div>
      <span className={styles.text}>
        {disabled ? `${providerInfo.name} (준비 중)` : `${providerInfo.name}로 계속하기`}
      </span>
    </button>
  );
};

export default SocialLoginButton; 