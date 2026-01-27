import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../api/axios";
import { ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";


export default function DetailPenugasan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetchDetail();
  }, []);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/penugasan/${id}`);
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTanggal = (date: string) =>
  new Date(date)
    .toLocaleString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace("pukul", "")
    .trim();

  if (loading) {
    return <div className="p-5 text-center text-gray-400">Memuat...</div>;
  }

  if (!data) {
    return <div className="p-5 text-center text-red-500">Data tidak ditemukan</div>;
  }
  
  const renderActivityBadge = (status: "pending" | "process" | "finish") => {
    if (status === "pending")
        return "bg-yellow-100 text-yellow-700";

    if (status === "process")
        return "bg-blue-100 text-blue-700";

    return "bg-green-100 text-green-700";
    };


  const handleMulaiPekerjaan = async () => {
    const isPending = data.status === "pending";

    const result = await Swal.fire({
        title: isPending ? "Mulai pekerjaan?" : "Selesaikan pekerjaan?",
        text: isPending
        ? "Status akan berubah menjadi Dalam Proses"
        : "Status akan berubah menjadi Selesai",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: isPending ? "Ya, mulai" : "Ya, selesaikan",
        cancelButtonText: "Batal",
        reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
        await api.put(`/penugasan/${id}`, {
        status: isPending ? "process" : "finish",
        });

        await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: isPending
            ? "Pekerjaan telah dimulai"
            : "Pekerjaan telah diselesaikan",
        timer: 1500,
        showConfirmButton: false,
        });

        navigate("/penugasan-pegawai", {
        state: { tab: isPending ? "proses" : "selesai" },
        });
    } catch (err) {
        Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat memproses pekerjaan",
        });
    }
    };


  const ActivityItem = ({
    label,
    status,
    date,
    }: {
    label: string;
    status: "pending" | "process" | "finish";
    date: string;
    }) => (
    <div className="flex items-start gap-3">
        {/* AVATAR */}
        {data.pegawai?.foto_karyawan ? (
        <img
            src={`${BASE_URL}/storage/${data.pegawai.foto_karyawan}`}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover shrink-0"
        />
        ) : (
        <div className="w-9 h-9 md:w-10 md:h-10 bg-gray-200 rounded-full shrink-0" />
        )}

        {/* CONTENT */}
        <div className="flex-1">
        <p className="font-medium text-sm md:text-base">
            {data.pegawai?.name}
        </p>
        <p className="text-[11px] md:text-xs text-gray-400">
            {formatTanggal(date)}
        </p>
        <p className="text-xs md:text-sm text-gray-500 mt-1">
            {label}
        </p>
        </div>

        {/* BADGE */}
        <span
        className={`self-start whitespace-nowrap text-[10px] md:text-xs px-3 py-1 rounded-full font-semibold ${renderActivityBadge(
            status
        )}`}
        >
        {status.toUpperCase()}
        </span>
    </div>
    );


  // USER INTERFACE
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 rounded-b-3xl shadow sticky top-0 z-20">
        <div className="flex items-center">
          <button onClick={() => navigate("/penugasan-pegawai")} className="mr-2">
            <ArrowLeft />
          </button>
          <h1 className="text-lg font-semibold text-center flex-1">
            Penugasan Kerja
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-28">
      {/* INFO CARD */}
        <div className="bg-white m-4 rounded-2xl p-4 shadow-sm space-y-4">
        {/* NOMOR PENUGASAN */}
        <p className="text-center text-base md:text-lg font-semibold tracking-wide text-gray-800">
            {data.nomor_penugasan}
        </p>

        <div className="flex justify-between text-xs md:text-sm">
            <span className="text-gray-500">Tanggal</span>
            <span className="font-medium">
            {formatTanggal(data.created_at)}
            </span>
        </div>

        <div className="flex justify-between text-xs md:text-sm">
            <span className="text-gray-500">Nama Pegawai</span>
            <span className="font-medium">
            {data.pegawai?.name}
            </span>
        </div>

        <div className="flex justify-between items-center text-xs md:text-sm">
            <span className="text-gray-500">Status</span>
            <span
            className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold
                ${
                data.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : data.status === "process"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}
            >
            {data.status.toUpperCase()}
            </span>
        </div>
        </div>

      {/* DESKRIPSI */}
      <div className="bg-white m-4 rounded-2xl p-4 shadow-sm">
        <p className="text-sm md:text-base text-gray-800 leading-relaxed font-bold text-center">
            {data.judul_pekerjaan}
        </p>
        <p className="text-sm md:text-base text-gray-800 leading-relaxed">
            {data.rincian_pekerjaan || "-"}
        </p>
        </div>

      {/* TIMELINE */}
        <div className="bg-white m-4 rounded-2xl p-4 shadow-sm space-y-4">
        <p className="font-semibold text-sm md:text-base text-gray-800">
            Aktivitas
        </p>

        {/* PENDING (SELALU ADA) */}
        <ActivityItem
            label="Tugas ditugaskan"
            status="pending"
            date={data.created_at}
        />

        {/* PROCESS */}
        {data.status !== "pending" && (
            <ActivityItem
            label="Pekerjaan dimulai"
            status="process"
            date={data.updated_at}
            />
        )}

        {/* FINISH (SIAP NANTI) */}
        {data.status === "finish" && (
            <ActivityItem
            label="Pekerjaan diselesaikan"
            status="finish"
            date={data.updated_at}
            />
        )}
        </div>
      </div>


      {/* ACTION BUTTON */}
      {data.status !== "finish" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-3 md:p-4 shadow-lg">
            <button
            onClick={handleMulaiPekerjaan}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl text-base md:text-lg font-semibold"
            >
            {data.status === "pending"
                ? "Mulai Pekerjaan"
                : "Selesaikan Pekerjaan"}
            </button>
        </div>
        )}
    </div>
  );
}
