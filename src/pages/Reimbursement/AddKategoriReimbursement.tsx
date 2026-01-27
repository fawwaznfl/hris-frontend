import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";

import { PlusCircle, ArrowLeft, Save } from "lucide-react";

export default function AddKategoriReimbursement() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    company_id: "",
    nama: "",
    jumlah: "",
  });

  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Tambahkan ini di atas
  const dashboardType = localStorage.getItem("dashboard_type");
  const userCompanyId = localStorage.getItem("company_id");

  // Fetch companies
  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCompanies(res.data.data);

      // SUPERADMIN -> boleh pilih company
      if (dashboardType === "superadmin") {
        const company_id = localStorage.getItem("company_id");
        if (company_id) {
          setForm((prev) => ({ ...prev, company_id }));
        }
      }

      // ADMIN -> pakai company dari login, tidak boleh diganti
      if (dashboardType === "admin") {
        setForm((prev) => ({
          ...prev,
          company_id: userCompanyId || "",
        }));
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };


  useEffect(() => {
    fetchCompanies();
  }, []);

  // Handle Change
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/kategori-reimbursement",
        {
          company_id: form.company_id,
          nama: form.nama,
          jumlah: form.jumlah ? Number(form.jumlah) : null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Kategori reimbursement berhasil ditambahkan.",
      });

      navigate("/kategori-reimbursement");
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || "Terjadi kesalahan.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Tambah Kategori Reimbursement"
        description="Tambah Kategori Reimbursement"
      />

      <PageHeader
        pageTitle="Tambah Kategori Reimbursement"
        titleClass="text-[28px] dark:text-white"
        rightContent={
          <button
            onClick={() => navigate("/kategori-reimbursement")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <ArrowLeft size={18} /> Kembali
          </button>
        }
      />

      <ComponentCard className="dark:bg-gray-800 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Company */}
          {dashboardType === "superadmin" && (
            <div>
              <label className="text-sm font-medium mb-1 block dark:text-white">
                Company
              </label>
              <select
                name="company_id"
                value={form.company_id}
                onChange={handleChange}
                className="border px-3 py-2 rounded-lg w-full bg-white dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Pilih Company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* Nama */}
          <div>
            <label className="text-sm font-medium mb-1 block dark:text-white">
              Nama Kategori
            </label>
            <input
              type="text"
              name="nama"
              placeholder="Masukkan nama kategori..."
              value={form.nama}
              onChange={handleChange}
              className="border px-3 py-2 rounded-lg w-full bg-white dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* Jumlah */}
          <div>
            <label className="text-sm font-medium mb-1 block dark:text-white">
              Jumlah Maksimal
            </label>
            <input
              type="number"
              name="jumlah"
              placeholder="Masukkan jumlah maksimal..."
              value={form.jumlah}
              onChange={handleChange}
              required
              className="border px-3 py-2 rounded-lg w-full bg-white dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium"
          >
            <Save size={20} />
            {loading ? "Menyimpan..." : "Simpan Kategori"}
          </button>
        </form>
      </ComponentCard>
    </>
  );
}
