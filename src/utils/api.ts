import { apiClient } from "./apiClient";

// Training Core API - 백엔드에 구현됨
export const trainingAPI = {
  // Training Program APIs
  createProgram: (data: any) => apiClient.post("/training/programs", data),
  getMyPrograms: () => apiClient.get("/training/programs/my-programs"),
  getPublicPrograms: () => apiClient.get("/training/programs/public"),
  getProgramById: (id: number) => apiClient.get(`/training/programs/${id}`),
  updateProgram: (id: number, data: any) =>
    apiClient.patch(`/training/programs/${id}`, data),
  deleteProgram: (id: number) => apiClient.delete(`/training/programs/${id}`),
  joinProgram: (id: number) => apiClient.post(`/training/programs/${id}/join`),
  leaveProgram: (id: number) =>
    apiClient.delete(`/training/programs/${id}/leave`),
  getProgramParticipants: (id: number) =>
    apiClient.get(`/training/programs/${id}/participants`),

  // Training Session APIs
  createSession: (data: any) => apiClient.post("/training/sessions", data),
  getSessionsByProgram: (programId: number) =>
    apiClient.get(`/training/programs/${programId}/sessions`),

  // Training Series APIs
  createSeries: (data: any) => apiClient.post("/training/series", data),
  getMySeries: () => apiClient.get("/training/series/my-series"),
  getPublicSeries: () => apiClient.get("/training/series/public"),
  getSeries: () => apiClient.get("/training/series"),
  getSeriesById: (id: number) => apiClient.get(`/training/series/${id}`),
  updateSeries: (id: number, data: any) =>
    apiClient.patch(`/training/series/${id}`, data),
  deleteSeries: (id: number) => apiClient.delete(`/training/series/${id}`),
  publishSeries: (id: number) =>
    apiClient.post(`/training/series/${id}/publish`),
  unpublishSeries: (id: number) =>
    apiClient.post(`/training/series/${id}/unpublish`),

  // Training Meeting APIs
  createMeeting: (data: any) => apiClient.post("/training/meetings", data),
  getMeetingsBySeries: (seriesId: number) =>
    apiClient.get(`/training/series/${seriesId}/meetings`),
  getMeetingById: (id: number) => apiClient.get(`/training/meetings/${id}`),
  updateMeeting: (id: number, data: any) =>
    apiClient.patch(`/training/meetings/${id}`, data),
  deleteMeeting: (id: number) => apiClient.delete(`/training/meetings/${id}`),

  // Meeting Participation APIs
  joinMeeting: (id: number, data: any) =>
    apiClient.post(`/training/meetings/${id}/join`, data),
  leaveMeeting: (id: number) =>
    apiClient.delete(`/training/meetings/${id}/leave`),
  getMeetingParticipants: (id: number) =>
    apiClient.get(`/training/meetings/${id}/participants`),
  getMyMeetingParticipations: () =>
    apiClient.get("/training/meetings/my-participations"),

  // Auto-generation APIs
  generateNextMeetings: (seriesId: number) =>
    apiClient.post(`/training/series/${seriesId}/generate-next-meetings`),
  generateRecurringMeetings: (seriesId: number, weeks: number) =>
    apiClient.post(`/training/series/${seriesId}/generate-recurring-meetings`, {
      weeks,
    }),
};

// Auth API - 백엔드에 구현됨
export const authAPI = {
  signin: (credentials: { email: string; password: string }) =>
    apiClient.post("/auth/signin", credentials),
  signup: (userData: any) => apiClient.post("/auth/signup", userData),
  logout: () => apiClient.get("/auth/logout"),
  getProfile: () => apiClient.get("/auth/me"),
  // 소셜 로그인
  kakaoAuth: () => apiClient.get("/auth/kakao"),
  googleAuth: () => apiClient.get("/auth/google"),
  naverAuth: () => apiClient.get("/auth/naver"),
};

// User API - 백엔드에 구현됨 (제한적)
export const userAPI = {
  getUserById: (id: number) => apiClient.get(`/users/${id}`),
  // profile과 change-password는 백엔드에 없음
  // 필요시 추가 구현 필요
};

// Swimming API - 백엔드에 구현됨
export const swimmingAPI = {
  getRecords: () => apiClient.get("/swimming"),
  getMyRecords: () => apiClient.get("/swimming/my-records"),
  getRecord: (id: number) => apiClient.get(`/swimming/${id}`),
  createRecord: (data: any) => apiClient.post("/swimming", data),
  updateRecord: (id: number, data: any) =>
    apiClient.patch(`/swimming/${id}`, data),
  deleteRecord: (id: number) => apiClient.delete(`/swimming/${id}`),
  // 추가 엔드포인트들
  getRecentRecords: (limit?: number) =>
    apiClient.get("/swimming/recent", { params: { limit } }),
  getRecordsByStyle: (style: string) =>
    apiClient.get(`/swimming/style/${style}`),
  getStats: () => apiClient.get("/swimming/stats"),
  getMyStats: () => apiClient.get("/swimming/my-stats"),
  toggleLike: (id: number) => apiClient.post(`/swimming/${id}/like`),
  removeLike: (id: number) => apiClient.delete(`/swimming/${id}/like`),
  getLikeStatus: (id: number) => apiClient.get(`/swimming/${id}/like-status`),
  // 댓글 관련
  getComments: (id: number) => apiClient.get(`/swimming/${id}/comments`),
  addComment: (id: number, data: any) =>
    apiClient.post(`/swimming/${id}/comments`, data),
  removeComment: (commentId: number) =>
    apiClient.delete(`/swimming/comments/${commentId}`),
};

