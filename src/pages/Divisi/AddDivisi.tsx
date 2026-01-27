import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";

export default function AddDivisi() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<any[]>([]);

  const dashboardType = localStorage.getItem("dashboard_type"); 
  const userCompanyId = localStorage.getItem("user_company_id");

  const [form, setForm] = useState({
    nama: "",
    company_id: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch perusahaan untuk dropdown
  const fetchCompanies = async () => {
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

  useEffect(() => {
    fetchCompanies();
  }, []);

  // On change handler
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit Form
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (dashboardType === "superadmin" && !form.company_id) {
    Swal.fire("Gagal", "Perusahaan wajib dipilih!", "warning");
    return;
  }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/divisis",
        {
          nama: form.nama,
          company_id: dashboardType === "admin"
            ? userCompanyId
            : form.company_id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );


      Swal.fire("Berhasil", "Divisi berhasil ditambahkan", "success");
      navigate("/divisi");

    } catch (err) {
      console.error("Error creating divisi:", err);
      Swal.fire("Gagal", "Terjadi kesalahan saat menambah divisi.", "error");
    }

    setLoading(false);
  };

  return (
    <>
      <PageMeta title="Tambah Divisi" description="Tambah Divisi" />

      <PageHeader
        pageTitle="Tambah Divisi"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <button
            onClick={() => navigate("/divisi")}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-5 py-2 rounded-xl"
          >
            Kembali
          </button>
        }
      />

      <div className="space-y-5 mt-4">
        <ComponentCard title="Form Tambah Divisi" className="dark:bg-gray-800 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Perusahaan */}
            {dashboardType === "superadmin" && (
              <div>
                <label className="text-gray-700 dark:text-gray-200">Perusahaan</label>
                <select
                  name="company_id"
                  value={form.company_id}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">-- Pilih Perusahaan --</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Nama Divisi */}
            <div>
              <label className="text-gray-700 dark:text-gray-200">Nama Divisi</label>
              <input
                type="text"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Masukkan nama divisi..."
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>

          </form>
        </ComponentCard>
      </div>
    </>
  );
}
