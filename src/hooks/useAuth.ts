import { useState, useEffect } from 'react';
import { User } from '../types';
import { authAPI } from '../utils/api';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, confirmPassword: string) => Promise<void>;
  signOut: () => void;
  socialLogin: (provider: 'kakao' | 'google' | 'naver') => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // 백엔드에서 사용자 정보 가져오기
          const response = await authAPI.getProfile();
          setUser(response.data);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // TODO: 이메일/비밀번호 로그인 구현 (현재는 소셜 로그인만 지원)
      console.log('Email/password login not implemented yet');
      throw new Error('Email/password login not implemented yet');
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, confirmPassword: string) => {
    try {
      setIsLoading(true);
      // TODO: 이메일/비밀번호 회원가입 구현 (현재는 소셜 로그인만 지원)
      console.log('Email/password signup not implemented yet');
      throw new Error('Email/password signup not implemented yet');
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (provider: 'kakao' | 'google' | 'naver') => {
    try {
      setIsLoading(true);
      
      // Google과 Naver는 준비 중
      if (provider === 'google' || provider === 'naver') {
        alert(`${provider === 'google' ? 'Google' : 'Naver'} 로그인은 준비 중입니다.`);
        setIsLoading(false);
        return;
      }
      
      // 백엔드에서 소셜 로그인 URL 가져오기
      const response = await authAPI.getSocialLoginUrl(provider);
      
      // 소셜 로그인 페이지로 리다이렉트
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        // URL이 없으면 직접 백엔드 엔드포인트로 이동
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}`;
      }
    } catch (error) {
      console.error('Social login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('authToken');
    }
  };

  return {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    socialLogin,
  };
}; 