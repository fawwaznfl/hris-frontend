import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Pencil, Trash2 } from "lucide-react";
import api from "../../../api/axios";
import { ArrowLeft, Search, Grid } from "lucide-react";
import BottomNav from "../../../components/common/BottomNav";
import Swal from "sweetalert2";

export default function InventoryPegawai() {
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [query, setQuery] = useState("");

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH =================
  const fetchInventory = async () => {
    try {
      const res = await api.get("/inventory");
      setItems(res.data.data || []);
    } catch (err) {
      console.error("Error fetch inventory", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // ================= FILTER =================
  const filtered = items.filter((it) => {
    const tanggal = new Date(it.tanggal_terima);

    const matchQuery =
      query === "" ||
      it.nama_barang?.toLowerCase().includes(query.toLowerCase()) ||
      it.kode_barang?.toLowerCase().includes(query.toLowerCase()) ||
      it.kategori?.toLowerCase().includes(query.toLowerCase());

    const matchFrom = !fromDate || tanggal >= fromDate;
    const matchTo = !toDate || tanggal <= toDate;

    return matchQuery && matchFrom && matchTo;
  });

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data inventory akan dihapus!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/inventory/${id}`);
          setItems(items.filter((item) => item.id !== id));

          Swal.fire({
            icon: "success",
            title: "Terhapus",
            text: "Inventory berhasil dihapus",
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
              <h1 className="text-lg font-semibold">Inventory Pegawai</h1>
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
          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="px-5 mt-5">
        {/* TOP BUTTON */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate("/add-inventory-pegawai")}
            className="bg-indigo-600 text-white px-5 py-2 rounded-full shadow-md"
          >
            + Tambah Inventory
          </button>
        </div>

        {/* ================= TABLE ================= */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-medium text-gray-800">
              Daftar Inventory
            </p>
            <p className="text-xs text-gray-400">
              Barang yang dimiliki pegawai
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">No</th>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-left">Nama Barang</th>
                  <th className="px-4 py-3 text-left">Kode</th>
                  <th className="px-4 py-3 text-left">Stok</th>
                  <th className="px-4 py-3 text-left">Satuan</th>
                  <th className="px-4 py-3 text-left">Keterangan</th>
                  <th className="px-4 py-3 text-left">Lokasi</th>
                  <th className="px-4 py-3 text-left">Divisi</th>
                  <th className="px-4 py-3 text-left">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center px-6 py-10 text-gray-400">
                      Tidak ada data inventory
                    </td>
                  </tr>
                ) : (
                  filtered.map((it, idx) => (
                    <tr key={it.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">{idx + 1}</td>
                      <td className="px-4 py-3">
                        {new Date(it.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3 font-medium">{it.nama_barang}</td>
                      <td className="px-4 py-3">{it.kode_barang}</td>
                      <td className="px-4 py-3">{it.stok ?? "-"}</td>
                      <td className="px-4 py-3">{it.satuan ?? "-"}</td>
                      <td className="px-4 py-3 text-xs">{it.keterangan ?? "-"}</td>
                      <td className="px-4 py-3 text-xs">{it.lokasi?.nama_lokasi ?? "-"}</td>
                      <td className="px-4 py-3 text-xs">{it.divisi?.nama ?? "-"}</td>

                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          <button
                            onClick={() =>
                              navigate(`/edit-inventory-pegawai/${it.id}`)
                            }
                            className="text-blue-600"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(it.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
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
