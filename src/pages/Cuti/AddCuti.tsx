import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "../../components/form/date-picker";

interface Pegawai {
  id: number;
  name: string;
  company_id: number | null;
}

interface Company {
  id: number;
  name: string;
}

export default function AddCuti() {
  const navigate = useNavigate();

  // AMBIL USER & INFO DASHBOARD
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const dashboardType = user.dashboard_type;
  const userCompanyId = user.company_id;

  // STATE FORM
  const [form, setForm] = useState({
    pegawai_id: "",
    company_id: dashboardType === "admin" ? String(userCompanyId) : "",
    jenis_cuti: "",
    tanggal_mulai: null as Date | null,
    tanggal_selesai: null as Date | null,
    alasan: "",
    foto: null as File | null,
  });

  const [companies, setCompanies] = useState<Company[]>([]);
  const [pegawais, setPegawais] = useState<Pegawai[]>([]);

  // FETCH COMPANIES
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/companies", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCompanies(res.data.data || res.data);
      } catch (err) {
        console.error("Error fetch company:", err);
      }
    };

    fetchCompanies();
  }, []);

  // FETCH PEGAWAI
  useEffect(() => {
    const fetchPegawais = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/pegawais", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const mapped = (res.data.data ?? res.data).map((p: any) => ({
          id: p.id,
          name: p.name || "Unnamed",
          company_id: p.company_id ?? p.company?.id ?? null,
        }));

        if (dashboardType === "superadmin") {
          setPegawais(mapped);
        } else {
          const filtered = mapped.filter(
            (p: Pegawai) => String(p.company_id) === String(userCompanyId)
          );
          setPegawais(filtered);
        }
      } catch (err) {
        console.error("Error fetch pegawai:", err);
      }
    };

    fetchPegawais();
  }, [dashboardType, userCompanyId]);

  // FILTER PEGAWAI BERDASARKAN COMPANY (UNTUK SUPERADMIN)
  const pegawaiFiltered =
    dashboardType === "admin"
      ? pegawais
      : pegawais.filter((p) => String(p.company_id) === String(form.company_id));

  // SUBMIT
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!form.company_id || !form.pegawai_id || !form.tanggal_mulai) {
      Swal.fire("Error", "Company, Pegawai, dan Tanggal Mulai wajib diisi!", "error");
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();

    const formatDate = (date: Date | null) =>
      date ? date.toISOString().split("T")[0] : "";

    formData.append("pegawai_id", form.pegawai_id);
    formData.append("company_id", form.company_id);
    formData.append("jenis_cuti", form.jenis_cuti);
    formData.append("tanggal_mulai", formatDate(form.tanggal_mulai));

    if (form.tanggal_selesai) {
      formData.append("tanggal_selesai", formatDate(form.tanggal_selesai));
    }

    formData.append("alasan", form.alasan);

    if (form.foto) {
      formData.append("foto", form.foto);
    }

    try {
      await api.post("/cuti", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire("Berhasil!", "Cuti berhasil ditambahkan.", "success");
      navigate("/cuti");
    } catch (err) {
      Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan data.", "error");
      console.error(err);
    }
  };

  return (
    <>
      <PageMeta title="Tambah Cuti" description="Form untuk menambah data cuti" />
      <PageHeader
        pageTitle="Tambah Cuti"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <button
            onClick={() => navigate("/cuti")}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-5 py-2 rounded-xl"
          >
            ⬅ Back
          </button>
        }
      />

      <div className="mt-4">
        <ComponentCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* COMPANY */}
            {dashboardType === "superadmin" && (
              <div>
                <label className="text-gray-700 dark:text-gray-200">Company</label>
                <select
                  name="company_id"
                  value={form.company_id}
                  onChange={(e) =>
                    setForm({ ...form, company_id: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700"
                >
                  <option value="">-- Pilih Company --</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* PEGAWAI */}
            <div>
              <label className="text-gray-700 dark:text-gray-200">Pegawai</label>
              <select
                name="pegawai_id"
                value={form.pegawai_id}
                onChange={(e) =>
                  setForm({ ...form, pegawai_id: e.target.value })
                }
                className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700"
                disabled={dashboardType === "superadmin" && !form.company_id}
              >
                <option value="">
                  {dashboardType === "admin"
                    ? "-- Pilih Pegawai --"
                    : form.company_id
                    ? "-- Pilih Pegawai --"
                    : "Pilih company dulu"}
                </option>

                {pegawaiFiltered.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* JENIS CUTI */}
            <div>
              <label className="text-gray-700 dark:text-gray-200">Jenis Cuti</label>
              <select
                name="jenis_cuti"
                value={form.jenis_cuti}
                onChange={(e) =>
                  setForm({ ...form, jenis_cuti: e.target.value })
                }
                className="border rounded-lg w-full p-2"
                required
              >
                <option value="">-- Pilih Jenis Cuti --</option>
                <option value="cuti">Cuti</option>
                <option value="izin_masuk">Izin Masuk</option>
                <option value="izin_telat">Izin Telat</option>
                <option value="izin_pulang_cepat">Izin Pulang Cepat</option>
                <option value="sakit">Sakit</option>
                <option value="melahirkan">Melahirkan</option>
              </select>
            </div>

            {/* TANGGAL */}
            <div className="text-gray-700 dark:text-gray-200">
              <div>
                <label className="font-medium">Tanggal Mulai</label>
                <DatePicker
                  id="tanggal_mulai"
                  mode="single"
                  selected={form.tanggal_mulai}
                  onChange={(selectedDates) =>
                    setForm({
                      ...form,
                      tanggal_mulai: selectedDates[0] ? new Date(selectedDates[0]) : null,

                    })
                  }
                />
              </div>

              <div>
                <label className="font-medium">Tanggal Selesai</label>
                <DatePicker
                  id="tanggal_selesai"
                  mode="single"
                  selected={form.tanggal_selesai}
                  onChange={(selectedDates) =>
                    setForm({
                      ...form,
                      tanggal_selesai: selectedDates[0] ? new Date(selectedDates[0]) : null,

                    })
                  }
                />
              </div>
            </div>

            {/* ALASAN */}
            <div>
              <label className="text-gray-700 dark:text-gray-200">Alasan</label>
              <textarea
                value={form.alasan}
                onChange={(e) =>
                  setForm({ ...form, alasan: e.target.value })
                }
                className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
                placeholder="Masukkan alasan cuti"
                required
              />
            </div>

            {/* FOTO */}
            <div>
              <label className="text-gray-700 dark:text-gray-200">Foto (Opsional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm({ ...form, foto: e.target.files?.[0] || null })
                }
                className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end">
              <button className="bg-blue-600 text-white px-5 py-2 rounded-lg">
                Simpan
              </button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
