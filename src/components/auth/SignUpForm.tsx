import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import api from "../../api/axios";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    no_telp: "",
    password: "",
    password_confirmation: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/register", formData);

      // ✅ SweetAlert sukses
      Swal.fire({
        icon: "success",
        title: "Registrasi Berhasil!",
        text: "Akun kamu sudah dibuat. Silakan login sekarang.",
        confirmButtonColor: "#2563eb", // warna biru
        confirmButtonText: "Oke",
      }).then(() => {
        navigate("/"); // Redirect setelah klik "Oke"
      });

      console.log("Response:", res.data);
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage =
        error.response?.data?.message || "Gagal registrasi, coba lagi.";

      // ❌ SweetAlert error
      Swal.fire({
        icon: "error",
        title: "Gagal Registrasi",
        text: errorMessage,
        confirmButtonColor: "#dc2626", // merah
      });

      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Register
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Nama Lengkap */}
              <div>
                <Label>
                  Nama Lengkap<span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  name="name"
                  placeholder="Masukan Nama Kamu"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              {/* Username */}
              <div>
                <Label>
                  Username<span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  name="username"
                  placeholder="Masukan Username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
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
                />
              </div>

              {/* Nomor Telepon */}
              <div>
                <Label>
                  Nomor Telepon<span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  name="no_telp"
                  placeholder="Masukan Nomor Telepon Kamu"
                  value={formData.no_telp}
                  onChange={handleChange}
                />
              </div>

              {/* Password */}
              <div>
                <Label>
                  Password<span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Masukan password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
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
              </div>

              {/* Konfirmasi Password */}
              <div>
                <Label>
                  Konfirmasi Password{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Ulangi Password"
                    type={showPassword ? "text" : "password"}
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
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
              </div>

              {/* Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                >
                  {loading ? "Mendaftar..." : "Register"}
                </button>
              </div>

              {message && (
                <p className="text-center text-sm mt-3 text-gray-700 dark:text-gray-300">
                  {message}
                </p>
              )}
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Sudah Punya Akun?{" "}
              <Link
                to="/"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
