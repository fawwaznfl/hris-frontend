import { useEffect, useState } from "react";
import { Home, Clock, User, History, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import salaryIcon from "../../../icons/salary.png";
import refundIcon from "../../../icons/refund.png";
import kasbonIcon from "../../../icons/kasbon.png";
import { Bell, Grid } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import BottomNav from "../../../components/common/BottomNav";
import PegawaiSidebar from "../../../components/common/PegawaiSidebar";
import passportIcon from "../../../icons/passport.png";
import absenIcon from "../../../icons/qr.png";
import lemburIcon from "../../../icons/overtime.png";
import cutiIcon from "../../../icons/wifi.png";
import assignIcon from "../../../icons/assign.png";
import historylemburIcon from "../../../icons/suitcase.png";
import otherIcon from "../../../icons/other.png";
import meetingIcon from "../../../icons/meeting.png";
import Swal from "sweetalert2";


type LayananItem = {
  label: string;
  link: string;
  icon?: LucideIcon; 
  img?: string;      
};

export default function PegawaiHome() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const pegawai_id = user.id;
  const lokasiName = user.nama_lokasi || "-";
  
  // hitung total keuangan
  const [totalKasbon, setTotalKasbon] = useState(0);
  const [totalReimbursement, setTotalReimbursement] = useState(0);

  const [shiftTime, setShiftTime] = useState("Loading...");
  const [openSidebar, setOpenSidebar] = useState(false);
  const [notifCount, setNotifCount] = useState(3); 
  const [berita, setBerita] = useState<any[]>([]);

  // CEK FACE REGISTRATION SAAT PERTAMA LOAD
  useEffect(() => {
    const faceRegistered = localStorage.getItem("face_registered");

    // Jika belum terdaftar dan belum pernah ditampilkan alert
    if (faceRegistered === "false") {
      // Hapus flag agar tidak muncul lagi setelah ini
      localStorage.removeItem("face_registered");

      // Tampilkan SweetAlert
      Swal.fire({
        icon: "warning",
        title: "Face Recognition Belum Terdaftar",
        text: "Untuk keamanan absensi, silakan daftarkan wajah Anda terlebih dahulu",
        confirmButtonText: "Daftar Sekarang",
        confirmButtonColor: "#4f46e5",
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(`/face-recog-regis/${pegawai_id}`);
        }
      });
    }
  }, []);

  // === GET SHIFT TODAY ===
  const fetchShiftToday = async () => {
    try {
      const res = await api.get(`/shift-mapping/today/${pegawai_id}`);

      if (res.data.data?.shift) {
        const shift = res.data.data.shift;
        setShiftTime(`${shift.jam_masuk} - ${shift.jam_pulang}`);
      } else {
        setShiftTime("Belum Ada Shift");
      }
    } catch {
      setShiftTime("Belum Ada Shift");
    }
  };

  const fetchTotalKasbon = async () => {
    try {
      const res = await api.get("/kasbon");

      const data = res.data.data || [];

      const total = data
        .filter((it: any) =>
          ["pending", "approve", "reject"].includes(it.status)
        )
        .reduce((sum: number, it: any) => {
          return sum + Number(it.nominal || 0);
        }, 0);

      setTotalKasbon(total);
    } catch (err) {
      console.error("Gagal hitung kasbon", err);
      setTotalKasbon(0);
    }
  };

  const fetchTotalReimbursement = async () => {
    try {
      const res = await api.get("/reimbursement");

      const data = res.data.data || [];

      const total = data
      .filter((it: any) =>
        ["pending", "approve"].includes(it.status?.toLowerCase())
      )
      .reduce((sum: number, it: any) => {
        return sum + Number(it.terpakai || 0);
      }, 0);


      setTotalReimbursement(total);
    } catch (err) {
      console.error("Gagal hitung reimbursement", err);
      setTotalReimbursement(0);
    }
  };

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  const fetchBerita = async () => {
    try {
      const res = await api.get("/berita", {
        params: {
          company_id: user.company_id,
        },
      });
      setBerita(res.data.data || []);
    } catch (err) {
      console.error("Gagal ambil berita", err);
    }
  };


  useEffect(() => {
    fetchShiftToday();
    fetchTotalKasbon();
    fetchTotalReimbursement();
    fetchBerita();
  }, []);

  //console.log("USER LS:", user);

  // USER INTERFACE
  return (
    <div className="min-h-screen bg-gray-100 pb-28">

      {/* ================= HEADER ================= */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-b-[32px] shadow-xl">
        <div className="flex items-center justify-between">

          {/* KIRI: PROFIL */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-white/20 flex items-center justify-center shadow-md">
              {user.foto_karyawan ? (
                <img src={user.foto_karyawan} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 opacity-90" />
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold">{user?.name}</h2>
              <p className="text-sm opacity-90">{user?.nama_divisi}</p>
            </div>
          </div>

          {/* KANAN: NOTIF + MENU */}
          <div className="flex items-center gap-4">

            {/* NOTIFIKASI */}
              <button
                onClick={() => navigate("/notification")}
                className="relative"
              >
                <Bell className="w-6 h-6" />

                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                )}
              </button>

            {/* TITIK 4 */}
            <button onClick={() => setOpenSidebar(true)}>
              <Grid className="w-6 h-6" />
            </button>

          </div>
        </div>
      </div>


      {/* ================= SHIFT INFO CARD ================= */}
      <div className="mx-5 -mt-5 bg-white p-5 rounded-3xl shadow-lg">

        <div className="flex justify-between items-start">
          <div>
          <p className="text-xs text-gray-500">Cabang</p>
          <p className="text-xs md:text-sm font-semibold text-gray-900 mt-1">
            {lokasiName}
          </p>
        </div>


          <div className="text-right">
            <p className="text-xs text-gray-500">Jam Kerja</p>
            <p className="font-semibold text-gray-800 text-sm md:text-lg">
              {shiftTime}
            </p>
          </div>
        </div>
        <div className="my-4 border-t border-gray-200"></div>

        {/* 3 Service Menu */}
        <div className="grid grid-cols-3 text-center">
          {[
            { img: salaryIcon, label: "Payroll", link: "/payroll-pegawai"},
            { img: refundIcon, label: "Reimbursement", value: formatRupiah(totalReimbursement), link: "/reimbursement-pegawai",},
            {img: kasbonIcon, label: "Kasbon", value: formatRupiah(totalKasbon),link: "/kasbon-pegawai",},
          ].map((item, i) => (
            <div
              key={i}
              onClick={() => item.link && navigate(item.link)}
              className="flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition"
            >
              <img src={item.img} className="w-10 h-10" alt="" />
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="text-sm text-green-600">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ================= LAYANAN (GRID) ================= */}
      <div className="px-5 mt-8">
        <h3 className="font-semibold text-gray-800 mb-4 text-lg">Layanan</h3>

        <div className="grid grid-cols-4 gap-4 text-center">
          {[
            { label: "Absensi", img: absenIcon, link: `/shift-mapping/self/${pegawai_id}` },
            { label: "Cuti & Izin", img: cutiIcon, link: "/cuti-izin" },
            { label: "Dinas Luar", img: passportIcon, link: `/dinas-luar/self/${pegawai_id}` },
            { label: "Lembur", img: lemburIcon, link: `/absensi-lembur/pegawai/${pegawai_id}` },
            { label: "Rapat", img: meetingIcon, link: "/rapat-pegawai" }, 
            { label: "Penugasan", img: assignIcon, link: "/penugasan-pegawai" },
            { label: "History Lembur", img: historylemburIcon, link: `/history-lembur/${pegawai_id}` },
            { label: "Other", img: otherIcon, link: "/other" },
          ].map((m, i) => (
            <div
              key={i}
              onClick={() => m.link && navigate(m.link)}
              className="flex flex-col items-center gap-2 cursor-pointer"
            >
              <div className="w-16 h-16 bg-white shadow-md rounded-2xl flex items-center justify-center hover:shadow-lg transition-all active:scale-95">
                <img src={m.img} alt={m.label} className="w-7 h-7" />
              </div>
              <p className="text-xs font-medium text-gray-700">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ================= BERITA ================= */}
      <div className="px-5 mt-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800 text-lg">Berita</h3>
          <button
            onClick={() => navigate("/berita/pegawai")}
            className="text-indigo-600 text-sm font-medium"
          >
            Lihat Semua
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {berita.map((b) => (
            <div
              key={b.id}
              onClick={() => navigate(`/berita/${b.id}`)}
              className="min-w-[220px] h-32 rounded-xl shadow-md overflow-hidden cursor-pointer relative group"
            >
              {/* GAMBAR */}
              <img
                src={`http://localhost:8000/storage/${b.gambar}`}
                alt={b.judul}
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-black/40 flex items-end p-3">
                <p className="text-white text-sm font-semibold line-clamp-2">
                  {b.judul}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ================= BOTTOM NAV ================= */}
      <BottomNav />
      {/* ================= SIDEBAR ================= */}
      <PegawaiSidebar
        open={openSidebar}
        onClose={() => setOpenSidebar(false)}
      />
    </div>
  );
}
