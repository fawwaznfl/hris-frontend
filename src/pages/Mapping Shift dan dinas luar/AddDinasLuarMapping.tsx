import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import Swal from "sweetalert2";
import { Trash2 } from "lucide-react";
import Label from "../../components/form/Label";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Shift {
  id: number;
  nama: string;
  jam_masuk: string;
  jam_pulang: string;
}

interface DinasLuarMapping {
  id: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  shift: {
    id: number;
    nama: string;
    jam_masuk: string;
    jam_pulang: string;
  };
}

export default function AddDinasLuarMapping() {
  const navigate = useNavigate();
  const { id } = useParams();
  const pegawai_id = id;

  const [form, setForm] = useState({
    pegawai_id: pegawai_id || "",
    company_id: "",
    shift_id: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
  });

  const [tanggalMulai, setTanggalMulai] = useState<Date | null>(null);
  const [tanggalAkhir, setTanggalAkhir] = useState<Date | null>(null);

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [mapping, setMapping] = useState<DinasLuarMapping[]>([]);
  const [pegawai, setPegawai] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    shift_id: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
  });

  const formatTime = (time: string) => {
    if (!time) return "-";
    return time.slice(0, 5).replace(":", ".");
  };

  // FETCH DATA
  useEffect(() => {
    if (!pegawai_id) return;
    fetchShifts();
    fetchPegawai();
    fetchDinasLuarMapping();
  }, [pegawai_id]);

  useEffect(() => {
    if (pegawai?.company_id) {
      setForm((prev) => ({
        ...prev,
        company_id: pegawai.company_id,
      }));
    }
  }, [pegawai]);


  const fetchShifts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/shifts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShifts(res.data.data || []);
    } catch {
      setShifts([]);
    }
  };

  const fetchPegawai = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/pegawais/${pegawai_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPegawai(res.data?.data ?? res.data ?? null);
    } catch {
      setPegawai(null);
    }
  };

  const fetchDinasLuarMapping = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/dinas-luar-mapping?pegawai_id=${pegawai_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMapping(res.data.data || []);
    } catch {
      setMapping([]);
    }
  };

  // EDIT
  const openEdit = async (item: DinasLuarMapping) => {
    const shiftOptions = shifts
      .map(
        (s) =>
          `<option value="${s.id}" ${
            s.id === item.shift.id ? "selected" : ""
          }>
            ${s.nama} (${s.jam_masuk} - ${s.jam_pulang})
          </option>`
      )
      .join("");

    const { value } = await Swal.fire({
      title: "Request Perubahan Shift",
      html: `
        <div style="display:flex; flex-direction:column; gap:14px; text-align:left">

          <!-- SHIFT BARU -->
          <div>
            <label style="font-size:13px; font-weight:600; margin-bottom:6px; display:block">
              Shift Baru
            </label>
            <select id="shiftId"
              style="
                width:100%;
                padding:12px 14px;
                border-radius:12px;
                border:1px solid #d1d5db;
                outline:none;
                font-size:14px;
              ">
              ${shiftOptions}
            </select>
          </div>

          <!-- TANGGAL MULAI -->
          <div>
            <label style="font-size:13px; font-weight:600; margin-bottom:6px; display:block">
              Tanggal Mulai
            </label>
            <input id="tglMulai" type="date"
              value="${item.tanggal_mulai}"
              style="
                width:100%;
                padding:12px 14px;
                border-radius:12px;
                border:1px solid #d1d5db;
                outline:none;
                font-size:14px;
              "/>
          </div>

          <!-- TANGGAL AKHIR -->
          <div>
            <label style="font-size:13px; font-weight:600; margin-bottom:6px; display:block">
              Tanggal Akhir
            </label>
            <input id="tglAkhir" type="date"
              value="${item.tanggal_selesai}"
              style="
                width:100%;
                padding:12px 14px;
                border-radius:12px;
                border:1px solid #d1d5db;
                outline:none;
                font-size:14px;
              "/>
          </div>

        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Kirim Request",
      cancelButtonText: "Cancel",
      buttonsStyling: true,
      customClass: {
        confirmButton: "swal-confirm-btn",
        cancelButton: "swal-cancel-btn",
      },
      preConfirm: () => {
        const shift_id = (document.getElementById("shiftId") as HTMLSelectElement).value;
        const tanggal_mulai = (document.getElementById("tglMulai") as HTMLInputElement).value;
        const tanggal_selesai = (document.getElementById("tglAkhir") as HTMLInputElement).value;

        if (!shift_id || !tanggal_mulai || !tanggal_selesai) {
          Swal.showValidationMessage("Semua field wajib diisi");
          return;
        }

        return {
          shift_id,
          tanggal_mulai,
          tanggal_selesai,
        };
      },
    });

    if (!value) return;

    try {
      await api.put(`/dinas-luar-mapping/${item.id}`, value);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Shift berhasil diperbarui",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchDinasLuarMapping();
    } catch {
      Swal.fire("Gagal", "Tidak dapat update shift", "error");
    }
  };


  // VALIDATION
  const validate = () => {
    const newErr = {
      shift_id: "",
      tanggal_mulai: "",
      tanggal_selesai: "",
    };

    let valid = true;

    if (!form.shift_id) {
      newErr.shift_id = "Pilih shift";
      valid = false;
    }
    if (!tanggalMulai) {
      newErr.tanggal_mulai = "Tanggal mulai wajib diisi";
      valid = false;
    }
    if (!tanggalAkhir) {
      newErr.tanggal_selesai = "Tanggal akhir wajib diisi";
      valid = false;
    }

    setErrors(newErr);
    return valid;
  };

  // SUBMIT
  const handleSubmit = async () => {
  if (!validate()) return;
  const newDate = tanggalMulai?.toLocaleDateString("en-CA");

  const isDuplicate = mapping.some(
    (m) => m.tanggal_mulai === newDate
  );

  if (isDuplicate) {
    Swal.fire({
      icon: "warning",
      title: "Tanggal sudah ditambahkan",
      text: "Shift pada tanggal ini sudah ada.",
    });
    return;
  }
  // SUBMIT
  try {
    setLoading(true);
    const token = localStorage.getItem("token");

    await api.post("/dinas-luar-mapping", {
      pegawai_id: form.pegawai_id,
      company_id: form.company_id,
      shift_id: form.shift_id,
      tanggal_mulai: newDate,
      tanggal_selesai: tanggalAkhir?.toLocaleDateString("en-CA"),
    });

    Swal.fire({
      icon: "success",
      title: "Berhasil!",
      text: "Dinas Luar pegawai berhasil ditambahkan.",
    });

    fetchDinasLuarMapping();
  } catch {
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: "Terjadi kesalahan saat menyimpan Dinas Luar.",
    });
  } finally {
    setLoading(false);
  }
};

  // DELETE
  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Hapus?",
      text: "Yakin ingin menghapus dinas luar ini?",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/dinas-luar-mapping/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchDinasLuarMapping();
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Dinas Luar berhasil dihapus.",
        timer: 1500,
        showConfirmButton: false,
      });

    } catch {
      Swal.fire("Gagal!", "Tidak dapat menghapus data.", "error");
    }
  };

  // USER INTERFACE
  return (
    <>
      <PageMeta title="Tambah Dinas Luar Pegawai" description="Dinas Luar Mapping" />
      <PageHeader
        pageTitle="Tambah Dinas Luar"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <button
            onClick={() => navigate("/pegawai")}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-5 py-2 rounded-xl"
          >
            ⬅ Back
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* FORM INPUT */}
        <ComponentCard title="Form Input Dinas Luar Pegawai">
          <div className="space-y-4">
            <div>
              <Label>Shift</Label>
              <select
                name="shift_id"
                value={form.shift_id}
                onChange={(e) => setForm({ ...form, shift_id: e.target.value })}
                className="w-full p-2 rounded border border-gray-300 bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">-- Pilih Shift --</option>
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} ({s.jam_masuk} - {s.jam_pulang})
                  </option>
                ))}
              </select>
              {errors.shift_id && (
                <p className="text-red-500 text-sm">{errors.shift_id}</p>
              )}
            </div>

            <div>
              <Label>Tanggal Mulai</Label>
              <DatePicker
                selected={tanggalMulai}
                onChange={(date) => setTanggalMulai(date)}
                dateFormat="yyyy-MM-dd"
                className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700"
              />
              {errors.tanggal_mulai && (
                <p className="text-red-500 text-sm">{errors.tanggal_mulai}</p>
              )}
            </div>

            <div>
              <Label>Tanggal Akhir</Label>
              <DatePicker
                selected={tanggalAkhir}
                onChange={(date) => setTanggalAkhir(date)}
                dateFormat="yyyy-MM-dd"
                className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700"
              />
              {errors.tanggal_selesai && (
                <p className="text-red-500 text-sm">{errors.tanggal_selesai}</p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded-xl"
            >
              {loading ? "Menyimpan..." : "Submit"}
            </button>
          </div>
        </ComponentCard>

        {/* TABLE DATA */}
        <ComponentCard
          title={
            <div className="w-full text-center">
              Jadwal Dinas Luar {pegawai?.name || ""}
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200">
                  <th className="p-3">No</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Shift</th>
                  <th className="p-3">Jam Masuk</th>
                  <th className="p-3">Jam Keluar</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mapping.map((m, i) => (
                  <tr
                    key={m.id}
                    className="border-b border-gray-200 dark:border-gray-700 
                               hover:bg-gray-100 dark:hover:bg-gray-600
                               text-gray-800 dark:text-gray-200"
                  >
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3">{m.tanggal_mulai}</td>
                    <td className="p-3">{m.shift.nama}</td>
                    <td className="p-3">{formatTime(m.shift.jam_masuk)}</td>
                    <td className="p-3">{formatTime(m.shift.jam_pulang)}</td>

                    <td className="p-3 flex gap-3">
                      {/* EDIT */}
                      <span
                        onClick={() => openEdit(m)}
                        className="cursor-pointer text-blue-500 hover:text-blue-700"
                      >
                        ✏️
                      </span>

                      {/* DELETE */}
                      <span
                        onClick={() => handleDelete(m.id)}
                        className="cursor-pointer text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </span>
                    </td>
                  </tr>
                ))}

                {mapping.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-4 text-gray-500">
                      Tidak ada data shift.
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
