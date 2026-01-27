import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../api/axios";
import { ArrowLeft } from "lucide-react";

export default function ChangePasswordPegawai() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (
      !form.current_password ||
      !form.password ||
      !form.password_confirmation
    ) {
      Swal.fire("Oops", "Lengkapi semua field", "warning");
      return;
    }

    if (form.password !== form.password_confirmation) {
      Swal.fire("Oops", "Konfirmasi password tidak cocok", "warning");
      return;
    }

    try {
      setLoading(true);

      await api.post("/change-password", form);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Password berhasil diubah",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate(-1);
    } catch (err: any) {
      Swal.fire(
        "Gagal",
        err?.response?.data?.message || "Terjadi kesalahan",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 rounded-b-3xl">
        <div className="flex items-center">
          <button onClick={() => navigate("/home-pegawai")} className="mr-2">
            <ArrowLeft />
          </button>
          <h1 className="text-lg font-semibold text-center flex-1">
            Ubah Password
          </h1>
        </div>
      </div>

      {/* FORM */}
      <div className="p-5 space-y-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm space-y-3">

          <label className="text-sm text-gray-600">Password Lama</label>
          <input
            type="password"
            name="current_password"
            value={form.current_password}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
          />

          <label className="text-sm text-gray-600">Password Baru</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
          />

          <label className="text-sm text-gray-600">
            Konfirmasi Password Baru
          </label>
          <input
            type="password"
            name="password_confirmation"
            value={form.password_confirmation}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>

        <button
          disabled={loading}
          onClick={handleSubmit}
          className="w-full bg-indigo-600 text-white py-3 rounded-full shadow-md disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Simpan Password"}
        </button>
      </div>
    </div>
  );
}
