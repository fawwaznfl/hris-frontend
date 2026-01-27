import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Video, MapPin } from "lucide-react";
import api from "../../../api/axios";
import BottomNav from "../../../components/common/BottomNav";

interface RapatPegawaiItem {
  id: number;
  nama_pertemuan: string;
  tanggal_rapat: string;
  waktu_mulai: string;
  waktu_selesai: string;
  jenis_pertemuan: "online" | "offline";
}

export default function RapatPegawai() {
  const navigate = useNavigate();

  const [rapats, setRapats] = useState<RapatPegawaiItem[]>([]);
  const [loading, setLoading] = useState(true);

  // FORMAT TANGGAL + HARI
  const formatTanggalLengkap = (tanggal: string) =>
    new Date(tanggal).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  // FORMAT JENIS PERTEMUAN
  const formatJenisPertemuan = (jenis: string) =>
    `Pertemuan ${jenis.charAt(0).toUpperCase()}${jenis.slice(1)}`;

  // FETCH RAPAT (BACKEND SUDAH FILTER BERDASARKAN PEGAWAI LOGIN)
  useEffect(() => {
    const fetchRapat = async () => {
      try {
        const res = await api.get("/rapat");

        // kalau pakai ApiFormatter
        setRapats(res.data.data ?? res.data);
      } catch (error) {
        console.error("Gagal mengambil data rapat pegawai", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRapat();
  }, []);

  // USER INTERFACE
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 rounded-b-3xl shadow">
        <div className="flex items-center">
          <button onClick={() => navigate("/home-pegawai")} className="mr-2">
            <ArrowLeft />
          </button>
          <h1 className="text-lg font-semibold text-center flex-1">
            Rapat Kerja
          </h1>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-4">
        {/* LOADING */}
        {loading && (
          <p className="text-center text-gray-500 text-sm">
            Memuat data rapat...
          </p>
        )}

        {/* EMPTY */}
        {!loading && rapats.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <p className="font-medium">Belum ada rapat</p>
            <p className="text-sm">
              Rapat yang kamu ikuti akan muncul di sini
            </p>
          </div>
        )}

        {/* LIST */}
        {!loading &&
          rapats.map((rapat) => (
            <div
              key={rapat.id}
              onClick={() => navigate(`/pegawai/rapat/${rapat.id}`)}
              className="bg-white rounded-2xl shadow-sm border p-4"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {rapat.nama_pertemuan}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {formatTanggalLengkap(rapat.tanggal_rapat)}
                  </p>
                </div>

                <span className="text-sm text-gray-700">
                  {rapat.waktu_mulai} s/d {rapat.waktu_selesai}
                </span>
              </div>

              {/* FOOTER */}
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                {rapat.jenis_pertemuan === "online" ? (
                  <>
                    <Video size={16} className="text-blue-500" />
                    <span>
                      {formatJenisPertemuan(rapat.jenis_pertemuan)}
                    </span>
                  </>
                ) : (
                  <>
                    <MapPin size={16} className="text-green-500" />
                    <span>
                      {formatJenisPertemuan(rapat.jenis_pertemuan)}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
      </div>

      <BottomNav />
    </div>
  );
}
