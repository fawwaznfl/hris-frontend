import { X, LogOut, User, Lock, Bell, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PegawaiSidebar({ open, onClose }: Props) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!open) return null;

  const menu = [
    { label: "Profil Saya", icon: User, link: "/my-profile-pegawai/:id" },
    { label: "Notifikasi", icon: Bell, link: "/notifikasi" },
    { label: "Ubah Password", icon: Lock, link: "/change-password" },
    { label: "Pengaturan", icon: Settings, link: "/settings" },
  ];

  const handleLogout = async () => {
    const result = await Swal.fire({
        title: "Logout?",
        text: "Kamu akan keluar dari akun ini",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, Logout",
        cancelButtonText: "Batal",
        reverseButtons: true,
        confirmButtonColor: "#ef4444", 
        cancelButtonColor: "#9ca3af", 
    });

    if (result.isConfirmed) {
        localStorage.clear();

        Swal.fire({
        title: "Berhasil Logout",
        text: "Sampai jumpa 👋",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        });

        setTimeout(() => {
        navigate("/");
        }, 1500);
    }
    };


  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-40"
      />

      {/* SIDEBAR */}
      <div className="fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl rounded-l-3xl flex flex-col">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 rounded-bl-3xl">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                {user.foto_karyawan ? (
                  <img
                    src={user.foto_karyawan}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6" />
                )}
              </div>
              <div>
                <p className="font-semibold leading-tight">
                  {user.name || "Pegawai"}
                </p>
                <p className="text-xs opacity-80">
                  {user.nama_lokasi || ""}
                </p>
              </div>
            </div>

            <button onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MENU */}
        <div className="flex-1 p-4 space-y-2">
          {menu.map((m, i) => (
            <button
              key={i}
              onClick={() => {
                navigate(m.link);
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition text-gray-700"
            >
              <m.icon className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-medium">{m.label}</span>
            </button>
          ))}
        </div>

        {/* LOGOUT */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-semibold">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
