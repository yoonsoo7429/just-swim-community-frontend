import { Post, Comment, CommunityStats, PostCategory } from "../types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// 게시물 관련 API
export const getPosts = async (): Promise<Post[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts`);
    if (!response.ok) throw new Error("게시물을 불러오는데 실패했습니다.");
    return await response.json();
  } catch (error) {
    console.error("getPosts error:", error);
    throw error;
  }
};

export const getPost = async (id: number): Promise<Post> => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`);
    if (!response.ok) throw new Error("게시물을 불러오는데 실패했습니다.");
    return await response.json();
  } catch (error) {
    console.error("getPost error:", error);
    throw error;
  }
};

export const createPost = async (data: {
  title: string;
  content: string;
  category: PostCategory;
}): Promise<Post> => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("게시물 작성에 실패했습니다.");
    return await response.json();
  } catch (error) {
    console.error("createPost error:", error);
    throw error;
  }
};

export const likePost = async (postId: number): Promise<Post> => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("좋아요 처리에 실패했습니다.");

    // 좋아요 처리 후 업데이트된 게시물 정보를 직접 반환
    return await response.json();
  } catch (error) {
    console.error("likePost error:", error);
    throw error;
  }
};

// 댓글 관련 API
export const getComments = async (postId: number): Promise<Comment[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
    if (!response.ok) throw new Error("댓글을 불러오는데 실패했습니다.");
    return await response.json();
  } catch (error) {
    console.error("getComments error:", error);
    throw error;
  }
};

export const createComment = async (
  postId: number,
  content: string
): Promise<Comment> => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) throw new Error("댓글 작성에 실패했습니다.");
    return await response.json();
  } catch (error) {
    console.error("createComment error:", error);
    throw error;
  }
};

// 커뮤니티 통계 API
export const getCommunityStats = async (): Promise<CommunityStats> => {
  try {
    const response = await fetch(`${API_BASE_URL}/community/stats`);
    if (!response.ok)
      throw new Error("커뮤니티 통계를 불러오는데 실패했습니다.");
    return await response.json();
  } catch (error) {
    console.error("getCommunityStats error:", error);
    throw error;
  }
};

// 인기 게시물 API
export const getPopularPosts = async (): Promise<Post[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/popular`);
    if (!response.ok) throw new Error("인기 게시물을 불러오는데 실패했습니다.");
    return await response.json();
  } catch (error) {
    console.error("getPopularPosts error:", error);
    throw error;
  }
};

// 카테고리별 게시물 API
export const getPostsByCategory = async (
  category: PostCategory
): Promise<Post[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/posts?category=${encodeURIComponent(category)}`
    );
    if (!response.ok)
      throw new Error("카테고리별 게시물을 불러오는데 실패했습니다.");
    return await response.json();
  } catch (error) {
    console.error("getPostsByCategory error:", error);
    throw error;
  }
};
