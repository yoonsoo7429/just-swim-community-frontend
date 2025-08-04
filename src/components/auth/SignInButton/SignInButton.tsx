"use client";

import React, { useState } from "react";
import styles from "./styles.module.scss";
import Button from "../../ui/Button";
import SocialLoginModal from "../SocialLoginModal";

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
