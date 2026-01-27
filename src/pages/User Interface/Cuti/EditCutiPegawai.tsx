import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import api from "../../../api/axios";
import { ArrowLeft } from "lucide-react";

export default function EditCutiPegawai() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [preview, setPreview] = useState<string | null>(null);
  const [existingFoto, setExistingFoto] = useState<string | null>(null);

  const [jenisCuti, setJenisCuti] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState<Date | null>(null);
  const [tanggalSelesai, setTanggalSelesai] = useState<Date | null>(null);
  const [alasan, setAlasan] = useState("");
  const [foto, setFoto] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);

  // ================= FETCH DETAIL =================
  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        const res = await api.get(`/cuti/${id}`);
        const data = res.data.data ?? res.data;

        setJenisCuti(data.jenis_cuti);
        setTanggalMulai(
          data.tanggal_mulai
            ? new Date(`${data.tanggal_mulai}T00:00:00`)
            : null
        );
        setTanggalSelesai(
          data.tanggal_selesai
            ? new Date(`${data.tanggal_selesai}T00:00:00`)
            : null
        );
        setAlasan(data.alasan || "");

        if (data.foto) {
          setExistingFoto(data.foto);
          setPreview(`http://localhost:8000/storage/${data.foto}`);
        }
      } catch (err) {
        Swal.fire("Error", "Data cuti tidak ditemukan", "error");
        navigate(-1);
      } finally {
        setLoadingPage(false);
      }
    };

    fetchDetail();
  }, [id, navigate]);

  // ================= FOTO =================
  const handleFotoChange = (file: File | null) => {
    setFoto(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(
        existingFoto
          ? `http://localhost:8000/storage/${existingFoto}`
          : null
      );
    }
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!jenisCuti || !tanggalMulai || !alasan) {
      Swal.fire("Oops", "Lengkapi semua data wajib", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("jenis_cuti", jenisCuti);
    formData.append(
      "tanggal_mulai",
      tanggalMulai.toISOString().slice(0, 10)
    );

    if (tanggalSelesai) {
      formData.append(
        "tanggal_selesai",
        tanggalSelesai.toISOString().slice(0, 10)
      );
    }

    formData.append("alasan", alasan);

    if (foto) {
      formData.append("foto", foto);
    }

    try {
      setLoading(true);

      await api.post(`/cuti/${id}?_method=PUT`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Pengajuan cuti berhasil diperbarui",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/cuti-izin");
    } catch (err: any) {
      Swal.fire(
        "Gagal",
        err?.response?.data?.message || "Terjadi kesalahan",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= LOADING PAGE =================
  if (loadingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Memuat data cuti...
      </div>
    );
  }

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
            Edit Pengajuan Cuti
          </h1>
        </div>
      </div>

      {/* FORM */}
      <div className="p-5 space-y-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm space-y-3">

          {/* NAMA */}
          <div>
            <label className="text-sm text-gray-600">Nama Pegawai</label>
            <input
              readOnly
              value={user?.name || "-"}
              className="w-full border rounded-xl px-4 py-3 bg-gray-100"
            />
          </div>

          {/* JENIS CUTI */}
          <label className="text-sm text-gray-600">Kategori</label>
          <select
            value={jenisCuti}
            onChange={(e) => setJenisCuti(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          >
            <option value="">-- Pilih Jenis Cuti --</option>
            <option value="tahunan">Tahunan</option>
            <option value="sakit">Sakit</option>
            <option value="melahirkan">Melahirkan</option>
            <option value="penting">Penting</option>
            <option value="lainnya">Lainnya</option>
          </select>

          {/* TANGGAL */}
          <label className="text-sm text-gray-600">Tanggal Mulai</label>
          <DatePicker
            selected={tanggalMulai}
            onChange={setTanggalMulai}
            dateFormat="yyyy-MM-dd"
            className="w-full border rounded-xl px-4 py-3"
          />

          <label className="text-sm text-gray-600">Tanggal Selesai</label>
          <DatePicker
            selected={tanggalSelesai}
            onChange={setTanggalSelesai}
            dateFormat="yyyy-MM-dd"
            minDate={tanggalMulai ?? undefined}
            className="w-full border rounded-xl px-4 py-3"
          />

          {/* ALASAN */}
          <label className="text-sm text-gray-600">Alasan</label>
          <textarea
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            rows={4}
            className="w-full border rounded-xl px-4 py-3"
          />

          {/* FOTO */}
          <label className="text-sm text-gray-600">Foto Pendukung</label>
          <div className="border-2 border-dashed rounded-2xl p-4 text-center">
            <input
              type="file"
              id="foto"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                handleFotoChange(e.target.files?.[0] || null)
              }
            />

            <label htmlFor="foto" className="cursor-pointer">
              {preview ? (
                <img
                  src={preview}
                  alt="Foto Cuti"
                  className="mx-auto h-40 object-cover rounded-xl shadow"
                />
              ) : (
                <p className="text-sm text-gray-400">
                  Klik untuk upload foto
                </p>
              )}
            </label>
          </div>
        </div>

        <button
          disabled={loading}
          onClick={handleSubmit}
          className="w-full bg-indigo-600 text-white py-3 rounded-full disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}
