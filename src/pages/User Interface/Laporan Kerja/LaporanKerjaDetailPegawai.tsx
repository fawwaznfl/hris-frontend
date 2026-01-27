import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { ArrowLeft } from "lucide-react";
import BottomNav from "../../../components/common/BottomNav";
import Swal from "sweetalert2";
import { Trash2, Edit } from "lucide-react";


interface LaporanKerjaDetail {
  id: number;
  tanggal_laporan: string;
  informasi_umum: string;
  pekerjaan_yang_dilaksanakan: string;
  catatan?: string;
  pekerjaan_belum_selesai?: string;
}

export default function LaporanKerjaDetailPegawai() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<LaporanKerjaDetail | null>(null);

  const fetchDetail = async () => {
  try {
    const res = await api.get(`/laporan-kerja/${id}`);
    setData(res.data.data ?? res.data);
  } catch (err) {
    console.error(err);
  }
};

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: "Hapus laporan?",
            text: "Laporan yang dihapus tidak bisa dikembalikan",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Hapus",
            cancelButtonText: "Batal",
        });

        if (!result.isConfirmed) return;

        try {
            await api.delete(`/laporan-kerja/${id}`);

            Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Laporan berhasil dihapus",
            timer: 1500,
            showConfirmButton: false,
            });

            navigate(-1);
        } catch (err) {
            Swal.fire("Gagal", "Tidak bisa menghapus laporan", "error");
        }
        };


  useEffect(() => {
    if (id) {
        fetchDetail();
    }
    }, [id]);


  if (!data) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 pb-8 rounded-b-[32px] pt-8">
        <div className="flex items-center">
        <button onClick={() => navigate(-1)}>
            <ArrowLeft />
        </button>

        <h1 className="flex-1 text-center text-lg font-semibold">
            Detail Laporan
        </h1>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-5 mt-6 space-y-4">
        <Section title="Informasi Umum">
          {data.informasi_umum}
        </Section>

        <Section title="Pekerjaan yang Dilaksanakan">
          {data.pekerjaan_yang_dilaksanakan}
        </Section>

        <Section title="Catatan">
          {data.catatan || "-"}
        </Section>

        <Section title="Pekerjaan Belum Selesai">
          {data.pekerjaan_belum_selesai || "-"}
        </Section>
      </div>

      {/* ACTION BUTTON */}
        <div className="fixed bottom-20 left-0 right-0 px-5">
        <div className="flex gap-3">
            {/* EDIT */}
            <button
            onClick={() => navigate(`/edit-laporan-kerja/${id}`)}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-full shadow-lg"
            >
            <Edit className="w-4 h-4" />
            Edit
            </button>

            {/* DELETE */}
            <button
            onClick={handleDelete}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-full shadow-lg"
            >
            <Trash2 className="w-4 h-4" />
            Hapus
            </button>
        </div>
        </div>


      <BottomNav />
    </div>
  );
}

/* ================= COMPONENT KECIL ================= */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border">
      <p className="text-sm sm:text-base font-semibold text-gray-800 mb-2">
        {title}
      </p>
      <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
        {children}
      </p>
    </div>
  );
}
