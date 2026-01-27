import { useNavigate } from "react-router-dom";
import passportIcon from "../../../icons/passport.png";
import absenIcon from "../../../icons/qr.png";
import lemburIcon from "../../../icons/overtime.png";
import cutiIcon from "../../../icons/wifi.png";
import historyabsenIcon from "../../../icons/technology.png";
import historydinasIcon from "../../../icons/destination.png";
import historylemburIcon from "../../../icons/suitcase.png";
import documentIcon from "../../../icons/folder.png";
import reimbursementIcon from "../../../icons/reimbursement.png";
import debtIcon from "../../../icons/debt.png";
import resetIcon from "../../../icons/reset-password.png";
import placeIcon from "../../../icons/place.png";
import assignIcon from "../../../icons/assign.png";
import meetingIcon from "../../../icons/meeting.png";
import inventoryIcon from "../../../icons/inventory.png";
import laporankerjaIcon from "../../../icons/result.png";
import profileIcon from "../../../icons/profile.png";
import logoutIcon from "../../../icons/log-out.png";
import FaceRecogIcon from "../../../icons/facerecog.png";
import Swal from "sweetalert2";


export default function AllMenuPegawai() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const pegawai_id = user.id;
  const lokasiName = user.nama_lokasi || "-";

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Anda akan keluar dari akun",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, logout",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        // 🔥 HAPUS SEMUA DATA LOGIN
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // kalau kamu pakai sessionStorage
        sessionStorage.clear();

        // 🔁 ARAHKAN KE LOGIN
        navigate("/");

        Swal.fire({
          icon: "success",
          title: "Logout berhasil",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  };


  const menus = [
    { label: "Absensi", img: absenIcon, link: `/shift-mapping/self/${pegawai_id}` },
    { label: "Cuti & Izin", img: cutiIcon, link: "/cuti-izin" },
    { label: "Dinas Luar", img: passportIcon, link: `/dinas-luar/self/${pegawai_id}` },
    { label: "Lembur", img: lemburIcon, link: `/absensi-lembur/pegawai/${pegawai_id}` },
    { label: "History Absen", img: historyabsenIcon, link: `/history-absen/${pegawai_id}` },
    { label: "History Lembur", img: historylemburIcon, link: `/history-lembur/${pegawai_id}` },
    { label: "History Dinas", img: historydinasIcon, link: `/history-dinas/${pegawai_id}` },
    { label: "Dokumen Pegawai", img: documentIcon, link: `/dokumen/${pegawai_id}` }, 
    { label: "Change Password", img: resetIcon, link: "/change-password-pegawai" }, 
    { label: "Payroll", img: debtIcon, link: "" }, // ini masih salah link nya 
    { label: "Reimbursement", img: reimbursementIcon, link: "/reimbursement-pegawai" }, 
    { label: "Kasbon", img: debtIcon, link: "/kasbon-pegawai" },
    { label: "Kunjungan", img: placeIcon, link: "/kunjungan-pegawai" }, 
    //{ label: "Kinerja Pegawai", img: saleIcon, link: "/laporan-kinerja-pegawai" }, // ini masih salah link nya 
    { label: "Penugasan", img: assignIcon, link: "/penugasan-pegawai" }, 
    { label: "Rapat", img: meetingIcon, link: "/rapat-pegawai" }, 
    { label: "Inventory", img: inventoryIcon, link: "/inventory-pegawai" }, 
    { label: "Laporan Kerja", img: laporankerjaIcon, link: "/laporan-kerja-pegawai" }, 
    { label: "Profile", img: profileIcon, link: "/my-profile-pegawai" }, 
    { label: "Logout", img: logoutIcon, link: "" },
    //{ label: "Face Recognition", img: FaceRecogIcon, link: "" },
     
    
  ];

  return (
    <>
        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 pb-12 rounded-b-[32px] shadow">
        <div className="flex items-center">
            <button
            onClick={() =>
              navigate(
                user.dashboard_type === "pegawai"
                  ? "/home-pegawai"
                  : "/pegawai"
              )
            }
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition"
          >
            <span className="text-xl font-semibold">←</span>
          </button>

            <h1 className="flex-1 text-center text-lg font-semibold tracking-wide">
            All Menu
            </h1>

            <div className="w-9" />
        </div>

        <p className="mt-4 text-sm text-white/80 text-center">
            Lokasi: <span className="font-medium">{lokasiName}</span>
        </p>
        </div>

        {/* CONTENT */}
        <div className="-mt-8 px-4 pb-6">
        <div className="bg-white rounded-3xl shadow-lg p-5">
            <div className="grid grid-cols-4 gap-y-6 gap-x-4 text-center">
            {menus.map((m, i) => (
                <div
                key={i}
                onClick={() => {
                  if (m.label === "Logout") {
                    handleLogout();
                  } else if (m.link) {
                    navigate(m.link);
                  }
                }}

                className="flex flex-col items-center gap-2 cursor-pointer group"
                >
                <div className="w-16 h-16 rounded-2xl bg-gray-50 shadow flex items-center justify-center
                                transition-all duration-200
                                group-hover:shadow-lg group-hover:-translate-y-1
                                active:scale-95">
                    <img
                    src={m.img}
                    alt={m.label}
                    className="w-7 h-7"
                    />
                </div>
                <p className="text-xs font-medium text-gray-700 leading-tight">
                    {m.label}
                </p>
                </div>
            ))}
            </div>
        </div>
        </div>
    </>
    );

}
