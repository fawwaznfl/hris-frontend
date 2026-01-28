// --- IMPORT ---
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
import Input from "../../components/form/input/InputField";

interface Pegawai {
  id: number;
  name: string;
  company_id: number | null;
}

interface Company {
  id: number;
  name: string;
}

export default function AddKasbon() {
  const navigate = useNavigate();

  // Ambil user info dari localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const dashboardType = user.dashboard_type;
  const userCompanyId = user.company_id;

  // STATE FORM
  const [form, setForm] = useState({
    company_id: dashboardType === "admin" ? String(userCompanyId) : "",
    pegawai_id: "",
    nominal: "",
    keperluan: "",
    tanggal: null as Date | null,
    metode_pengiriman: "cash",  
    nomor_rekening: "", 
  });


  const [pegawais, setPegawais] = useState<Pegawai[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    company_id: "",
    pegawai_id: "",
    nominal: "",
    keperluan: "",
    tanggal: "",
    nomor_rekening: "",
  });

  // ===============================
  // FETCH COMPANIES (superadmin only)
  // ===============================
  const fetchCompanies = async () => {
    if (dashboardType !== "superadmin") return;

    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(res.data.data);
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  // ===============================
  // FETCH PEGAWAI
  // ===============================
  const fetchPegawais = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/pegawais", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mapped: Pegawai[] = (res.data.data ?? res.data).map((p: any) => ({
        id: p.id,
        name: p.name,
        company_id: p.company_id ?? p.company?.id ?? null,
      }));

      // Jika admin → langsung filter company
      if (dashboardType === "admin") {
        const filtered = mapped.filter(
          (p) => String(p.company_id) === String(userCompanyId)
        );
        setPegawais(filtered);
      } else {
        // superadmin → simpan semua dahulu, nanti difilter lewat dropdown
        setPegawais(mapped);
      }
    } catch (err) {
      console.error("Error fetching pegawai:", err);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchPegawais();
  }, []);

  // FILTER PEGAWAI
  const filteredPegawai =
    dashboardType === "admin"
      ? pegawais // admin langsung pakai pegawainya sendiri
      : pegawais.filter(
          (p) => String(p.company_id) === String(form.company_id)
        );

  // ===============================
  // HANDLE CHANGE
  // ===============================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "company_id") {
      setForm({ ...form, company_id: value, pegawai_id: "" });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  // ===============================
  // VALIDATION
  // ===============================
  const validate = () => {
    const newErrors = {
      company_id: "",
      pegawai_id: "",
      nominal: "",
      keperluan: "",
      tanggal: "",
      nomor_rekening: "",
    };
    let isValid = true;

    if (!form.company_id) {
      newErrors.company_id = "Pilih company";
      isValid = false;
    }
    if (!form.pegawai_id) {
      newErrors.pegawai_id = "Pilih pegawai";
      isValid = false;
    }
    if (!form.nominal) {
      newErrors.nominal = "Nominal wajib diisi";
      isValid = false;
    }
    if (!form.keperluan) {
      newErrors.keperluan = "Keperluan wajib diisi";
      isValid = false;
    }
    if (!form.tanggal) {
      newErrors.tanggal = "Tanggal wajib diisi";
      isValid = false;
    }

    if (form.metode_pengiriman === "transfer" && !form.nomor_rekening) {
      newErrors.nomor_rekening = "Nomor rekening wajib diisi";
      isValid = false;
    }


    setErrors(newErrors);
    return isValid;
  };

  // ===============================
  // SUBMIT
  // ===============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await api.post(
        "/kasbon",
        {
          ...form,
          tanggal: form.tanggal ? form.tanggal.toISOString().slice(0, 10) : null,
          nominal: Number(form.nominal),
          status: "pending",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );


      Swal.fire("Berhasil!", "Kasbon berhasil ditambahkan.", "success").then(() =>
        navigate("/kasbon")
      );
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", "Terjadi kesalahan.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Tambah Kasbon Pegawai" description="Add kasbon pegawai" />

      <PageHeader
        pageTitle="Tambah Kasbon Pegawai"
        titleClass="text-[32px]"
        rightContent={
          <button
            onClick={() => navigate("/kasbon")}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-5 py-2 rounded-xl"
          >
            ⬅ Back
          </button>
        }
      />

      <div className="space-y-5 mt-4">
        <ComponentCard title="Form Kasbon Pegawai">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Company → hanya muncul untuk superadmin */}
            {dashboardType === "superadmin" && (
              <div>
                <Label>Company</Label>
                <select
                  name="company_id"
                  value={form.company_id}
                  onChange={handleChange}
                  className="
                  w-full border px-3 py-2 rounded
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-gray-100
                  border-gray-300 dark:border-gray-600"
                >
                  <option value="">-- Pilih Company --</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.company_id && (
                  <p className="text-red-500">{errors.company_id}</p>
                )}
              </div>
            )}

            {/* Pegawai */}
            <div>
              <Label>Pegawai</Label>
              <select
                name="pegawai_id"
                value={form.pegawai_id}
                onChange={handleChange}
                className="
                  w-full border px-3 py-2 rounded
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-gray-100
                  border-gray-300 dark:border-gray-600
                  disabled:bg-gray-200 dark:disabled:bg-gray-700"
                disabled={
                  dashboardType === "superadmin" && !form.company_id
                }
              >
                <option value="">
                  {dashboardType === "admin"
                    ? "-- Pilih Pegawai --"
                    : form.company_id
                    ? "-- Pilih Pegawai --"
                    : "Pilih company dulu"}
                </option>

                {filteredPegawai.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.pegawai_id && (
                <p className="text-red-500">{errors.pegawai_id}</p>
              )}
            </div>

            {/* NOMINAL */}
            <div>
              <Label>Nominal</Label>
              <Input
                type="number"
                name="nominal"
                value={form.nominal}
                onChange={handleChange}
                placeholder="Masukkan nominal kasbon"
              />
              {errors.nominal && (
                <p className="text-red-500">{errors.nominal}</p>
              )}
            </div>

            {/* KEPERLUAN */}
            <div>
              <Label>Keperluan</Label>
              <Input
                name="keperluan"
                value={form.keperluan}
                onChange={handleChange}
                placeholder="Masukkan keperluan"
              />
              {errors.keperluan && (
                <p className="text-red-500">{errors.keperluan}</p>
              )}
            </div>

            {/* METODE PENGIRIMAN */}
            <div>
              <Label>Metode Pengiriman</Label>
              <select
                name="metode_pengiriman"
                value={form.metode_pengiriman}
                onChange={handleChange}
                className="
                  w-full border px-3 py-2 rounded
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-gray-100
                  border-gray-300 dark:border-gray-600"
              >
                <option value="cash">Cash</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>

            {form.metode_pengiriman === "transfer" && (
              <div>
                <Label>Nomor Rekening</Label>
                <Input
                  name="nomor_rekening"
                  value={form.nomor_rekening}
                  onChange={handleChange}
                  placeholder="Masukkan nomor rekening"
                />
                {errors.nomor_rekening && (
                  <p className="text-red-500">{errors.nomor_rekening}</p>
                )}
              </div>
            )}

            {/* TANGGAL */}
            <div>
              <Label>Tanggal</Label>
              <DatePicker
                selected={form.tanggal}
                onChange={(date: Date | null) => setForm({ ...form, tanggal: date })}
                className="w-full border px-3 py-2 rounded 
                text-gray-900 dark:text-gray-100
                bg-white dark:bg-gray-800
                border-gray-300 dark:border-gray-600"
                dateFormat="yyyy-MM-dd"
                placeholderText="Pilih tanggal"
                calendarClassName="dark:bg-gray-800 dark:text-white"
              />
              {errors.tanggal && (
                <p className="text-red-500">{errors.tanggal}</p>
              )}
            </div>

            {/* SUBMIT */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`${
                  loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                } text-white px-6 py-2 rounded-xl`}
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
