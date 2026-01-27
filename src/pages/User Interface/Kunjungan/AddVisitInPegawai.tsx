import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../api/axios";
import { ArrowLeft } from "lucide-react";

export default function AddVisitInPegawai() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [keterangan, setKeterangan] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [lokasi, setLokasi] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // ================= GET LOKASI =================
  useEffect(() => {
    if (!navigator.geolocation) {
      Swal.fire("Error", "Browser tidak mendukung GPS", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLokasi(`${lat},${lng}`);
      },
      () => {
        Swal.fire("Error", "Gagal mendapatkan lokasi", "error");
      }
    );
  }, []);

  // ================= FOTO =================
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

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!keterangan || !foto) {
      Swal.fire("Oops", "Lengkapi keterangan & foto", "warning");
      return;
    }

    if (!lokasi) {
      Swal.fire("Oops", "Lokasi belum tersedia", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("pegawai_id", String(user.id));

    if (user.company_id) {
    formData.append("company_id", String(user.company_id));
    }
    formData.append("keterangan", keterangan);
    formData.append("lokasi_masuk", lokasi);

    if (foto) {
      formData.append("upload_foto", foto);
    }

    try {
      setLoading(true);

      await api.post("/kunjungan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Visit In berhasil disimpan",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/kunjungan-pegawai");
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
            Visit In
          </h1>
        </div>
      </div>

      {/* FORM */}
      <div className="p-5 space-y-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm space-y-3">

          {/* NAMA PEGAWAI */}
          <div>
            <label className="text-sm text-gray-600">Nama Pegawai</label>
            <input
              readOnly
              value={user?.name || ""}
              className="w-full border rounded-xl px-4 py-3 bg-gray-100"
            />
          </div>

          {/* KETERANGAN */}
          <div>
            <label className="text-sm text-gray-600">Keterangan Kunjungan</label>
            <textarea
              rows={4}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Kunjungan ke klien A"
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          {/* FOTO */}
          <label className="text-sm text-gray-600">Foto Kunjungan</label>
          <div className="border-2 border-dashed rounded-2xl p-4 text-center">
            <input
              type="file"
              accept="image/*"
              id="foto"
              className="hidden"
              onChange={(e) => handleFotoChange(e.target.files?.[0] || null)}
            />

            <label htmlFor="foto" className="cursor-pointer">
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    className="mx-auto h-40 object-cover rounded-xl shadow"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleFotoChange(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                    📷
                  </div>
                  <p className="text-sm font-medium">Upload foto kunjungan</p>
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
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-full shadow-md disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Simpan Visit In"}
        </button>
      </div>
    </div>
  );
}
