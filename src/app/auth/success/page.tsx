"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import styles from "./page.module.scss";

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, updateUser } = useAuth();
  const [message, setMessage] = useState("로그인 처리 중...");

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // URL에서 토큰 가져오기
        const token = searchParams.get("token");

        if (token) {
          // 토큰을 localStorage에 저장
          localStorage.setItem("access_token", token);

          // 잠시 대기 후 사용자 정보 확인
          setTimeout(async () => {
            try {
              // 사용자 정보 다시 가져오기
              await updateUser();
              setMessage("로그인 성공! 메인 페이지로 이동합니다.");
              setTimeout(() => {
                router.push("/");
              }, 1500);
            } catch (error) {
              console.error("Failed to get user info:", error);
              setMessage("로그인에 실패했습니다. 다시 시도해주세요.");
              setTimeout(() => {
                router.push("/");
              }, 2000);
            }
          }, 1000);
        } else {
          setMessage("로그인에 실패했습니다. 다시 시도해주세요.");
          setTimeout(() => {
            router.push("/");
          }, 2000);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setMessage("로그인 처리 중 오류가 발생했습니다.");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    };

    checkAuthStatus();
  }, [searchParams, router, updateUser]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>로그인 처리 중</h1>
        <p>{message}</p>
        {isLoading && <div className={styles.loader}>로딩 중...</div>}
      </div>
    </div>
  );
}
