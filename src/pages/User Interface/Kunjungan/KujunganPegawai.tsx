import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../../api/axios";
import Swal from "sweetalert2";

import { ArrowLeft, Search, Grid } from "lucide-react";
import BottomNav from "../../../components/common/BottomNav";

export default function KunjunganPegawai() {
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH =================
  const fetchKunjungan = async () => {
    try {
      const res = await api.get("/kunjungan");
      setItems(res.data.data || []);
    } catch (err) {
      console.error("Error fetch kunjungan", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKunjungan();
  }, []);

  // ================= FILTER =================
  const filtered = items.filter((it) => {
    const tgl = new Date(it.created_at);
    const matchFrom = !fromDate || tgl >= fromDate;
    const matchTo = !toDate || tgl <= toDate;
    return matchFrom && matchTo;
  });

  const formatTanggal = (date: string) =>
    new Date(date).toLocaleString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
        berlangsung: "bg-blue-100 text-blue-700",
        selesai: "bg-green-100 text-green-700",
        batal: "bg-red-100 text-red-700",
    };

    return (
        <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            map[status] || "bg-gray-100 text-gray-600"
        }`}
        >
        {status}
        </span>
    );
    };

    const previewImage = (url: string) => {
    Swal.fire({
        imageUrl: url,
        imageAlt: "Lampiran",
        showConfirmButton: false,
        showCloseButton: true,
        background: "#fff",
    });
    };
    
    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Yakin?",
            text: "Data kunjungan akan dihapus!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Hapus",
            cancelButtonText: "Batal",
        });

        if (!result.isConfirmed) return;

        try {
            await api.delete(`/kunjungan/${id}`);
            setItems((prev) => prev.filter((i) => i.id !== id));

            Swal.fire("Berhasil", "Data kunjungan dihapus", "success");
        } catch (err) {
            Swal.fire("Gagal", "Tidak bisa menghapus data", "error");
        }
        };

  // USER INTERFACE
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
              <h1 className="text-lg font-semibold">Kunjungan</h1>
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
                onClick={() => {
                  setFromDate(null);
                  setToDate(null);
                }}
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
            onClick={() => navigate("/add-kunjungan-pegawai")}
            className="bg-indigo-600 text-white px-5 py-2 rounded-full shadow-md"
          >
            + Visit In
          </button>
        </div>

        {/* ================= TABLE ================= */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-medium text-gray-800">
              Riwayat Kunjungan
            </p>
            <p className="text-xs text-gray-400">
              Data visit in & visit out
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">No</th>
                  <th className="px-4 py-3 text-left">Visit In</th>
                  <th className="px-4 py-3 text-left">Visit Out</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                      Tidak ada data kunjungan
                    </td>
                  </tr>
                ) : (
                  filtered.map((it, idx) => (
                    <tr key={it.id} className="border-t align-top">
                      <td className="px-4 py-3">{idx + 1}</td>

                      {/* VISIT IN */}
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-800">
                            {formatTanggal(it.created_at)}
                          </p>
                          {it.keterangan && (
                            <p className="text-xs text-gray-600">
                              Keterangan: {it.keterangan}
                            </p>
                          )}
                          <div className="flex gap-3 text-xs pt-1">
                            {it.upload_foto && (
                              <button
                                onClick={() =>
                                  previewImage(
                                    `${import.meta.env.VITE_API_BASE_URL}/storage/${it.upload_foto}`
                                  )
                                }
                                className="text-blue-600"
                              >
                                📎 Lampiran
                              </button>
                            )}
                            {it.lokasi_masuk && (
                              <a
                                href={`https://www.google.com/maps?q=${it.lokasi_masuk}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600"
                              >
                                📍 Lokasi
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* VISIT OUT */}
                        <td className="px-4 py-3">
                        {it.foto_keluar ? (
                            // ================= SUDAH VISIT OUT =================
                            <div className="space-y-1">
                            <p className="font-medium text-gray-800">
                                {formatTanggal(it.updated_at)}
                            </p>

                            {it.keterangan_keluar && (
                                <p className="text-xs text-gray-600">
                                Keterangan: {it.keterangan_keluar}
                                </p>
                            )}

                            <div className="flex gap-3 text-xs pt-1">
                                {it.foto_keluar && (
                                <button
                                    onClick={() =>
                                    previewImage(
                                        `${import.meta.env.VITE_API_BASE_URL}/storage/${it.foto_keluar}`
                                    )
                                    }
                                    className="text-blue-600"
                                >
                                    📎 Lampiran
                                </button>
                                )}

                                {it.lokasi_keluar && (
                                <a
                                    href={`https://www.google.com/maps?q=${it.lokasi_keluar}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-600"
                                >
                                    📍 Lokasi
                                </a>
                                )}
                            </div>
                            </div>
                        ) : (
                            // ================= BELUM VISIT OUT =================
                            <div className="flex flex-col gap-2">
                            <span className="text-xs text-gray-400">
                                Belum Visit Out
                            </span>

                            <button
                                onClick={() => navigate(`/kunjungan-pegawai/visit-out/${it.id}`)}
                                className="
                                bg-orange-600 hover:bg-orange-700
                                text-white text-xs px-4 py-2
                                rounded-full shadow
                                self-start
                                "
                            >
                                Visit Out
                            </button>
                            </div>
                        )}
                        </td>

                        

                      <td className="px-4 py-3">
                        {statusBadge(it.status)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                            {/* DELETE */}
                            <button
                            onClick={() => handleDelete(it.id)}
                            className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                            >
                            🗑️ Hapus
                            </button>
                        </div>
                        </td>
                    </tr>
                  ))
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
