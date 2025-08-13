import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 쿠키 포함
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 - 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 인증 실패 시 토큰 제거
      localStorage.removeItem("access_token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// API 함수들
export const authAPI = {
  // 사용자 정보 가져오기
  getProfile: () => apiClient.get("/auth/me"),

  // 이메일/비밀번호 로그인
  signin: (data: { email: string; password: string }) =>
    apiClient.post("/auth/signin", data),

  // 이메일/비밀번호 회원가입
  signup: (data: { email: string; password: string; name: string }) =>
    apiClient.post("/auth/signup", data),

  // 로그아웃
  logout: () => apiClient.get("/auth/logout"),
};

export const swimmingAPI = {
  // 수영 기록 목록
  getRecords: () => apiClient.get("/swimming"),

  // 수영 기록 상세 조회
  getRecord: (id: string) => apiClient.get(`/swimming/${id}`),

  // 내 수영 기록 목록
  getMyRecords: () => apiClient.get("/swimming/my-records"),

  // 최근 수영 기록
  getRecentRecords: (limit?: number) =>
    apiClient.get(`/swimming/recent${limit ? `?limit=${limit}` : ""}`),

  // 영법별 수영 기록
  getRecordsByStyle: (style: string) =>
    apiClient.get(`/swimming/style/${style}`),

  // 수영 통계
  getStats: () => apiClient.get("/swimming/stats"),

  // 내 수영 통계
  getMyStats: () => apiClient.get("/swimming/my-stats"),

  // 수영 기록 생성
  createRecord: (data: any) => apiClient.post("/swimming", data),

  // 수영 기록 수정
  updateRecord: (id: string, data: any) =>
    apiClient.patch(`/swimming/${id}`, data),

  // 수영 기록 삭제
  deleteRecord: (id: string) => apiClient.delete(`/swimming/${id}`),

  // 좋아요 추가
  addLike: (id: string) => apiClient.post(`/swimming/${id}/like`),

  // 좋아요 제거
  removeLike: (id: string) => apiClient.delete(`/swimming/${id}/like`),

  // 좋아요 상태 확인
  getLikeStatus: (id: string) => apiClient.get(`/swimming/${id}/like-status`),

  // 댓글 목록 조회
  getComments: (id: string) => apiClient.get(`/swimming/${id}/comments`),

  // 댓글 추가
  addComment: (id: string, content: string) =>
    apiClient.post(`/swimming/${id}/comments`, { content }),

  // 댓글 삭제
  removeComment: (commentId: string) =>
    apiClient.delete(`/swimming/comments/${commentId}`),
};

export const trainingAPI = {
  // 훈련 프로그램 목록
  getPrograms: () => apiClient.get("/training/programs"),

  // 훈련 프로그램 상세
  getProgram: (id: string) => apiClient.get(`/training/programs/${id}`),

  // 훈련 프로그램 생성
  createProgram: (data: any) => apiClient.post("/training/programs", data),

  // 훈련 세션 목록
  getSessions: () => apiClient.get("/training/sessions"),

  // 훈련 세션 생성
  createSession: (data: any) => apiClient.post("/training/sessions", data),

  // 프로그램별 세션 조회
  getSessionsByProgram: (programId: string) =>
    apiClient.get(`/training/programs/${programId}/sessions`),
};

export const usersAPI = {
  // 사용자 정보 수정
  updateProfile: (data: any) => apiClient.patch("/users/profile", data),

  // 사용자 정보 가져오기
  getUser: (id: string) => apiClient.get(`/users/${id}`),
};

export const communityAPI = {
  // 커뮤니티 통계 가져오기
  getStats: () => apiClient.get("/community/stats"),

  // 게시물 목록 가져오기
  getPosts: (params?: { category?: string; page?: number; limit?: number }) =>
    apiClient.get("/posts", { params }),

  // 카테고리별 게시물 조회
  getPostsByCategory: (category: string) =>
    apiClient.get(`/posts/category/${encodeURIComponent(category)}`),

  // 인기 게시물 조회
  getPopularPosts: () => apiClient.get("/posts/popular"),

  // 게시물 상세 가져오기
  getPost: (id: string) => apiClient.get(`/posts/${id}`),

  // 게시물 생성
  createPost: (data: { title: string; content: string; category: string }) =>
    apiClient.post("/posts", data),

  // 수영 기록을 커뮤니티에 연동하여 게시물 생성
  createSwimmingRecordPost: (recordId: string, additionalContent?: string) =>
    apiClient.post("/posts/swimming-record", {
      recordId,
      additionalContent,
    }),

  // 수영 기록의 공유 상태 확인
  getSwimmingRecordShareStatus: (recordId: string) =>
    apiClient.get(`/posts/swimming-record/${recordId}/status`),

  // 게시물 삭제
  deletePost: (postId: number) => apiClient.delete(`/posts/${postId}`),

  // 게시물 좋아요/취소
  toggleLike: (postId: number) => apiClient.post(`/posts/${postId}/like`),

  // 커뮤니티 통계 조회 (기존 코드 호환성)
  getCommunityStats: () => apiClient.get("/community/stats"),

  // 기존 게시물들의 제목을 업데이트
  updateExistingPostTitles: () => apiClient.post("/posts/update-titles"),
};
