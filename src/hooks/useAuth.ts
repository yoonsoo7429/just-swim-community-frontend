import { useState, useEffect } from "react";
import { User } from "../types";
import { authAPI } from "../utils/api";

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;
  signOut: () => void;
  socialLogin: (provider: "kakao" | "google" | "naver") => Promise<void>;
  updateUser: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        const response = await authAPI.getProfile();
        setUser(response.data);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("access_token");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const updateUser = async () => {
    try {
      setIsLoading(true);
      await checkAuth();
    } catch (error) {
      console.error("Update user failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("Email/password login not implemented yet");
      throw new Error("Email/password login not implemented yet");
    } catch (error) {
      console.error("Sign in failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    try {
      setIsLoading(true);
      console.log("Email/password signup not implemented yet");
      throw new Error("Email/password signup not implemented yet");
    } catch (error) {
      console.error("Sign up failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (provider: "kakao" | "google" | "naver") => {
    try {
      setIsLoading(true);

      // 직접 백엔드 OAuth 엔드포인트로 리다이렉트
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}`;
    } catch (error) {
      console.error("Social login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("access_token");
    }
  };

  return {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    socialLogin,
    updateUser,
  };
};
