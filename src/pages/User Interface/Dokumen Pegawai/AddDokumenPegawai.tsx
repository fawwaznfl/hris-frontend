import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../api/axios";
import { ArrowLeft } from "lucide-react";

export default function AddDokumenPegawai() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [namaDokumen, setNamaDokumen] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!namaDokumen || !file) {
      Swal.fire("Oops", "Nama dokumen dan file wajib diisi", "warning");
      return;
    }

    if (!user?.id || !user?.company_id) {
      Swal.fire("Error", "User tidak valid, silakan login ulang", "error");
      return;
    }

    const formData = new FormData();
    formData.append("pegawai_id", String(user.id));
    formData.append("company_id", String(user.company_id));
    formData.append("nama_dokumen", namaDokumen);
    formData.append("keterangan", keterangan);
    formData.append("file", file);

    try {
      setLoading(true);

      await api.post("/dokumen-pegawai", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Dokumen berhasil diupload",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/home-pegawai");
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
            Upload Dokumen
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
              type="text"
              readOnly
              value={user?.name || "Tidak ada nama"}
              className="w-full border rounded-xl px-4 py-3 bg-gray-100"
            />
          </div>

          {/* NAMA DOKUMEN */}
          <div>
            <label className="text-sm text-gray-600">Nama Dokumen</label>
            <input
              type="text"
              placeholder="Contoh: Surat Keterangan Kerja"
              value={namaDokumen}
              onChange={(e) => setNamaDokumen(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          {/* KETERANGAN */}
          <div>
            <label className="text-sm text-gray-600">
              Keterangan (Opsional)
            </label>
            <textarea
              rows={3}
              placeholder="Keterangan tambahan"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          {/* FILE */}
          <div>
            <label className="text-sm text-gray-600">File Dokumen</label>
            <div className="border-2 border-dashed rounded-2xl p-4 text-center hover:border-indigo-400 transition">
              <input
                type="file"
                className="hidden"
                id="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />

              <label htmlFor="file" className="cursor-pointer">
                {file ? (
                  <p className="text-sm font-medium text-gray-700">
                    📄 {file.name}
                  </p>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                      📎
                    </div>
                    <p className="text-sm font-medium">
                      Upload file dokumen
                    </p>
                    <p className="text-xs text-gray-400">
                      PDF / JPG / PNG / DOC
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <button
          disabled={loading}
          onClick={handleSubmit}
          className="w-full bg-indigo-600 text-white py-3 rounded-full shadow-md disabled:opacity-60"
        >
          {loading ? "Mengupload..." : "Simpan Dokumen"}
        </button>
      </div>
    </div>
  );
}
