import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import api from "../../../api/axios";
import { ArrowLeft } from "lucide-react";

export default function AddCutiPegawai() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [preview, setPreview] = useState<string | null>(null);

  const [jenisCuti, setJenisCuti] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState<Date | null>(null);
  const [tanggalSelesai, setTanggalSelesai] = useState<Date | null>(null);
  const [alasan, setAlasan] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!jenisCuti || !tanggalMulai || !alasan) {
      Swal.fire("Oops", "Lengkapi semua data wajib", "warning");
      return;
    }

    if (!user?.id || !user?.company_id) {
      Swal.fire("Error", "User tidak valid, silakan login ulang", "error");
      return;
    }

    const formData = new FormData();

    formData.append("pegawai_id", String(user.id));
    formData.append("company_id", String(user.company_id));

    // DATA LAIN
    formData.append("jenis_cuti", jenisCuti);
    formData.append("tanggal_mulai", formatDate(tanggalMulai));

    if (tanggalSelesai) {
      formData.append("tanggal_selesai", formatDate(tanggalSelesai));
    }

    formData.append("alasan", alasan);

    if (foto) {
      formData.append("foto", foto);
    }

    try {
      setLoading(true);
      await api.post("/cuti", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Pengajuan cuti berhasil dikirim",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/cuti-izin");
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


  const handleFotoChange = (file: File | null) => {
    setFoto(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };


  // USER INTERFACE
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 rounded-b-3xl">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft />
          </button>
          <h1 className="text-lg font-semibold text-center flex-1">
            Ajukan Cuti
          </h1>
        </div>
      </div>

      {/* FORM */}
      <div className="p-5 space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm space-y-2">
        {/* NAMA PEGAWAI */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Nama Pegawai</label>
          <input
            type="text"
            readOnly
            className="w-full border rounded-xl px-4 py-3 bg-gray-100"
            value={user?.name || "Tidak ada nama"}
          />
        </div>
        
        {/* JENIS CUTI */}
        <label className="text-sm text-gray-600">Kategori</label>
        <select
          className="w-full border rounded-xl px-4 py-3"
          value={jenisCuti}
          onChange={(e) => setJenisCuti(e.target.value)}
        >
          <option value="">-- Pilih Jenis Cuti --</option>
          <option value="cuti">Cuti</option>
          <option value="izin_masuk">Izin Masuk</option>
          <option value="izin_telat">Izin Telat</option>
          <option value="izin_pulang_cepat">Izin Pulang Cepat</option>
          <option value="sakit">Sakit</option>
          <option value="melahirkan">Melahirkan</option>
        </select>

        {/* TANGGAL */}
        <label className="text-sm text-gray-600">Tanggal Mulai</label>
        <DatePicker
          selected={tanggalMulai}
          onChange={setTanggalMulai}
          dateFormat="yyyy-MM-dd"
          placeholderText="Tanggal Mulai"
          className="w-full border rounded-xl px-4 py-3"
        />

        <label className="text-sm text-gray-600">Tanggal Selesai</label>
        <DatePicker
          selected={tanggalSelesai}
          onChange={setTanggalSelesai}
          dateFormat="yyyy-MM-dd"
          placeholderText="Tanggal Selesai"
          className="w-full border rounded-xl px-4 py-3"
          minDate={tanggalMulai ?? undefined}
        />

        {/* ALASAN */}
        <label className="text-sm text-gray-600">Alasan Cuti</label>
        <textarea
          placeholder="Alasan cuti"
          className="w-full border rounded-xl px-4 py-3"
          rows={4}
          value={alasan}
          onChange={(e) => setAlasan(e.target.value)}
        />

        {/* FOTO */}
        <label className="text-sm text-gray-600">Foto Pendukung (Opsional)</label>
        <div className="border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer hover:border-indigo-400 transition">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="foto"
            onChange={(e) => handleFotoChange(e.target.files?.[0] || null)}
          />

          <label htmlFor="foto" className="cursor-pointer">
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="mx-auto h-40 object-cover rounded-xl shadow"
                />

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleFotoChange(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                  📷
                </div>
                <p className="text-sm font-medium">
                  Upload foto pendukung
                </p>
                <p className="text-xs text-gray-400">
                  JPG / PNG • Max 2MB
                </p>
              </div>
            )}
          </label>
        </div>

        </div>

        {/* SUBMIT */}
        <button
          disabled={loading}
          onClick={handleSubmit}
          className="w-full bg-indigo-600 text-white py-3 rounded-full shadow-md disabled:opacity-60"
        >
          {loading ? "Mengirim..." : "Ajukan Cuti"}
        </button>
      </div>
    </div>
  );
}
