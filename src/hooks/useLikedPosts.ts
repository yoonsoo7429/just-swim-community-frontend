import { useState, useEffect } from "react";

export function useLikedPosts() {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(() => {
    if (typeof window === "undefined") {
      return new Set();
    }
    try {
      const item = window.localStorage.getItem("likedPosts");
      return item ? new Set(JSON.parse(item)) : new Set();
    } catch (error) {
      console.log("Error loading liked posts:", error);
      return new Set();
    }
  });

  const isLiked = (postId: number): boolean => {
    return likedPosts.has(postId);
  };

  const toggleLike = (postId: number) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const setLiked = (postId: number, liked: boolean) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (liked) {
        newSet.add(postId);
      } else {
        newSet.delete(postId);
      }
      return newSet;
    });
  };

  // 로컬 스토리지에 저장
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("likedPosts", JSON.stringify([...likedPosts]));
      } catch (error) {
        console.log("Error saving liked posts:", error);
      }
    }
  }, [likedPosts]);

  return { isLiked, toggleLike, setLiked };
} 