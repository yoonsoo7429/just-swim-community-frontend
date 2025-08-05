import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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

  // 로그아웃
  logout: () => apiClient.get("/auth/logout"),
};

export const swimmingAPI = {
  // 수영 기록 목록
  getRecords: () => apiClient.get("/swimming"),

  // 수영 기록 생성
  createRecord: (data: any) => apiClient.post("/swimming", data),

  // 수영 기록 수정
  updateRecord: (id: string, data: any) =>
    apiClient.patch(`/swimming/${id}`, data),

  // 수영 기록 삭제
  deleteRecord: (id: string) => apiClient.delete(`/swimming/${id}`),
};

export const trainingAPI = {
  // 훈련 프로그램 목록
  getPrograms: () => apiClient.get("/training/programs"),

  // 훈련 프로그램 상세
  getProgram: (id: string) => apiClient.get(`/training/programs/${id}`),

  // 훈련 세션 목록
  getSessions: () => apiClient.get("/training/sessions"),

  // 훈련 세션 생성
  createSession: (data: any) => apiClient.post("/training/sessions", data),
};

export const usersAPI = {
  // 사용자 정보 수정
  updateProfile: (data: any) => apiClient.patch("/users/profile", data),

  // 사용자 정보 가져오기
  getUser: (id: string) => apiClient.get(`/users/${id}`),
};
