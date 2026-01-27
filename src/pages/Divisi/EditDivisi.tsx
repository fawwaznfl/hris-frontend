import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router";

export default function EditDivisi() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    nama: "",
    company_id: "",
  });

  // Fetch Companies
  const fetchCompanies = async () => {
    const token = localStorage.getItem("token");
    const res = await api.get("/companies", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCompanies(res.data.data);
  };

  // Fetch Data Divisi by ID
  const fetchDivisi = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/divisis/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setForm({
        nama: res.data.data.nama,
        company_id: res.data.data.company_id,
      });
    } catch (err) {
      console.error("Error fetching divisi:", err);
      Swal.fire("Gagal", "Data divisi tidak ditemukan!", "error");
      navigate("/divisi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchDivisi();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit update
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!form.nama || !form.company_id) {
      Swal.fire("Gagal", "Nama divisi & perusahaan wajib diisi!", "warning");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/divisis/${id}`,
        {
          nama: form.nama,
          company_id: form.company_id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire("Berhasil", "Divisi berhasil diperbarui!", "success");
      navigate("/divisi");
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", "Terjadi kesalahan saat mengubah divisi.", "error");
    }
  };

  return (
    <>
      <PageMeta title="Edit Divisi" description="Edit Divisi" />

      <PageHeader
        pageTitle="Edit Divisi"
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
        <ComponentCard title="Form Edit Divisi" className="dark:bg-gray-800 dark:border-gray-700">
          {loading ? (
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Nama Divisi */}
              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">
                  Nama Divisi
                </label>
                <input
                  type="text"
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Masukkan nama divisi..."
                />
              </div>

              {/* Company */}
              <div>
                <label className="text-gray-700 dark:text-gray-200">Perusahaan</label>
                <select
                  name="company_id"
                  value={form.company_id}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option className="text-gray-700 dark:text-gray-200" value="">
                    -- Pilih Perusahaan --
                  </option>

                  {companies.map((c) => (
                    <option
                      key={c.id}
                      value={c.id}
                      className="text-gray-700 dark:text-gray-200"
                    >
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
