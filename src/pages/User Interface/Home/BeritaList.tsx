import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { ArrowLeft } from "lucide-react";

export default function BeritaList() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [berita, setBerita] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBerita = async () => {
    try {
      const res = await api.get("/berita", {
        params: { company_id: user.company_id },
      });
      setBerita(res.data.data || []);
    } catch (err) {
      console.error("Gagal ambil berita", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBerita();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 pb-6">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 rounded-b-3xl">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3">
            <ArrowLeft />
          </button>
          <h1 className="text-lg font-semibold">Semua Berita</h1>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5">
        {loading ? (
          <p className="text-center text-gray-500">Memuat berita...</p>
        ) : berita.length === 0 ? (
          <p className="text-center text-gray-500">Belum ada berita</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {berita.map((b) => (
              <div
                key={b.id}
                onClick={() => navigate(`/berita/${b.id}`)}
                className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
              >
                {/* GAMBAR */}
                {b.gambar && (
                  <img
                    src={`http://localhost:8000/storage/${b.gambar}`}
                    alt={b.judul}
                    className="w-full h-40 object-cover"
                  />
                )}

                {/* TEXT */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 line-clamp-2">
                    {b.judul}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(b.tanggal_publikasi).toLocaleDateString("id-ID")}
                  </p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                    {b.isi}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
