import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ArrowLeft, Grid, Trash2, Edit, Eye } from "lucide-react";
import BottomNav from "../../../components/common/BottomNav";
import Swal from "sweetalert2";

interface LaporanKerja {
  id: number;
  informasi_umum: string;
  tanggal_laporan: string;
  keterangan?: string;
  file_url?: string | null;
}

export default function LaporanKerjaPegawai() {
  const navigate = useNavigate();
  const [laporan, setLaporan] = useState<LaporanKerja[]>([]);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [search, setSearch] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const pegawai_id = user.id;

  // ================= FETCH =================
  const fetchLaporan = async () => {
    const res = await api.get(`/laporan-kerja/by-pegawai/${pegawai_id}`);
    setLaporan(res.data.data ?? []);
  };

  useEffect(() => {
    fetchLaporan();
  }, []);

  // ================= FILTER =================
  const filteredLaporan = laporan.filter((l) => {
    const tanggal = new Date(l.tanggal_laporan);

    const matchFrom = !fromDate || tanggal >= fromDate;
    const matchTo = !toDate || tanggal <= toDate;

    const matchSearch =
      !search ||
      l.informasi_umum.toLowerCase().includes(search.toLowerCase());


    return matchFrom && matchTo && matchSearch;
  });

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Hapus laporan?",
      text: "Laporan tidak bisa dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    await api.delete(`/laporan-kerja/${id}`);
    setLaporan((prev) => prev.filter((l) => l.id !== id));

    Swal.fire("Terhapus", "Laporan kerja berhasil dihapus", "success");
  };

  const handleViewFile = (url?: string | null) => {
    if (!url) {
      Swal.fire("File tidak ditemukan", "", "warning");
      return;
    }
    window.open(url, "_blank");
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* HEADER */}
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
              <h1 className="text-lg font-semibold">Laporan Kerja</h1>
            </div>

            <button className="p-2 opacity-90">
              <Grid className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FILTER */}
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

            <div className="flex gap-3 items-center mt-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari judul laporan..."
                className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-5 mt-5">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate("/add-laporan-kerja-pegawai")}
            className="bg-indigo-600 text-white px-5 py-2 rounded-full shadow-md"
          >
            + Laporan
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-4 py-3 border-b">
            <p className="
                  font-semibold text-gray-800
                  text-base sm:text-lg md:text-xl
                ">
                  Daftar Laporan Kerja
                </p>
            <p className="text-xs text-gray-500">
              Riwayat laporan kerja pegawai
            </p>
          </div>

          <div className="divide-y">
          {filteredLaporan.map((l) => (
            <div
              key={l.id}
              onClick={() => navigate(`/laporan-kerja/${l.id}`)}
              className="
                px-4 py-4 flex justify-between gap-4
                hover:bg-gray-50 cursor-pointer
              "
            >
              {/* LEFT */}
              <div className="flex-1">
                <p className="
                  font-semibold text-gray-800
                  text-base sm:text-lg md:text-xl
                ">
                  Laporan
                </p>

                <p className="
                  mt-1 text-gray-700
                  text-sm sm:text-base md:text-lg
                  line-clamp-2
                ">
                  {l.informasi_umum}
                </p>
              </div>

              {/* RIGHT */}
              <div className="
                text-gray-500 whitespace-nowrap
                text-xs sm:text-sm md:text-base
              ">
                {new Date(l.tanggal_laporan).toLocaleDateString("id-ID")}
              </div>
            </div>
          ))}

          {filteredLaporan.length === 0 && (
            <div className="p-6 text-center text-gray-400">
              Tidak ada laporan
            </div>
          )}
        </div>



        </div>
      </div>

      <BottomNav />
    </div>
  );
}
