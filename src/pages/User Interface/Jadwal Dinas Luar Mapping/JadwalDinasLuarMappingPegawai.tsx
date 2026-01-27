import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import api from "../../../api/axios";
import { Trash2, CalendarPlus, Fingerprint } from "lucide-react";
import Swal from "sweetalert2";

interface DinasLuarMapping {
  id: number;
  tanggal_mulai: string;
  shift: {
    id: number;
    nama: string;
    jam_masuk: string;
    jam_pulang: string;
  };
}

export default function JadwalDinasLuarMappingPegawai() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const pegawai_id = user.dashboard_type === "pegawai" ? user.id : Number(id);

  const [mapping, setMapping] = useState<DinasLuarMapping[]>([]);
  const [pegawai, setPegawai] = useState<any>(null);
  const [absenStatusMap, setAbsenStatusMap] = useState<Record<string, string>>({});

  const formatTime = (time: string) =>
    time ? time.slice(0, 5).replace(":", ".") : "-";

  const isToday = (date: string) =>
    date === new Date().toISOString().slice(0, 10);

  const isShiftFinished = (tanggal: string, jamPulang: string) =>
    new Date() > new Date(`${tanggal}T${jamPulang}`);

  const isAbsenSelesai = (tanggal: string) =>
    absenStatusMap[tanggal] === "sudah_pulang";

  // ================= FETCH DATA =================
  const fetchPegawai = async () => {
    if (user.dashboard_type === "pegawai") {
      setPegawai(user);
    } else {
      const res = await api.get(`/pegawai/${pegawai_id}`);
      setPegawai(res.data.data);
    }
  };

  const fetchDinasLuarMapping = async () => {
    const url =
      user.dashboard_type === "pegawai"
        ? `/dinas-luar-mapping/self/${user.id}`
        : `/dinas-luar-mapping/pegawai/${pegawai_id}`;

    const res = await api.get(url);
    setMapping(res.data.data ?? []);
  };

  const fetchAbsenStatus = async () => {
    const res = await api.get(`/absensi/by-pegawai/${pegawai_id}`);
    const map: Record<string, string> = {};
    res.data.data.forEach((a: any) => (map[a.tanggal] = a.status_absen));
    setAbsenStatusMap(map);
  };

  // ================= EDIT SHIFT =================
  const handleEditShift = async (row: DinasLuarMapping) => {
    const res = await api.get("/shifts");
    const shifts = res.data.data || [];

    const options = shifts
      .map(
        (s: any) =>
          `<option value="${s.id}" ${
            s.id === row.shift.id ? "selected" : ""
          }>${s.nama} (${s.jam_masuk} - ${s.jam_pulang})</option>`
      )
      .join("");

    const { value } = await Swal.fire({
      title: "Edit Shift",
      html: `
        <label class="block mb-1">Tanggal</label>
        <input type="date" id="tanggal" class="swal2-input" value="${row.tanggal_mulai}" />
        <label class="block mt-2 mb-1">Shift</label>
        <select id="shift" class="swal2-input">${options}</select>
      `,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      preConfirm: () => {
        const tanggal = (document.getElementById("tanggal") as HTMLInputElement).value;
        const shift = (document.getElementById("shift") as HTMLSelectElement).value;
        if (!tanggal || !shift) {
          Swal.showValidationMessage("Lengkapi data!");
          return;
        }
        return { tanggal, shift };
      },
    });

    if (!value) return;

    await api.put(`/dinas-luar-mapping/${row.id}`, {
      tanggal_mulai: value.tanggal,
      tanggal_selesai: value.tanggal,
      shift_id: value.shift,
    });

    Swal.fire("Berhasil", "Jadwal diperbarui", "success");
    fetchDinasLuarMapping();
  };

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    const ok = await Swal.fire({
      icon: "warning",
      title: "Hapus Jadwal?",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });

    if (!ok.isConfirmed) return;

    await api.delete(`/dinas-luar-mapping/${id}`);
    fetchDinasLuarMapping();
  };

  useEffect(() => {
    fetchPegawai();
    fetchDinasLuarMapping();
    fetchAbsenStatus();
  }, [pegawai_id]);

  return (
    <>
      <PageMeta title="Jadwal Dinas Luar" description="Jadwal Dinas Luar Pegawai" />

      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 pb-12 rounded-b-[32px] shadow pt-8">
        <div className="flex items-center">
            {/* BACK BUTTON */}
            <button
            onClick={() => navigate("/home-pegawai")}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition"
            >
            <span className="text-xl font-semibold">←</span>
            </button>

            {/* TITLE */}
            <h1 className="flex-1 text-center text-xl font-semibold tracking-wide">
            Jadwal Dinas Luar
            </h1>

            {/* spacer supaya title tetap center */}
            <div className="w-9" />
        </div>
       </div>


      {/* CONTENT */}
      <div className="-mt-8 px-4">
        <ComponentCard
          title={
            <div className="w-full text-center font-semibold">
              Jadwal Dinas Luar {pegawai?.name || ""}
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 text-left">
                <tr>
                  <th className="p-3">No</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Shift</th>
                  <th className="p-3">Masuk</th>
                  <th className="p-3">Pulang</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {mapping.map((m, i) => (
                  <tr key={m.id} className="border-b">
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3">{m.tanggal_mulai}</td>
                    <td className="p-3">{m.shift.nama}</td>
                    <td className="p-3">{formatTime(m.shift.jam_masuk)}</td>
                    <td className="p-3">{formatTime(m.shift.jam_pulang)}</td>
                    <td className="p-3 flex gap-3">
                      {/* ABSEN */}
                      {isToday(m.tanggal_mulai) &&
                      !isShiftFinished(m.tanggal_mulai, m.shift.jam_pulang) ? (
                        <Fingerprint
                          className="text-green-600 cursor-pointer"
                          onClick={() => navigate(`/absensi-dinas-luar/pegawai/${pegawai_id}`)}
                        />
                      ) : (
                        <Fingerprint className="text-gray-300" />
                      )}

                      {/* ADMIN ONLY */}
                      {user.dashboard_type !== "pegawai" && (
                        <>
                          <CalendarPlus
                            className="text-indigo-600 cursor-pointer"
                            onClick={() => handleEditShift(m)}
                          />
                          <Trash2
                            className="text-red-600 cursor-pointer"
                            onClick={() => handleDelete(m.id)}
                          />
                        </>
                      )}
                    </td>
                  </tr>
                ))}

                {mapping.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-6 text-gray-400">
                      Tidak ada jadwal
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
