import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Briefcase } from "lucide-react";
import api from "../../../api/axios";
import BottomNav from "../../../components/common/BottomNav";
type TabType = "baru" | "proses" | "selesai";

interface Penugasan {
  id: number;
  judul_pekerjaan: string;
  status: "pending" | "process" | "finish";
  created_at: string;
  pegawai: {
    id: number;
    name: string;
    foto_karyawan?: string;
  };
}

export default function PenugasanPegawai() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>("baru");
  const [penugasan, setPenugasan] = useState<Penugasan[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";



  useEffect(() => {
    if (location.state?.tab) {
        setActiveTab(location.state.tab);
    }
    fetchPenugasan();
  }, []);


  const fetchPenugasan = async () => {
    try {
      const res = await api.get("/penugasan");
      setPenugasan(res.data.data);
    } catch (error) {
      console.error("Gagal mengambil penugasan:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTanggal = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
    };


  const filteredData = penugasan.filter((item) => {
    if (activeTab === "baru") return item.status === "pending";
    if (activeTab === "proses") return item.status === "process";
    if (activeTab === "selesai") return item.status === "finish";
    return false;
  });

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="text-[10px] md:text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
            Baru
          </span>
        );
      case "process":
        return (
          <span className="text-[10px] md:text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
            Proses
          </span>
        );
      case "finish":
        return (
          <span className="text-[10px] md:text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
            Selesai
          </span>
        );
      default:
        return null;
    }
  };

  // USER INTERFACE
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 rounded-b-3xl shadow">
        <div className="flex items-center">
          <button onClick={() => navigate("/home-pegawai")} className="mr-2">
            <ArrowLeft />
          </button>
          <h1 className="text-lg font-semibold text-center flex-1">
            Penugasan Kerja
          </h1>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white mt-3 mx-4 rounded-2xl shadow-sm">
        <div className="flex text-sm font-medium">
          {[
            { label: "Pekerjaan Baru", value: "baru" },
            { label: "Dalam Proses", value: "proses" },
            { label: "Pekerjaan Selesai", value: "selesai" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as TabType)}
              className={`flex-1 py-3 text-center relative transition
                ${
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
        {loading ? (
          <div className="text-center text-gray-400 mt-10 text-sm">
            Memuat penugasan...
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center text-gray-400 mt-10 text-sm">
            Tidak ada penugasan
          </div>
        ) : (
          filteredData.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/penugasan/${item.id}`)}
              className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3 cursor-pointer active:scale-[0.98] transition"
            >
              {item.pegawai?.foto_karyawan ? (
                <img
                    src={`${BASE_URL}/storage/${item.pegawai.foto_karyawan}`}
                    alt="Foto Pegawai"
                    className="w-11 h-11 rounded-xl object-cover shrink-0"
                />
                ) : (
                <div className="w-11 h-11 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                    <Briefcase size={20} />
                </div>
                )}

              <div className="flex-1">
                {/* Nama Pegawai */}
                <p className="text-sm md:text-base font-bold text-gray-900">
                    {item.pegawai?.name}
                </p>

                {/* Hari + tanggal */}
                <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                    {formatTanggal(item.created_at)}
                </p>

                {/* Judul pekerjaan */}
                <p className="mt-2 text-sm md:text-base text-gray-800 font-semibold leading-snug md:leading-relaxed">
                    {item.judul_pekerjaan}
                </p>
                </div>

              {renderStatusBadge(item.status)}
            </div>
          ))
        )}
      </div>
      <BottomNav />
    </div>
  );
}
