// api/notification.ts
import api from "./axios";

export const getNotifications = () =>
  api.get("/notifications");

export const markAsRead = (id: number) =>
  api.post(`/notifications/${id}/read`);

export const getUnreadCount = () =>
  api.get("/notifications/unread-count");

export const markAllAsRead = () =>
  api.post("/notifications/read-all");
