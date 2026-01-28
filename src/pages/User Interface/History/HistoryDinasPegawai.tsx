import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ArrowLeft, Grid } from "lucide-react";
import BottomNav from "../../../components/common/BottomNav";


interface Absen {
  id: number;
  tanggal: string;
  jam_masuk: string | null;
  jam_pulang: string | null;
  status_absen: string;
}

export default function HistoryDinasPegawai() {
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
      case "dinas_luar":
        return "text-green-600";
      case "izin":
        return "text-yellow-600";
      case "sakit":
        return "text-blue-600";
      case "alpha":
        return "text-red-600";
      default:
        return "text-gray-500";
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
        ? `/dinas-luar/by-pegawai/${user.id}`
        : `/dinas-luar/by-pegawai/${pegawai_id}`;

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
      case "dinas_luar":
        return <span className={`${base} bg-green-100 text-green-700`}>Hadir</span>;
      case "izin":
        return <span className={`${base} bg-yellow-100 text-yellow-700`}>Izin</span>;
      case "sakit":
        return <span className={`${base} bg-blue-100 text-blue-700`}>Sakit</span>;
      case "alpha":
        return <span className={`${base} bg-red-100 text-red-700`}>Alpha</span>;
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
    const tanggal = new Date(a.tanggal);

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
              <h1 className="text-lg font-semibold">History Dinas {pegawai?.name || ""} </h1>
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
                    <td className="p-3 text-center">{a.tanggal}</td>
                    <td className="p-3 text-center">{formatTime(a.jam_masuk)}</td>
                    <td className="p-3 text-center">{formatTime(a.jam_pulang)}</td>
                    <td className="p-3 text-center">
                      {renderStatusBadge(a.status_absen)}
                    </td>
                  </tr>
                ))}

                {filteredAbsen.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-6 text-gray-400">
                      Tidak ada history dinas
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
