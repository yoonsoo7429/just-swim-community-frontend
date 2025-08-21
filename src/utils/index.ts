// Utility functions will be exported here
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("ko-KR");
};

export const formatCurrency = (amount: number): string => {
  return Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

// 난이도 한글 변환 함수
export const getDifficultyText = (difficulty: string) => {
  switch (difficulty) {
    case "beginner":
      return "초급";
    case "intermediate":
      return "중급";
    case "advanced":
      return "고급";
    default:
      return difficulty;
  }
};

// 유형 한글 변환 함수
export const getTypeText = (type: string) => {
  switch (type) {
    case "regular":
      return "정기";
    case "short-term":
      return "단기";
    default:
      return type;
  }
};

export * from "./api";
