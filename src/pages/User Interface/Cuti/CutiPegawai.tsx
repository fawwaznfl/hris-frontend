import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Pencil, Trash2 } from "lucide-react";
import api from "../../../api/axios";
import { ArrowLeft, Search, Grid } from "lucide-react";
import BottomNav from "../../../components/common/BottomNav";
import Swal from "sweetalert2";

export default function CutiPegawai() {
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [query, setQuery] = useState("");

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH
  const fetchCutiPegawai = async () => {
    try {
      const res = await api.get("/cuti");
      setItems(res.data.data || []);
    } catch (err) {
      console.error("Error fetch cuti pegawai", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCutiPegawai();
  }, []);

  // FILTER
  const filtered = items.filter((it) => {
    const mulai = new Date(it.tanggal_mulai);

    const matchQuery =
      query === "" ||
      it.jenis_cuti?.toLowerCase().includes(query.toLowerCase()) ||
      it.alasan?.toLowerCase().includes(query.toLowerCase());

    const matchFrom = !fromDate || mulai >= fromDate;
    const matchTo = !toDate || mulai <= toDate;

    return matchQuery && matchFrom && matchTo;
  });

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Pengajuan cuti akan dihapus!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/cuti/${id}`);
          setItems(items.filter((item) => item.id !== id));

          Swal.fire({
            icon: "success",
            title: "Terhapus",
            text: "Pengajuan cuti berhasil dihapus",
            timer: 1300,
            showConfirmButton: false,
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Gagal",
            text: "Tidak bisa menghapus data",
          });
        }
      }
    });
  };

  // ================= STATUS BADGE =================
  const renderStatus = (status: string) => {
    const base =
      "px-3 py-1 rounded-full text-xs font-semibold inline-block capitalize";

    switch (status) {
      case "disetujui":
        return (
          <span className={`${base} bg-green-100 text-green-700`}>
            Disetujui
          </span>
        );
      case "ditolak":
        return (
          <span className={`${base} bg-red-100 text-red-700`}>
            Ditolak
          </span>
        );
      default:
        return (
          <span className={`${base} bg-yellow-100 text-yellow-700`}>
            Menunggu
          </span>
        );
    }
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
              <h1 className="text-lg font-semibold">Cuti Pegawai</h1>
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
                onChange={(date) => setFromDate(date)}
                dateFormat="yyyy-MM-dd"
                placeholderText="Dari Tanggal"
                className="flex-1 border rounded-lg px-3 py-2 text-sm bg-gray-50"
              />

              <DatePicker
                selected={toDate}
                onChange={(date) => setToDate(date)}
                dateFormat="yyyy-MM-dd"
                placeholderText="Sampai"
                className="flex-1 border rounded-lg px-3 py-2 text-sm bg-gray-50"
              />

              <button
                onClick={() => setQuery("")}
                className="w-11 h-11 rounded-lg bg-indigo-50 border flex items-center justify-center"
              >
                <Search className="w-5 h-5 text-indigo-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="px-5 mt-5">
        {/* TOP BUTTON */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate("/add-cuti-pegawai")}
            className="bg-indigo-600 text-white px-5 py-2 rounded-full shadow-md"
          >
            + Ajukan Cuti
          </button>
        </div>

        {/* ================= TABLE CARD ================= */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-medium text-gray-800">
              Riwayat Pengajuan Cuti
            </p>
            <p className="text-xs text-gray-400">
              Daftar cuti yang pernah diajukan
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">No</th>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-left">Jenis</th>
                  <th className="px-4 py-3 text-left">Alasan</th>
                  <th className="px-4 py-3 text-left">Status</th>                  
                  <th className="px-4 py-3 text-left">Foto</th>
                  <th className="px-4 py-3 text-left">Catatan</th>
                  <th className="px-4 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center px-6 py-10 text-gray-400"
                    >
                      Tidak ada data cuti
                    </td>
                  </tr>
                ) : (
                  filtered.map((it, idx) => {
                    const status = it.status?.toLowerCase();
                    const canEdit = status === "menunggu" || status === "ditolak";

                    return (
                      <tr key={it.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{idx + 1}</td>
                        <td className="px-4 py-3">
                          {it.tanggal_mulai} – {it.tanggal_selesai}
                        </td>
                        <td className="px-4 py-3 font-medium">{it.jenis_cuti}</td>
                        <td className="px-4 py-3">{it.alasan}</td>
                        <td className="px-4 py-3">{renderStatus(it.status)}</td>

                        <td className="px-4 py-3">
                          {it.foto ? (
                            <img
                              src={`http://localhost:8000/storage/${it.foto}`}
                              alt="Foto Cuti"
                              className="w-12 h-12 object-cover rounded-lg border"
                              onClick={() =>
                                Swal.fire({
                                  imageUrl: `http://localhost:8000/storage/${it.foto}`,
                                  showConfirmButton: false,
                                })
                              }
                            />
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {it.catatan ? (
                            <span className="text-xs text-gray-700">{it.catatan}</span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {canEdit ? (
                            <div className="flex gap-3">
                              <button
                                onClick={() => navigate(`/edit-cuti-pegawai/${it.id}`)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDelete(it.id)}
                                className="text-red-600 hover:text-red-800"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Tidak bisa diubah
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                  )
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
