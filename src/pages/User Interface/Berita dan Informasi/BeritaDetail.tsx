import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { ArrowLeft } from "lucide-react";

export default function BeritaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [berita, setBerita] = useState<any>(null);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/berita/${id}`);
      setBerita(res.data.data);
    } catch (err) {
      console.error("Gagal ambil detail berita", err);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (!berita) {
    return <p className="p-5 text-center">Memuat...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3">
            <ArrowLeft />
          </button>
          <h1 className="text-lg font-semibold">Detail Berita</h1>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5">
        {berita.gambar && (
          <img
            src={`http://localhost:8000/storage/${berita.gambar}`}
            alt={berita.judul}
            className="w-full h-56 object-cover rounded-2xl shadow-md"
          />
        )}

        <h2 className="text-xl font-bold mt-4">{berita.judul}</h2>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(berita.tanggal_publikasi).toLocaleDateString("id-ID")}
        </p>

        <div className="mt-4 text-gray-700 leading-relaxed whitespace-pre-line">
          {berita.isi_konten}
        </div>
      </div>
    </div>
  );
}
