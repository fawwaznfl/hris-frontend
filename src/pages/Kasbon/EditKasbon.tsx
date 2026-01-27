// --- IMPORT ---
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import Swal from "sweetalert2";
import Label from "../../components/form/Label";
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

export default function EditKasbon() {
  const navigate = useNavigate();
  const { id } = useParams(); // <-- ambil kasbon_id dari URL

  const [form, setForm] = useState({
    company_id: "",
    pegawai_id: "",
    nominal: "",
    keperluan: "",
    tanggal: "",
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
    metode_pengiriman: "",
    nomor_rekening: "",
  });

  // =====================================
  // FETCH EXISTING DATA
  // =====================================
  const fetchKasbon = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get(`/kasbon/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data.data;

      setForm({
        company_id: data.company_id?.toString() ?? "",
        pegawai_id: data.pegawai_id?.toString() ?? "",
        nominal: data.nominal?.toString() ?? "",
        keperluan: data.keperluan ?? "",
        tanggal: data.tanggal ?? "",
        metode_pengiriman: data.metode_pengiriman ?? "cash",
        nomor_rekening: data.nomor_rekening ?? "",
      });
    } catch (err) {
      console.error("Error fetching kasbon:", err);
      Swal.fire("Gagal", "Data kasbon tidak ditemukan!", "error").then(() => {
        navigate("/kasbon");
      });
    }
  };

  // =====================================
  // FETCH COMPANIES & PEGAWAI
  // =====================================
  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  const fetchPegawais = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/pegawais", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mapped = res.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        company_id: p.company_id,
      }));

      setPegawais(mapped);
    } catch (err) {
      console.error("Error fetching pegawai:", err);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchPegawais();
    fetchKasbon();
  }, []);

  // =====================================
  // HANDLE CHANGE
  // =====================================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "company_id") {
      setForm({ ...form, company_id: value, pegawai_id: "" });
      return;
    }

    if (name === "metode_pengiriman") {
      setForm({
        ...form,
        metode_pengiriman: value,
        nomor_rekening: value === "cash" ? "" : form.nomor_rekening,
      });
      return;
    }


    setForm({ ...form, [name]: value });
  };

  // =====================================
  // VALIDATION
  // =====================================
  const validate = () => {
    const newErrors = {
      company_id: "",
      pegawai_id: "",
      nominal: "",
      keperluan: "",
      tanggal: "",
      metode_pengiriman: "",
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

    if (!form.metode_pengiriman) {
      newErrors.metode_pengiriman = "Pilih metode pengiriman";
      isValid = false;
    }

    if (
      form.metode_pengiriman === "transfer" &&
      !form.nomor_rekening
    ) {
      newErrors.nomor_rekening = "Nomor rekening wajib diisi";
      isValid = false;
    }


    setErrors(newErrors);
    return isValid;
  };

  // =====================================
  // SUBMIT EDIT
  // =====================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await api.put(
        `/kasbon/${id}`,
        {
          ...form,
          nominal: Number(form.nominal),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Berhasil!", "Kasbon berhasil diperbarui.", "success").then(() =>
        navigate("/kasbon")
      );
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", "Terjadi kesalahan.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredPegawai = pegawais.filter(
    (p) => String(p.company_id) === String(form.company_id)
  );

  return (
    <>
      <PageMeta title="Edit Kasbon Pegawai" description="Edit kasbon pegawai" />

      <PageHeader
        pageTitle="Edit Kasbon Pegawai"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <button
            onClick={() => navigate("/kasbon")}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-5 py-2 rounded-xl"
          >
            ⬅ Back
          </button>
        }
      />

      <div className="space-y-5 sm:space-y-6 mt-4">
        <ComponentCard title="Edit Kasbon Pegawai">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Company */}
            <div>
              <Label>Company</Label>
              <select
                name="company_id"
                value={form.company_id}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">-- Pilih Company --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.company_id && <p className="text-red-500">{errors.company_id}</p>}
            </div>

            {/* Pegawai */}
            <div>
              <Label>Pegawai</Label>
              <select
                name="pegawai_id"
                value={form.pegawai_id}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">-- Pilih Pegawai --</option>
                {filteredPegawai.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {errors.pegawai_id && <p className="text-red-500">{errors.pegawai_id}</p>}
            </div>

            {/* Nominal */}
            <div>
              <Label>Nominal</Label>
              <Input
                type="number"
                name="nominal"
                value={form.nominal}
                onChange={handleChange}
                placeholder="Masukkan nominal kasbon"
              />
              {errors.nominal && <p className="text-red-500">{errors.nominal}</p>}
            </div>

            {/* Keperluan */}
            <div>
              <Label>Keperluan</Label>
              <Input
                name="keperluan"
                value={form.keperluan}
                onChange={handleChange}
                placeholder="Masukkan keperluan"
              />
              {errors.keperluan && <p className="text-red-500">{errors.keperluan}</p>}
            </div>

            {/* Metode Pengiriman */}
            <div>
              <Label>Metode Pengiriman</Label>
              <select
                name="metode_pengiriman"
                value={form.metode_pengiriman}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="cash">Cash</option>
                <option value="transfer">Transfer</option>
              </select>
              {errors.metode_pengiriman && (
                <p className="text-red-500">{errors.metode_pengiriman}</p>
              )}
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



            {/* Tanggal */}
            <div>
              <Label>Tanggal</Label>
              <Input
                type="date"
                name="tanggal"
                value={form.tanggal}
                onChange={handleChange}
              />
              {errors.tanggal && <p className="text-red-500">{errors.tanggal}</p>}
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"} text-white px-6 py-2 rounded-xl`}
              >
                {loading ? "Menyimpan..." : "Update"}
              </button>
            </div>

          </form>
        </ComponentCard>
      </div>
    </>
  );
}
