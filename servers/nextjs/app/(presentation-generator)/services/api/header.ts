export const getUserId = (): string => {
  if (typeof window === 'undefined') return 'local';
  return localStorage.getItem('presenton_user_id') ?? 'local';
};

export const getHeader = () => {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "X-User-Id": getUserId(),
  };
};

export const getHeaderForFormData = () => {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "X-User-Id": getUserId(),
  };
};
