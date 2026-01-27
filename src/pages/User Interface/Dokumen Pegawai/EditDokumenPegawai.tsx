import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../api/axios";
import { ArrowLeft } from "lucide-react";

export default function EditDokumenPegawai() {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [namaDokumen, setNamaDokumen] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/dokumen-pegawai/${id}`);
        const data = res.data.data;

        setNamaDokumen(data.nama_dokumen);
        setKeterangan(data.keterangan || "");
        setFileUrl(data.file_url);
      } catch (err) {
        Swal.fire("Error", "Gagal mengambil data dokumen", "error");
        navigate(-1);
      }
    };

    fetchDetail();
  }, [id]);

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!namaDokumen) {
      Swal.fire("Oops", "Nama dokumen wajib diisi", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("nama_dokumen", namaDokumen);
    formData.append("keterangan", keterangan);

    // file OPTIONAL
    if (file) {
      formData.append("file", file);
    }

    try {
      setLoading(true);

      await api.post(`/dokumen-pegawai/${id}?_method=PUT`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Dokumen berhasil diperbarui",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/dokumen");
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
            Edit Dokumen
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
              value={user?.name || "-"}
              className="w-full border rounded-xl px-4 py-3 bg-gray-100"
            />
          </div>

          {/* NAMA DOKUMEN */}
          <div>
            <label className="text-sm text-gray-600">Nama Dokumen</label>
            <input
              type="text"
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
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          {/* FILE */}
          <div>
            <label className="text-sm text-gray-600">File Dokumen</label>

            {fileUrl && (
              <p className="text-xs mb-2">
                File saat ini:{" "}
                <a
                  href={fileUrl}
                  target="_blank"
                  className="text-indigo-600 underline"
                >
                  Lihat File
                </a>
              </p>
            )}

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
                  <p className="text-sm text-gray-500">
                    Upload file baru (opsional)
                  </p>
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
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}
