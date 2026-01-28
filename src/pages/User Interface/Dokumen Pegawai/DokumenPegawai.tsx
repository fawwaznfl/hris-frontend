import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ArrowLeft, Grid, Trash2, Edit, Eye } from "lucide-react";
import BottomNav from "../../../components/common/BottomNav";
import Swal from "sweetalert2";


interface Dokumen {
  id: number;
  nama_dokumen: string;
  tanggal_upload: string;
  catatan?: string;
  created_at: string;
  file_url?: string | null;
}

export default function DokumenPegawai() {
  const navigate = useNavigate();
  const [dokumen, setDokumen] = useState<Dokumen[]>([]);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [search, setSearch] = useState("");


  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const pegawai_id = user.id;

  // ================= FETCH =================
  const fetchDokumen = async () => {
    const res = await api.get(`/dokumen-pegawai/by-pegawai/${pegawai_id}`);
    setDokumen(res.data.data ?? []);
  };

  useEffect(() => {
    fetchDokumen();
  }, []);

  // ================= FILTER =================
  const filteredDokumen = dokumen.filter((d) => {
  const tanggal = new Date(d.tanggal_upload);

  const matchFrom = !fromDate || tanggal >= fromDate;
  const matchTo = !toDate || tanggal <= toDate;

  const matchSearch =
    !search ||
    d.nama_dokumen.toLowerCase().includes(search.toLowerCase());

  return matchFrom && matchTo && matchSearch;
});


  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Hapus dokumen?",
      text: "Dokumen tidak bisa dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    await api.delete(`/dokumen-pegawai/${id}`);
    setDokumen((prev) => prev.filter((d) => d.id !== id));

    Swal.fire("Terhapus", "Dokumen berhasil dihapus", "success");
  };

  const handleViewFile = (url?: string | null) => {
    if (!url) {
      Swal.fire("File tidak ditemukan", "", "warning");
      return;
    }
    window.open(url, "_blank");
  };

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
              <h1 className="text-lg font-semibold">Dokumen Pegawai</h1>
            </div>

            <button className="p-2 opacity-90">
              <Grid className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= FILTER ================= */}
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
                placeholder="Cari nama dokumen..."
                className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="px-5 mt-5">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate("/add-dokumen-pegawai")}
            className="bg-indigo-600 text-white px-5 py-2 rounded-full shadow-md"
          >
            + Dokumen
          </button>
        </div>
      
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-medium text-gray-800">
              Daftar Dokumen
            </p>
            <p className="text-xs text-gray-400">
              Daftar Dokumen yang pernah diupload
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500">
                <tr>
                  <th className="p-3 text-center">No</th>
                  <th className="p-3 text-center">Dokumen</th>
                  <th className="p-3 text-center">Tanggal</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredDokumen.map((d, i) => (
                  <tr key={d.id} className="border-b">
                    <td className="p-3 text-center">{i + 1}</td>
                    <td className="p-3 text-center font-medium">
                      {d.nama_dokumen}
                    </td>
                    <td className="p-3 text-center">
                      {new Date(d.tanggal_upload).toLocaleDateString("id-ID")}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-3">
                        {d.file_url && (
                          <button
                            onClick={() => handleViewFile(d.file_url)}
                            className="text-emerald-600"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/edit-dokumen-pegawai/${d.id}`)}
                          className="text-blue-600"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(d.id)}
                          className="text-red-600"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </td>
                  </tr>
                ))}

                {filteredDokumen.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center p-6 text-gray-400"
                    >
                      Tidak ada dokumen
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
