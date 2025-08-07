import { useState, useEffect } from "react";

export function useLikedComments() {
  const [likedComments, setLikedComments] = useState<Set<number>>(() => {
    if (typeof window === "undefined") {
      return new Set();
    }
    try {
      const item = window.localStorage.getItem("likedComments");
      return item ? new Set(JSON.parse(item)) : new Set();
    } catch (error) {
      console.log("Error loading liked comments:", error);
      return new Set();
    }
  });

  const isLiked = (commentId: number): boolean => {
    return likedComments.has(commentId);
  };

  const toggleLike = (commentId: number) => {
    setLikedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const setLiked = (commentId: number, liked: boolean) => {
    setLikedComments((prev) => {
      const newSet = new Set(prev);
      if (liked) {
        newSet.add(commentId);
      } else {
        newSet.delete(commentId);
      }
      return newSet;
    });
  };

  // 로컬 스토리지에 저장
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          "likedComments",
          JSON.stringify([...likedComments])
        );
      } catch (error) {
        console.log("Error saving liked comments:", error);
      }
    }
  }, [likedComments]);

  return { isLiked, toggleLike, setLiked };
}
