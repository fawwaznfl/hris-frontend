import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import api from "../../api/axios";
import { setAuthData } from "../../../src/api/auth";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/login", formData);
      const { pegawai, token } = res.data;

      // Gunakan helper function untuk set auth data
      setAuthData(token, pegawai);

      // ✅ CEK FACE RECOGNITION UNTUK PEGAWAI
      if (pegawai.dashboard_type === "pegawai") {
        try {
          const faceRes = await api.get(`/face/check/${pegawai.id}`);
          const isRegistered = faceRes.data?.data?.registered;

          // Simpan status face registration
          localStorage.setItem("face_registered", String(isRegistered));

          await Swal.fire({
            icon: "success",
            title: "Login Berhasil!",
            text: `Selamat datang, ${pegawai.name}`,
            confirmButtonColor: "#2563eb",
            timer: 1500,
            showConfirmButton: false,
          });
          
          navigate("/home-pegawai");
        } catch (error) {
          console.error("Error checking face:", error);
          // Jika error cek face, tetap lanjut ke home
          navigate("/home-pegawai");
        }
      } 
      // ADMIN & SUPERADMIN
      else {
        await Swal.fire({
          icon: "success",
          title: "Login Berhasil!",
          text: `Selamat datang, ${pegawai.name}`,
          confirmButtonColor: "#2563eb",
          timer: 1500,
          showConfirmButton: false,
        });
        
        navigate("/dashboard");
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal Login",
        text: error.response?.data?.message || "Email atau password salah.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
          Login
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <Label>
                Email<span className="text-error-500">*</span>
              </Label>
              <Input
                type="email"
                name="email"
                placeholder="Masukan Email Kamu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label>
                Password<span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Masukan Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </span>
              </div>
              <div className="mt-2 text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Lupa Password?
                </Link>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Login"}
            </button>
          </div>
        </form>
        <p className="mt-5 text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
          Belum punya akun?{" "}
          <Link
            to="/signup"
            className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
          >
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}