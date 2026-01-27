import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Pencil, Trash2, Eye } from "lucide-react";

import api from "../../../api/axios";

import {
  ArrowLeft,
  Search,
  Grid,
} from "lucide-react";
import BottomNav from "../../../components/common/BottomNav";
import Swal from "sweetalert2";

export default function ReimbursementPegawai() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [query, setQuery] = useState("");

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);


  // ================= FETCH =================
  const fetchReimbursementPegawai = async () => {
    try {
      const res = await api.get(`/reimbursement`);
      setItems(res.data.data || []);
    } catch (err) {
      console.error("Error fetch reimbursements pegawai", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReimbursementPegawai();
  }, []);

  // ================= FILTER =================
  const filtered = items.filter((it) => {
    const tanggal = new Date(it.tanggal);

    const matchQuery =
      query === "" ||
      it.event?.toLowerCase().includes(query.toLowerCase()) ||
      it.kategori?.nama?.toLowerCase().includes(query.toLowerCase());

    const matchFrom = !fromDate || tanggal >= fromDate;
    const matchTo = !toDate || tanggal <= toDate;

    return matchQuery && matchFrom && matchTo;
  });

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data reimbursement akan dihapus dan tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/reimbursement/${id}`);

          setItems(items.filter((item) => item.id !== id));

          Swal.fire({
            icon: "success",
            title: "Terhapus!",
            text: "Reimbursement berhasil dihapus.",
            timer: 1300,
            showConfirmButton: false,
          });
        } catch (err) {
          console.error("Error delete reimbursement:", err);

          Swal.fire({
            icon: "error",
            title: "Gagal",
            text: "Terjadi error saat menghapus data",
          });
        }
      }
    });
  };

  const renderStatus = (status: string) => {
    const baseClass =
      "px-3 py-1 rounded-full text-xs font-semibold inline-block capitalize";

    const normalizedStatus = status?.toLowerCase().trim();

    switch (normalizedStatus) {
      case "approved":
      case "approve":
        return (
          <span className={`${baseClass} bg-green-100 text-green-700`}>
            Approved
          </span>
        );

      case "rejected":
      case "reject":
        return (
          <span className={`${baseClass} bg-red-100 text-red-700`}>
            Rejected
          </span>
        );

      case "pending":
      default:
        return (
          <span className={`${baseClass} bg-yellow-100 text-yellow-700`}>
            Pending
          </span>
        );
    }
  };

  const renderMetode = (metode: string) => {
    if (metode === "transfer") {
      return (
        <span className="mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700">
          Transfer
        </span>
      );
    }

    return (
      <span className="mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-700">
        Cash
      </span>
    );
  };

  // User Interface

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* ================= HEADER ================= */}
      <div className="relative">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 pb-10 rounded-b-[32px] shadow-lg pt-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/home-pegawai")}
              className="p-2 rounded-md mr-2 opacity-90"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 text-center">
              <h1 className="text-lg font-semibold">Reimbursement</h1>
            </div>

            <button className="p-2 rounded-md opacity-90">
              <Grid className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= FILTER CARD ================= */}
        <div className="mx-5 -mt-10">
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex gap-3 items-center">

              {/* FROM DATE */}
              <DatePicker
                selected={fromDate}
                onChange={(date) => setFromDate(date)}
                dateFormat="yyyy-MM-dd"
                placeholderText="Tanggal Mulai"
                className="flex-1 border rounded-lg px-3 py-2 text-sm bg-gray-50 w-full"
              />

              {/* TO DATE */}
              <DatePicker
                selected={toDate}
                onChange={(date) => setToDate(date)}
                dateFormat="yyyy-MM-dd"
                placeholderText="Tanggal Selesai"
                className="flex-1 border rounded-lg px-3 py-2 text-sm bg-gray-50 w-full"
              />

              {/* SEARCH */}
              <button
                onClick={() => setQuery("")}
                className="w-11 h-11 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center shadow-sm"
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
            onClick={() => navigate("/add-reimbursement-pegawai")}
            className="bg-indigo-600 text-white px-5 py-2 rounded-full shadow-md hover:bg-indigo-700 transition active:scale-95"
          >
            + Tambah
          </button>

          <div className="text-xs text-gray-500"></div>
        </div>

        {/* ================= TABLE CARD ================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-800">
              Daftar Reimbursement
            </p>
            <p className="text-xs text-gray-400">
              Riwayat pengajuan reimbursement
            </p>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Terpakai</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Sisa</th>
                <th className="px-4 py-3">Metode</th>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className="text-center px-6 py-10 text-gray-400 text-sm"
                  >
                    Tidak ada data reimbursement
                  </td>
                </tr>
              ) : (
                filtered.map((it, idx) => {
                  const total = Number(it.total);
                  const terpakai = Number(it.terpakai ?? 0);
                  const sisa = Number(it.total) - Number(it.terpakai ?? 0);

                  return (
                    <tr
                      key={idx}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{idx + 1}</td>
                      <td className="px-4 py-3">{it.tanggal}</td>
                      <td className="px-4 py-3">{it.event}</td>
                      <td className="px-4 py-3">{it.kategori?.nama}</td>
                      <td className="px-4 py-3">{renderStatus(it.status)}</td>

                      <td className="px-4 py-3">{formatRupiah(terpakai)}</td>
                      <td className="px-4 py-3">{formatRupiah(total)}</td>
                      <td className="px-4 py-3">{formatRupiah(sisa)}</td>
                      <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {/* Badge metode */}
                        {renderMetode(it.metode_reim)}

                        {/* Nomor rekening (jika transfer) */}
                        {it.metode_reim === "transfer" && it.no_rekening && (
                          <span className="text-xs text-gray-500">
                            {it.no_rekening}
                          </span>
                        )}
                      </div>
                    </td>
                      <td className="px-4 py-3">
                        {it.file ? (
                          <button
                            onClick={() =>
                              window.open(
                                `http://localhost:8000/storage/${it.file}`,
                                "_blank"
                              )
                            }
                            className="text-indigo-600 hover:text-indigo-800 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3">
                      {it.status !== "approve" && it.status !== "approved" ? (
                        <div className="flex gap-3">
                          <button
                            onClick={() => navigate(`/edit-reimbursement-pegawai/${it.id}`)}
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
                      ) : (
                        <span className="text-xs text-gray-400">
                          Data sudah disetujui
                        </span>
                      )}
                    </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM NAV ================= */}
      <BottomNav />
    </div>
  );
}
