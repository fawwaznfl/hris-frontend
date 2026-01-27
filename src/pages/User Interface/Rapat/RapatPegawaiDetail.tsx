import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../../../api/axios";
import Swal from "sweetalert2";

type TabType = "detail" | "peserta" | "notulen";

export default function RapatPegawaiDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rapat, setRapat] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>("detail");

  const [isHadir, setIsHadir] = useState(false);
  const [loadingHadir, setLoadingHadir] = useState(false);

  const pegawais = rapat?.pegawais ?? [];
    const totalPeserta = pegawais.length;
    const jumlahHadir = pegawais.filter(
    (p: any) => p.pivot?.waktu_hadir
    ).length;

    const jumlahTidakHadir = totalPeserta - jumlahHadir;



  useEffect(() => {
  api.get(`/rapat/${id}`).then((res) => {
    const data = res.data.data;
    setRapat(data);

    const pegawaiLoginId = data.auth_pegawai_id; 
    const peserta = data.pegawais.find(
      (p: any) => p.id === pegawaiLoginId
    );

    if (peserta?.pivot?.waktu_hadir) {
      setIsHadir(true);
    }
  });
}, [id]);


  if (!rapat) {
    return <p className="p-4 text-center">Memuat detail rapat...</p>;
  }

  const formatTanggalWaktu = (tanggalISO: string, waktu: string) => {
    const date = new Date(tanggalISO);

    const tanggalFormatted = date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const jamFormatted = waktu.slice(0, 5).replace(":", ".");

    return `${tanggalFormatted}, ${jamFormatted}`;
    };

    const handleHadir = async () => {
    try {
        setLoadingHadir(true);

        await api.post(`/rapat/${id}/hadir`);

        setIsHadir(true);

        Swal.fire({
        icon: "success",
        title: "Berhasil Hadir",
        text: "Kehadiran kamu berhasil dicatat",
        timer: 2000,
        showConfirmButton: false,
        });

    } catch (error: any) {
        Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
            error?.response?.data?.message ||
            "Gagal melakukan absensi hadir",
        });
    } finally {
        setLoadingHadir(false);
    }
    };

    const handleNotulen = async () => {
    const { value: notulen } = await Swal.fire({
        title: "Notulen Rapat",
        input: "textarea",
        inputLabel: "Isi notulen rapat",
        inputPlaceholder: "Tulis notulen di sini...",
        inputValue: rapat?.notulen || "",
        inputAttributes: {
        rows: "6",
        },
        showCancelButton: true,
        confirmButtonText: "Simpan",
        cancelButtonText: "Batal",
        customClass: {
        popup: "rounded-2xl",
        confirmButton: "bg-indigo-600 text-white",
        },
        inputValidator: (value) => {
        if (!value) return "Notulen tidak boleh kosong";
        },
    });

    if (!notulen) return;

    try {
        await api.post(`/rapat/${id}/notulen`, { notulen });

        Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Notulen berhasil disimpan",
        timer: 2000,
        showConfirmButton: false,
        });

        // update state biar langsung tampil
        setRapat((prev: any) => ({
        ...prev,
        notulen,
        }));

        setActiveTab("notulen");
    } catch (error: any) {
        Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
            error?.response?.data?.message ||
            "Gagal menyimpan notulen",
        });
    }
   };

  // USER INTERFACE
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* HEADER */}
        <div className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 rounded-b-3xl shadow">
        <div className="flex items-center">
            <button onClick={() => navigate("/home-pegawai")} className="mr-2">
            <ArrowLeft />
            </button>
            <h1 className="text-lg font-semibold text-center flex-1">
            {rapat.nama_pertemuan}
            </h1>
        </div>
        </div>

      {/* TABS */}
        <div className="fixed top-[88px] left-0 right-0 z-20 bg-white mx-4 rounded-2xl shadow-sm">
        <div className="flex text-sm font-medium">
            {[
            { label: "Detail", value: "detail" },
            { label: "Peserta", value: "peserta" },
            { label: "Notulen", value: "notulen" },
            ].map((tab) => (
            <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as TabType)}
                className={`flex-1 py-3 text-center relative transition
                ${
                    activeTab === tab.value
                    ? "text-indigo-600"
                    : "text-gray-400"
                }`}
            >
                {tab.label}
                {activeTab === tab.value && (
                <span className="absolute bottom-0 left-6 right-6 h-[3px] bg-indigo-600 rounded-full" />
                )}
            </button>
            ))}
        </div>
        </div>

      {/* TAB CONTENT */}
      <div className="pt-[160px] sm:pt-[170px] pb-28 sm:pb-32 px-3 sm:px-4 overflow-y-auto h-screen space-y-3 sm:space-y-4">
        {activeTab === "detail" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4 space-y-3 sm:space-y-4">

            {/* MULAI */}
            <div>
                <p className="text-xs text-gray-500">Mulai Acara</p>
                <p className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">
                {formatTanggalWaktu(rapat.tanggal_rapat, rapat.waktu_mulai)}
                </p>
            </div>
            <hr className="border-gray-100 my-1 sm:my-2" />

            {/* SELESAI */}
            <div>
                <p className="text-xs text-gray-500">Selesai Acara</p>
                <p className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">
                {formatTanggalWaktu(rapat.tanggal_rapat, rapat.waktu_selesai)}
                </p>
            </div>
            <hr className="border-gray-100" />

            {/* JENIS */}
            <div>
                <p className="text-xs text-gray-500">Jenis Pertemuan</p>
                <p className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">
                Pertemuan {rapat.jenis_pertemuan}
                </p>
            </div>
            <hr className="border-gray-100" />

            {/* LOKASI */}
            <div>
                <p className="text-xs text-gray-500">Lokasi Pertemuan</p>
                <p className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">
                {rapat.lokasi || "-"}
                </p>
            </div>

            {/* Jumlah Peserta */}
            <div>
                <p className="text-xs text-gray-500">Jumlah Peserta</p>
                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                   {totalPeserta} Orang
                </p>
            </div>
            <hr className="border-gray-100" />

            {/* Peserta Hadir */}
            <div>
                <p className="text-xs text-gray-500">Peserta Hadir</p>
                <p className="font-semibold text-green-600 text-sm sm:text-base">
                   {jumlahHadir} Orang
                </p>
            </div>
            <hr className="border-gray-100" />

            {/* Peserta Tidak Hadri */}
            <div>
                <p className="text-xs text-gray-500">Peserta Tidak Hadir</p>
                <p className="font-semibold text-red-600 text-sm sm:text-base">
                   {jumlahTidakHadir} Orang
                </p>
            </div>
            <hr className="border-gray-100" />

            <div>
                <p className="text-xs text-gray-500">Detail Pertemuan</p>
                <p className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">
                {rapat.detail_pertemuan || "-"}
                </p>
            </div>            
            </div>
        </div>
        )}


        {/* ================= PESERTA ================= */}
        {activeTab === "peserta" && (
        <div className="space-y-3">

        {/* JUMLAH PESERTA */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
        <p className="text-xs text-gray-500">Jumlah Peserta</p>
        <p className="font-semibold text-gray-900">
            {rapat.pegawais?.length || 0} Orang
        </p>
        </div>

        {/* LIST PESERTA */}
        <div className="bg-white rounded-2xl shadow-sm divide-y">
        {rapat.pegawais?.map((pegawai: any) => {
        const sudahHadir = !!pegawai.pivot?.waktu_hadir;

        return (
            <div
            key={pegawai.id}
            className="flex items-center gap-3 p-4"
            >
            {/* AVATAR */}
            {pegawai.foto_karyawan_url ? (
                <img
                src={pegawai.foto_karyawan_url}
                alt={pegawai.name}
                className="w-10 h-10 rounded-full object-cover"
                />
            ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                {pegawai.name.charAt(0)}
                </div>
            )}

            {/* INFO */}
            <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm sm:text-base">
                {pegawai.name}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500">
                Peserta Rapat
                </p>
            </div>

            {/* STATUS HADIR */}
            <span
                className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold
                ${
                    sudahHadir
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }
                `}
            >
                {sudahHadir ? "Hadir" : "Belum Hadir"}
            </span>
            </div>
        );
        })}


        {/* EMPTY */}
        {rapat.pegawais?.length === 0 && (
            <div className="p-6 text-center text-gray-500 text-sm">
            Belum ada peserta
            </div>
        )}
        </div>
    </div>
    )}


    {/* ================= NOTULEN ================= */}
    {activeTab === "notulen" && (
    <div className="bg-white rounded-2xl shadow-sm p-4 text-sm text-gray-700 leading-relaxed">
        {rapat.notulen ? (
        <pre className="whitespace-pre-wrap font-sans">
            {rapat.notulen}
        </pre>
        ) : (
        <p className="text-center text-gray-400">
            Belum ada notulen
        </p>
        )}
    </div>
    )}
    </div>

      {/* ACTION BUTTONS */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40">
        <div className="flex gap-3">
          {/* BUTTON NOTULEN */}
          <button
            onClick={handleNotulen}
            className="flex-1 py-3 rounded-xl font-semibold border border-indigo-600 text-indigo-600 active:scale-95"
                >
            Notulen
          </button>

            {/* BUTTON HADIR */}
            <button
            onClick={handleHadir}
            disabled={isHadir || loadingHadir}
            className={`flex-1 py-3 rounded-xl font-semibold transition
                ${
                isHadir
                    ? "bg-green-500 text-white"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }
                ${loadingHadir && "opacity-70"}
            `}
            >
            {loadingHadir
                ? "Mencatat kehadiran..."
                : isHadir
                ? "Sudah Hadir"
                : "Hadir"}
            </button>
        </div>
      </div>
    </div>
  );
}
