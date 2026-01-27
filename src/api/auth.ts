export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("dashboard_type");
  localStorage.removeItem("company_id");
  localStorage.removeItem("user");
  localStorage.removeItem("face_registered");
};

export const setAuthData = (token: string, user: any) => {
  localStorage.setItem("token", token);
  localStorage.setItem("dashboard_type", user.dashboard_type);
  localStorage.setItem("company_id", user.company_id || "");
  localStorage.setItem("user", JSON.stringify(user));
};

export const getAuthData = () => {
  const token = localStorage.getItem("token");
  const dashboard_type = localStorage.getItem("dashboard_type");
  const company_id = localStorage.getItem("company_id");
  const user = localStorage.getItem("user");
  
  return {
    token,
    dashboard_type,
    company_id,
    user: user ? JSON.parse(user) : null,
  };
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token");
  return !!token;
};