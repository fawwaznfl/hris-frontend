import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import BottomNav from "../../../components/common/BottomNav";

type TabType = "list" | "data";

interface PenilaianKinerja {
  id: number;
  judul_pekerjaan: string;
  nilai?: number;
  kategori?: string;
  catatan?: string;
  tanggal: string;
  pegawai: {
    id: number;
    name: string;
    foto_karyawan?: string;
  };
}

export default function LaporanKinerjaPegawai() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>("list");
  const [data, setData] = useState<PenilaianKinerja[]>([]);
  const [loading, setLoading] = useState(true);

  const [pegawai, setPegawai] = useState<{
  id: number;
  name: string;
  foto_karyawan?: string;
} | null>(null);

  /* ================= DUMMY DATA ================= */
  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user) {
      const parsedUser = JSON.parse(user);

      const pegawaiLogin = {
        id: parsedUser.id,
        name: parsedUser.name,
        foto_karyawan: parsedUser.foto_karyawan,
      };

      setPegawai(pegawaiLogin);

      setData([
        {
          id: 1,
          judul_pekerjaan: "Telat Presensi Masuk",
          nilai: -10,
          kategori: "Punishment",
          catatan: "Datang terlambat 15 menit",
          tanggal: "2025-12-30",
          pegawai: pegawaiLogin,
        },
        {
          id: 2,
          judul_pekerjaan: "Menyelesaikan Penugasan Kerja",
          nilai: 20,
          kategori: "Reward",
          catatan: "Tugas selesai tepat waktu",
          tanggal: "2025-12-23",
          pegawai: pegawaiLogin,
        },
      ]);

      setLoading(false);
    }
  }, []);



  /* ================= HELPER ================= */

  const formatTanggal = (date: string) =>
    new Date(date).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const totalSkor = data.reduce((sum, item) => sum + (item.nilai || 0), 0);

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 rounded-b-3xl shadow">
        <div className="flex items-center">
          <button onClick={() => navigate("/home-pegawai")} className="mr-2">
            <ArrowLeft />
          </button>
          <h1 className="text-lg font-semibold text-center flex-1">
            Laporan Kinerja
          </h1>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white mt-3 mx-4 rounded-2xl shadow-sm">
        <div className="flex text-sm font-medium">
          {[
            { label: "List Penilaian", value: "list" },
            { label: "Data Penilaian", value: "data" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as TabType)}
              className={`flex-1 py-3 relative ${
                activeTab === tab.value
                  ? "text-indigo-600"
                  : "text-gray-400"
              }`}
            >
              {tab.label}
              {activeTab === tab.value && (
                <span className="absolute bottom-0 left-6 right-6 h-[3px] bg-indigo-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-4">
      {/* ===== PROFILE (SELALU MUNCUL) ===== */}
      {pegawai && (
        <div className="flex flex-col items-center text-center mb-6">
          {pegawai.foto_karyawan ? (
            <img
              src={pegawai.foto_karyawan}
              alt={pegawai.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
              <Star size={40} className="text-gray-400" />
            </div>
          )}

          <h2 className="mt-4 font-bold text-lg text-gray-900">
            {pegawai.name}
          </h2>

          <p
            className={`mt-1 font-semibold ${
              totalSkor >= 0 ? "text-green-500" : "text-yellow-500"
            }`}
          >
            SKOR : {totalSkor}
          </p>
        </div>
      )}

      {/* ===== LIST PENILAIAN ===== */}
      {activeTab === "list" && (
        <div className="divide-y bg-white rounded-2xl shadow-sm">
          {data.map((item) => (
            <div
              key={item.id}
              className="py-4 px-4 flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-gray-900">
                  {item.judul_pekerjaan}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatTanggal(item.tanggal)}
                </p>
              </div>

              <span
                className={`min-w-[52px] text-center px-3 py-1 rounded-lg text-white font-semibold text-sm ${
                  (item.nilai || 0) > 0 ? "bg-blue-500" : "bg-red-500"
                }`}
              >
                {(item.nilai || 0) > 0 ? `+${item.nilai}` : item.nilai}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ===== DATA PENILAIAN ===== */}
      {activeTab === "data" &&
        (loading ? (
          <div className="text-center text-gray-400 mt-10 text-sm">
            Memuat data...
          </div>
        ) : (
          data.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 shadow-sm flex gap-3"
            >
              <div className="flex-1">
                <p className="font-bold text-gray-900">
                  {item.judul_pekerjaan}
                </p>
              </div>
            </div>
          ))
        ))}
    </div>


      <BottomNav />
    </div>
  );
}