// Posts API - 백엔드에 구현됨
export const postsAPI = {
  getPosts: () => apiClient.get("/posts"),
  getPostById: (id: number) => apiClient.get(`/posts/${id}`),
  createPost: (data: any) => apiClient.post("/posts", data),
  updatePost: (id: number, data: any) => apiClient.patch(`/posts/${id}`, data),
  deletePost: (id: number) => apiClient.delete(`/posts/${id}`),
  getPostsByCategory: (category: string) =>
    apiClient.get(`/posts/category/${category}`),
  getPopularPosts: () => apiClient.get("/posts/popular"),
  toggleLike: (postId: number) => apiClient.post(`/posts/${postId}/like`),
  // 추가 엔드포인트들
  createSwimmingRecordPost: (recordId: number, additionalContent?: string) =>
    apiClient.post("/posts/swimming-record", { recordId, additionalContent }),
  createTrainingProgramPost: (programId: number, additionalContent?: string) =>
    apiClient.post("/posts/training-program", { programId, additionalContent }),
  createTrainingSeriesPost: (seriesId: number, additionalContent?: string) =>
    apiClient.post("/posts/training-series", { seriesId, additionalContent }),
  getSwimmingRecordShareStatus: (recordId: number) =>
    apiClient.get(`/posts/swimming-record/${recordId}/status`),
  getTrainingProgramShareStatus: (programId: number) =>
    apiClient.get(`/posts/training-program/${programId}/status`),
};

// Comments API - 백엔드에 구현됨 (posts 컨트롤러 내부)
export const commentsAPI = {
  getCommentsByPost: (postId: number) =>
    apiClient.get(`/posts/${postId}/comments`),
  createComment: (postId: number, data: any) =>
    apiClient.post(`/posts/${postId}/comments`, data),
  // updateComment와 deleteComment는 백엔드에 별도 엔드포인트 없음
  // posts 컨트롤러 내부에서만 처리
};

// Community API - 백엔드에 제한적으로 구현됨
export const communityAPI = {
  getStats: () => apiClient.get("/community/stats"),
  getPopularPosts: () => apiClient.get("/community/popular"),
  getTrendingPosts: () => apiClient.get("/community/trending"),
  searchPosts: (query: string, category?: string) =>
    apiClient.get("/community/search", { params: { q: query, category } }),
  getPopularTags: () => apiClient.get("/community/tags"),
  getCategories: () => apiClient.get("/community/categories"),
  getRecentPosts: () => apiClient.get("/community/recent"),
  getRecommendedPosts: () => apiClient.get("/community/recommendations"),
  getCommunityStats: () => apiClient.get("/community/stats"),
  // 게시물 상세 및 댓글 관련 메서드 추가
  getPost: (postId: number) => apiClient.get(`/posts/${postId}`),
  getComments: (postId: number) => apiClient.get(`/posts/${postId}/comments`),
  createComment: (postId: number, content: string) =>
    apiClient.post(`/posts/${postId}/comments`, { content }),
  toggleLike: (postId: number) => apiClient.post(`/posts/${postId}/like`),
  // 공유 상태 확인 메서드 추가
  getSwimmingRecordShareStatus: (recordId: number) =>
    apiClient.get(`/posts/swimming-record/${recordId}/status`),
  getTrainingProgramShareStatus: (programId: number) =>
    apiClient.get(`/posts/training-program/${programId}/status`),
  // 게시물 삭제 메서드 추가
  deletePost: (postId: number) => apiClient.delete(`/posts/${postId}`),
};

// Training Progress API - 백엔드에 구현됨
export const trainingProgressAPI = {
  // Program Progress APIs
  startProgram: (programId: number, totalSessions: number) =>
    apiClient.post(`/training-progress/programs/${programId}/start`, {
      totalSessions,
    }),
  getProgramProgress: (programId: number) =>
    apiClient.get(`/training-progress/programs/${programId}/progress`),
  getMyProgramsProgress: () =>
    apiClient.get("/training-progress/programs/my-progress"),

  // Session Completion APIs
  completeSession: (
    sessionId: number,
    programId: number,
    completionData: any
  ) =>
    apiClient.post(`/training-progress/sessions/${sessionId}/complete`, {
      programId,
      ...completionData,
    }),
  updateSessionCompletion: (sessionId: number, updateData: any) =>
    apiClient.patch(
      `/training-progress/sessions/${sessionId}/completion`,
      updateData
    ),
  deleteSessionCompletion: (sessionId: number) =>
    apiClient.delete(`/training-progress/sessions/${sessionId}/completion`),
};

export const trainingReviewAPI = {
  // Program Review APIs
  createProgramReview: (programId: number, reviewData: any) =>
    apiClient.post(
      `/training-review/programs/${programId}/reviews`,
      reviewData
    ),
  getProgramReviews: (programId: number) =>
    apiClient.get(`/training-review/programs/${programId}/reviews`),
  getProgramReviewStatistics: (programId: number) =>
    apiClient.get(`/training-review/programs/${programId}/reviews/statistics`),

  // Review Management APIs
  getReviewById: (reviewId: number) =>
    apiClient.get(`/training-review/reviews/${reviewId}`),
  updateProgramReview: (reviewId: number, updateData: any) =>
    apiClient.patch(`/training-review/reviews/${reviewId}`, updateData),
  deleteProgramReview: (reviewId: number) =>
    apiClient.delete(`/training-review/reviews/${reviewId}`),
  getMyReviews: () => apiClient.get("/training-review/reviews/my"),
};

// TODO: 백엔드에 구현되지 않은 API들 - 추후 구현 필요
// - community-recruitment/*
// - comments CRUD (별도 엔드포인트)
// - users/profile, users/change-password
