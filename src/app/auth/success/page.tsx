"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import styles from './page.module.scss';

export default function AuthSuccessPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [message, setMessage] = useState('로그인 처리 중...');

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // 잠시 대기 후 사용자 정보 확인
        setTimeout(() => {
          if (user) {
            setMessage('로그인 성공! 메인 페이지로 이동합니다.');
            setTimeout(() => {
              router.push('/');
            }, 1500);
          } else {
            setMessage('로그인에 실패했습니다. 다시 시도해주세요.');
            setTimeout(() => {
              router.push('/');
            }, 2000);
          }
        }, 1000);
      } catch (error) {
        console.error('Auth check failed:', error);
        setMessage('로그인 처리 중 오류가 발생했습니다.');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    };

    checkAuthStatus();
  }, [user, router]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
        </div>
        <h1 className={styles.title}>로그인 처리 중</h1>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
} 