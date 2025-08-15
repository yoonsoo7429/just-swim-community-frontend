"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import SocialLoginModal from "@/components/auth/SocialLoginModal";
import styles from "./styles.module.scss";

interface SignInButtonProps {
  onSignIn?: (email: string, password: string) => void;
  className?: string;
}

const SignInButton: React.FC<SignInButtonProps> = ({
  onSignIn,
  className = "",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        variant="primary"
        onClick={handleOpenModal}
        className={`${styles.signInButton} ${className}`}
      >
        로그인
      </Button>

      <SocialLoginModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default SignInButton;
