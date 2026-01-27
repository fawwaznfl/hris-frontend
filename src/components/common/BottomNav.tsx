import { Home, Clock, User, History, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import absenIcon from "../../icons/absen.png";

export default function BottomNav() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const today = new Date().toISOString().slice(0, 10);

  const pegawai_id = user?.id;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">

      {/* FLOATING ABSENSI */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-6">
        <button
          onClick={() => navigate(`/absensi/pegawai/${pegawai_id}?tanggal=${today}`) }
          className="w-16 h-16 rounded-full bg-indigo-600 text-white 
          flex items-center justify-center shadow-xl 
          hover:bg-indigo-700 transition"
        >
          <img
            src={absenIcon}
            alt="Absensi"
            className="w-8 h-8 object-contain"
          />
        </button>
      </div>

      {/* BOTTOM NAV */}
      <div className="bg-white shadow-lg py-3 border-t rounded-t-3xl px-8 flex items-center justify-between">

        {/* LEFT SIDE */}
        <div className="flex gap-8">
          <div
            onClick={() => navigate("/home-pegawai")}
            className="flex flex-col items-center text-indigo-600 cursor-pointer"
          >
            <Home className="w-6 h-6" />
            <p className="text-xs">Home</p>
          </div>

          <div
            onClick={() => pegawai_id && navigate(`/history-absen/${pegawai_id}`)}
            className="flex flex-col items-center text-gray-500 cursor-pointer"
          >
            <History className="w-6 h-6" />
            <p className="text-xs">History</p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex gap-8">
          <div
            onClick={() => navigate(`/shift-mapping/self/${pegawai_id}`)}
            className="flex flex-col items-center text-gray-500 cursor-pointer"
          >
            <Clock className="w-6 h-6" />
            <p className="text-xs">Dinas Luar</p>
          </div>

          <div
            onClick={() => navigate("/my-profile-pegawai/:id")}
            className="flex flex-col items-center text-gray-500 cursor-pointer"
          >
            <User className="w-6 h-6" />
            <p className="text-xs">Profile</p>
          </div>
        </div>

      </div>
    </div>
  );
}
