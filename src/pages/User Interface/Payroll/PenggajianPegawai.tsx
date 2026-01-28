import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ArrowLeft, Grid, FileDown } from "lucide-react";
import api from "../../../api/axios";
import BottomNav from "../../../components/common/BottomNav";

export default function PenggajianPegawai() {
  const navigate = useNavigate();
  const pegawai = JSON.parse(localStorage.getItem("pegawai") || "{}");
  const pegawaiId = pegawai.id;


  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  // ================= FETCH =================
  const fetchPenggajian = async () => {
    try {
        const res = await api.get("/penggajian"); // 🔥 HAPUS params

        setItems(res.data || []);
    } catch (err) {
        console.error("Error fetch penggajian", err);
    } finally {
        setLoading(false);
    }
    };

  useEffect(() => {
    fetchPenggajian();
  }, []);

  // ================= FILTER =================
  const filtered = items.filter((it) => {
    const tanggal = new Date(it.tanggal);
    const matchFrom = !fromDate || tanggal >= fromDate;
    const matchTo = !toDate || tanggal <= toDate;

    return matchFrom && matchTo;
    });


  const renderStatus = (status: string) => {
    const base =
      "px-3 py-1 rounded-full text-xs font-semibold inline-block capitalize";

    if (status === "approved") {
      return (
        <span className={`${base} bg-green-100 text-green-700`}>
          Approved
        </span>
      );
    }

    return (
      <span className={`${base} bg-yellow-100 text-yellow-700`}>
        Pending
      </span>
    );
  };

  const downloadPdf = (id: number) => {
    window.location.href = `http://localhost:8000/penggajian/${id}/pdf`;
  };

  const downloadPdfSlip = (id: number) => {
    window.open(`http://localhost:8000/penggajian/${id}/pdf-slip`, "_blank");
  };

    
  // USER INTERFACE
  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 pb-10 rounded-b-[32px] shadow-lg pt-8">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/home-pegawai")}
            className="p-2 rounded-md mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold">Data Penggajian Karyawan</h1>
          </div>

          <Grid className="w-5 h-5 opacity-80" />
        </div>
      </div>

      {/* FILTER */}
      <div className="mx-5 -mt-10">
        <div className="bg-white p-4 rounded-2xl shadow-lg">
          <div className="flex gap-3">
            <DatePicker
              selected={fromDate}
              onChange={(date: Date | null) => setFromDate(date)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Tanggal Mulai"
              className="flex-1 border rounded-lg px-3 py-2 text-sm bg-gray-50"
            />
            <DatePicker
              selected={toDate}
              onChange={(date: Date | null) => setToDate(date)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Tanggal Selesai"
              className="flex-1 border rounded-lg px-3 py-2 text-sm bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-5 mt-5">
        
        {/* ================= TABLE CARD ================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-800">
              Daftar Penggajian Karyawan
            </p>
            <p className="text-xs text-gray-400">
              Riwayat Penggajian Karyawan
            </p>
          </div>

          {/* TABLE */}
            <div className="overflow-x-auto">
             <table className="w-full text-sm text-center">
              <thead className="bg-white text-xs text-gray-500">
              <tr>
               <th className="px-4 py-3">No</th>
               <th className="px-4 py-3">Nomor Gaji</th>
               <th className="px-4 py-3">Nama</th>
               <th className="px-4 py-3">Jabatan</th>
               <th className="px-4 py-3">Bulan</th>
               <th className="px-4 py-3">Grand Total</th>
               <th className="px-4 py-3">Detail Perpajakan</th>
               <th className="px-4 py-3">Actions</th>
              </tr>
             </thead>
          
            <tbody>
            {filtered.length === 0 ? (
            <tr>
             <td
             colSpan={13}
             className="text-center px-6 py-10 text-gray-400 text-sm"
            >
              Tidak ada data Penggajian
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
               <td className="px-4 py-3">{it.nomor_gaji}</td>
               <td className="px-4 py-3">{it.pegawai?.name}</td>
               <td className="px-4 py-3">{it.pegawai?.divisi?.nama ?? "-"}</td>
               <td className="px-4 py-3">{it.bulan}</td>

               <td className="px-4 py-3">{formatRupiah(it.gaji_diterima)}</td>
               <td className="px-4 py-3">
                  <button
                    onClick={() => downloadPdf(it.id)}
                    className="
                      inline-flex items-center gap-2
                      px-3 py-1.5
                      rounded-lg
                      bg-red-50 text-red-600
                      font-semibold text-xs
                      hover:bg-red-100 hover:text-red-700
                      transition-all duration-200
                    "
                  >
                    <FileDown className="w-4 h-4" />
                    Download PDF
                  </button>
                </td>

                <td className="px-4 py-3">
                  <button
                    onClick={() => downloadPdfSlip(it.id)}
                    className="
                      inline-flex items-center gap-2
                      px-3 py-1.5
                      rounded-lg
                      bg-red-50 text-red-600
                      font-semibold text-xs
                      hover:bg-red-100 hover:text-red-700
                      transition-all duration-200
                    "
                  >
                    <FileDown className="w-4 h-4" />
                    Download PDF
                  </button>
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

      <BottomNav />
    </div>
  );
}
