import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import Swal from "sweetalert2";
import Label from "../../components/form/Label";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Pegawai {
  id: number;
  name: string;
  company_id: number | null;
}

interface Company {
  id: number;
  name: string;
}

export default function AddPegawaiKeluar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const dashboardType = user.dashboard_type;
  const userCompanyId = user.company_id;

  const [form, setForm] = useState({
    company_id: "",
    pegawai_id: "",
    tanggal_keluar: "",
    alasan: "",
    jenis_keberhentian: "",
    upload_file: null as File | null,
  });

  const [pegawais, setPegawais] = useState<Pegawai[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    pegawai_id: "",
    tanggal_keluar: "",
    alasan: "",
    jenis_keberhentian: "",
  });

  const jenisKeberhentianOptions = [
    { value: "", label: "-- Pilih Jenis Keberhentian --" },
    { value: "PHK", label: "PHK" },
    { value: "Pengunduran Diri", label: "Pengunduran Diri" },
    { value: "Meninggal Dunia", label: "Meninggal Dunia" },
    { value: "Pensiun", label: "Pensiun" },
  ];

  // Fetch company (superadmin)
  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(res.data.data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  // Fetch pegawai
  const fetchPegawais = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/pegawais", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mapped = res.data.map((p: any) => ({
        id: p.id,
        name: p.name || "Unnamed",
        company_id: p.company_id || null,
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
      setPegawais([]);
    }
  };

  useEffect(() => {
    if (dashboardType === "superadmin") fetchCompanies();
    else setForm((prev) => ({ ...prev, company_id: userCompanyId }));

    fetchPegawais();
  }, []);

  // Filter pegawai by company (superadmin)
  const filteredPegawai =
    dashboardType === "admin"
      ? pegawais
      : pegawais.filter((p) => String(p.company_id) === String(form.company_id));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (name === "upload_file" && files) {
      setForm({ ...form, upload_file: files[0] });
      return;
    }

    if (name === "company_id") {
      setForm({ ...form, company_id: value, pegawai_id: "" });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const validate = () => {
    const newErrors = {
      pegawai_id: "",
      tanggal_keluar: "",
      alasan: "",
      jenis_keberhentian: "",
    };
    let ok = true;

    if (!form.pegawai_id) (newErrors.pegawai_id = "Pilih pegawai"), (ok = false);
    if (!form.tanggal_keluar) (newErrors.tanggal_keluar = "Wajib diisi"), (ok = false);
    if (!form.alasan) (newErrors.alasan = "Wajib diisi"), (ok = false);
    if (!form.jenis_keberhentian) (newErrors.jenis_keberhentian = "Wajib dipilih"), (ok = false);

    setErrors(newErrors);
    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("company_id", form.company_id);
      formData.append("pegawai_id", form.pegawai_id);
      formData.append("tanggal_keluar", form.tanggal_keluar);
      formData.append("alasan", form.alasan);
      formData.append("jenis_keberhentian", form.jenis_keberhentian);
      if (form.upload_file) formData.append("upload_file", form.upload_file);

      const res = await api.post("/pegawai-keluar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: res.data.message,
      }).then(() => navigate("/pegawai-keluar"));
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "Gagal menyimpan" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Pegawai Keluar" description="Tambah Pegawai Keluar" />
      <PageHeader
        pageTitle="Tambah Pegawai Keluar"
        rightContent={
          <button
            onClick={() => navigate("/pegawai-keluar")}
            className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-xl"
          >
            ⬅ Back
          </button>
        }
      />

      <div className="mt-5 space-y-5">
        <ComponentCard title="Form Pegawai Keluar">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ===================== COMPANY ===================== */}
            {dashboardType === "superadmin" && (
              <div>
                <Label>Company</Label>
                <div className="relative">
                  <select
                    name="company_id"
                    value={form.company_id}
                    onChange={handleChange}
                    className="
                      w-full border rounded-xl px-4 py-2.5
                      bg-white dark:bg-gray-800 text-gray-700 dark:text-white
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      appearance-none
                    "
                  >
                    <option value="">-- Pilih Company --</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">
                    ▼
                  </span>
                </div>
              </div>
            )}

            {/* ===================== PEGAWAI ===================== */}
            <div>
              <Label>Nama Pegawai</Label>
              <div className="relative">
                <select
                  name="pegawai_id"
                  value={form.pegawai_id}
                  onChange={handleChange}
                  className="
                    w-full border rounded-xl px-4 py-2.5
                    bg-white dark:bg-gray-800 text-gray-700 dark:text-white
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    appearance-none
                  "
                >
                  <option value="">-- Pilih Pegawai --</option>
                  {filteredPegawai.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">
                  ▼
                </span>
              </div>

              {errors.pegawai_id && <p className="text-red-500 text-sm">{errors.pegawai_id}</p>}
            </div>

            {/* ===================== TANGGAL ===================== */}
            <div>
              <Label>Tanggal Keluar</Label>
              <DatePicker
                selected={form.tanggal_keluar ? new Date(form.tanggal_keluar) : null}
                onChange={(date: Date | null) => {
                  setForm({ ...form, tanggal_keluar: date ? date.toISOString().slice(0, 10) : "" });
                }}
                className="w-full border px-4 py-2.5 rounded-xl bg-white dark:bg-gray-700 dark:text-white"
                dateFormat="yyyy-MM-dd"
              />
              {errors.tanggal_keluar && (
                <p className="text-red-500 text-sm">{errors.tanggal_keluar}</p>
              )}
            </div>

            {/* ===================== ALASAN ===================== */}
            <div>
              <Label>Alasan Keluar</Label>
              <textarea
                name="alasan"
                value={form.alasan}
                onChange={handleChange}
                className="w-full border px-4 py-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Masukkan alasan"
              />
              {errors.alasan && <p className="text-red-500 text-sm">{errors.alasan}</p>}
            </div>

            {/* ===================== JENIS ===================== */}
            <div>
              <Label>Jenis Keberhentian</Label>
              <select
                name="jenis_keberhentian"
                value={form.jenis_keberhentian}
                onChange={handleChange}
                className="w-full border px-4 py-2.5 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {jenisKeberhentianOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* ===================== UPLOAD ===================== */}
            <div>
              <Label>Upload File (opsional)</Label>
              <label
                htmlFor="upload_file"
                className="
                  flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 
                  rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700
                "
              >
                <span className="text-gray-500 dark:text-gray-300 text-sm">Pilih File</span>
                <input
                  id="upload_file"
                  type="file"
                  name="upload_file"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>

              {form.upload_file && (
                <p className="text-green-600 text-sm mt-1">
                  File dipilih: <strong>{form.upload_file.name}</strong>
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
              >
                {loading ? "Menyimpan..." : "Save"}
              </button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
