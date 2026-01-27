import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../api/axios";
import { ArrowLeft } from "lucide-react";

export default function AddLaporanKerjaPegawai() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [informasiUmum, setInformasiUmum] = useState("");
  const [pekerjaan, setPekerjaan] = useState("");
  const [pekerjaanBelumDilaksanakan, setPekerjaanBelumDilaksanakan] = useState("");
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!informasiUmum || !pekerjaan) {
      Swal.fire(
        "Oops",
        "Informasi umum dan pekerjaan wajib diisi",
        "warning"
      );
      return;
    }

    if (!user?.id || !user?.company_id) {
      Swal.fire("Error", "User tidak valid, silakan login ulang", "error");
      return;
    }

    try {
      setLoading(true);

      await api.post("/laporan-kerja", {
        pegawai_id: user.id,
        informasi_umum: informasiUmum,
        pekerjaan_dilaksanakan: pekerjaan,
        pekerjaan_belum_dilaksanakan: pekerjaanBelumDilaksanakan,
        catatan: catatan || null,
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Laporan kerja berhasil disimpan",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/laporan-kerja-pegawai");
    } catch (err: any) {
      console.error(err?.response?.data);
      Swal.fire(
        "Gagal",
        err?.response?.data?.message || "Terjadi kesalahan",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 rounded-b-3xl">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft />
          </button>
          <h1 className="text-lg font-semibold text-center flex-1">
            Tambah Laporan Kerja
          </h1>
        </div>
      </div>

      {/* FORM */}
      <div className="p-5 space-y-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm space-y-4">

          {/* NAMA PEGAWAI */}
          <div>
            <label className="text-sm text-gray-600">Nama Pegawai</label>
            <input
              type="text"
              readOnly
              value={user?.name || "Tidak ada nama"}
              className="w-full border rounded-xl px-4 py-3 bg-gray-100"
            />
          </div>

          {/* INFORMASI UMUM */}
          <div>
            <label className="text-sm text-gray-600">
              Informasi Umum
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Laporan kerja harian tanggal 2 Januari 2026"
              value={informasiUmum}
              onChange={(e) => setInformasiUmum(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          {/* PEKERJAAN */}
          <div>
            <label className="text-sm text-gray-600">
              Pekerjaan yang Dilaksanakan
            </label>
            <textarea
              rows={4}
              placeholder="Jelaskan pekerjaan yang dilakukan hari ini"
              value={pekerjaan}
              onChange={(e) => setPekerjaan(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>


          {/* PEKERJAAN BELUM SELESAI*/}
          <div>
            <label className="text-sm text-gray-600">
              Pekerjaan Belum Selesai
            </label>
            <textarea
              rows={4}
              placeholder="Jelaskan pekerjaan yang belum diselesaikan"
              value={pekerjaanBelumDilaksanakan}
              onChange={(e) => setPekerjaanBelumDilaksanakan(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          {/* CATATAN */}
          <div>
            <label className="text-sm text-gray-600">
              Catatan 
            </label>
            <textarea
              rows={3}
              placeholder="Catatan tambahan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>
        </div>

        {/* SUBMIT */}
        <button
          disabled={loading}
          onClick={handleSubmit}
          className="w-full bg-indigo-600 text-white py-3 rounded-full shadow-md disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Simpan Laporan"}
        </button>
      </div>
    </div>
  );
}
