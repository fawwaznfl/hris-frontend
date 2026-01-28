import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ArrowLeft, Grid, Search } from "lucide-react";
import BottomNav from "../../../components/common/BottomNav";

interface Absen {
  id: number;
  tanggal_lembur: string;
  jam_mulai: string | null;
  jam_selesai: string | null;
  status: string;
}

export default function HistoryLemburPegawai() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const pegawai_id = user.dashboard_type === "pegawai" ? user.id : Number(id);

  const [absen, setAbsen] = useState<Absen[]>([]);
  const [pegawai, setPegawai] = useState<any>(null);

  const formatTime = (time?: string | null) =>
    time ? time.slice(0, 5).replace(":", ".") : "-";

  const formatStatus = (status: string) => {
    switch (status) {
      case "menunggu":
        return "text-green-600";
      case "disetujui":
        return "text-yellow-600";
      case "ditolak":
        return "text-blue-600";
    }
  };

  // ================= FETCH =================
  const fetchPegawai = async () => {
    if (user.dashboard_type === "pegawai") {
      setPegawai(user);
    } else {
      const res = await api.get(`/pegawai/${pegawai_id}`);
      setPegawai(res.data.data);
    }
  };

  const fetchHistoryAbsen = async () => {
    const url =
      user.dashboard_type === "pegawai"
        ? `/lembur/by-pegawai/${user.id}`
        : `/lembur/by-pegawai/${pegawai_id}`;

    const res = await api.get(url);
    setAbsen(res.data.data ?? []);
  };

  useEffect(() => {
    fetchPegawai();
    fetchHistoryAbsen();
  }, [pegawai_id]);

  const renderStatusBadge = (status: string) => {
    const base =
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize";
    switch (status) {
      case "menunggu":
        return <span className={`${base} bg-yellow-100 text-yellow-700`}>Menunggu</span>;
      case "disetujui":
        return <span className={`${base} bg-blue-100 text-blue-700`}>disetujui</span>;
      case "ditolak":
        return <span className={`${base} bg-red-100 text-red-700`}>ditolak</span>;
      case "sudah_masuk":
        return (
          <span className={`${base} bg-purple-100 text-purple-700`}>
            Sudah Masuk
          </span>
        );
      case "sudah_pulang":
        return (
          <span className={`${base} bg-green-100 text-green-700`}>
            Sudah Pulang
          </span>
        );
      default:
        return (
          <span className={`${base} bg-gray-100 text-gray-600`}>
            {status.replace("_", " ")}
          </span>
        );
    }
  };

  const filteredAbsen = absen.filter((a) => {
    const tanggal = new Date(a.tanggal_lembur);

    const matchFrom = !fromDate || tanggal >= fromDate;
    const matchTo = !toDate || tanggal <= toDate;

    return matchFrom && matchTo;
  });

  // USER INTERFACE
  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* ================= HEADER ================= */}
      <div className="relative">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 pb-10 rounded-b-[32px] shadow-lg pt-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/home-pegawai")}
              className="p-2 mr-2 opacity-90"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 text-center">
              <h1 className="text-lg font-semibold">History Lembur {pegawai?.name || ""} </h1>
            </div>

            <button className="p-2 opacity-90">
              <Grid className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= FILTER CARD ================= */}
        <div className="mx-5 -mt-10">
          <div className="bg-white p-4 rounded-2xl shadow-lg border">
            <div className="flex gap-3 items-center">
              <DatePicker
                selected={fromDate}
                onChange={(date: Date | null) => setFromDate(date)}
                dateFormat="yyyy-MM-dd"
                placeholderText="Dari Tanggal"
                className="flex-1 border rounded-lg px-3 py-2 text-sm bg-gray-50"
              />

              <DatePicker
                selected={toDate}
                onChange={(date: Date | null) => setToDate(date)}
                dateFormat="yyyy-MM-dd"
                placeholderText="Sampai"
                className="flex-1 border rounded-lg px-3 py-2 text-sm bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="px-5 mt-5">
        {/* ================= TABLE CARD ================= */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-medium text-gray-800">
              History Lembur
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500">
                <tr>
                  <th className="p-3">No</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Jam Masuk</th>
                  <th className="p-3">Jam Pulang</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAbsen.map((a, i) => (
                  <tr key={a.id} className="border-b">
                    <td className="p-3 text-center">{i + 1}</td>
                    <td className="p-3 text-center">{a.tanggal_lembur}</td>
                    <td className="p-3 text-center">{formatTime(a.jam_mulai)}</td>
                    <td className="p-3 text-center">{formatTime(a.jam_selesai)}</td>
                    <td className="p-3 text-center">
                      {renderStatusBadge(a.status)}
                    </td>
                  </tr>
                ))}

                {filteredAbsen.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-6 text-gray-400">
                      Tidak ada history absen
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
