import api from "../api/axios";

export const getSelfAbsensi = () => api.get("/absensi/self");

export const absenMasuk = (payload: any) =>
  api.post("/absensi/masuk", payload);

export const absenPulang = (payload: any) =>
  api.post("/absensi/pulang", payload);
