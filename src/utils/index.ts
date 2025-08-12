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

export * from "./api";
