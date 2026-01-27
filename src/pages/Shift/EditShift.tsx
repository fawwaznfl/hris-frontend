import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import { useNavigate, useParams } from "react-router";
import Swal from "sweetalert2";

export default function EditShift() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [nama, setNama] = useState("");
  const [jamMasuk, setJamMasuk] = useState("");
  const [jamPulang, setJamPulang] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch companies
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

  // Fetch detail shift untuk edit
  const fetchDetail = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get(`/shifts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const d = res.data.data;

      setNama(d.nama);
      setJamMasuk(d.jam_masuk?.slice(0, 5)); // ambil HH:MM saja
      setJamPulang(d.jam_pulang?.slice(0, 5));
      setCompanyId(d.company_id || "");
    } catch (err) {
      console.error("Error fetching shift:", err);
      Swal.fire("Error", "Data shift tidak ditemukan.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchDetail();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!nama || !jamMasuk || !jamPulang || !companyId) {
      Swal.fire("Gagal", "Semua field wajib diisi!", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/shifts/${id}`,
        {
          nama,
          jam_masuk: jamMasuk,
          jam_pulang: jamPulang,
          company_id: companyId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire("Berhasil", "Shift berhasil diperbarui.", "success");
      navigate("/shift");
    } catch (err: any) {
      console.error("API Error:", err.response?.data);
      Swal.fire("Gagal", "Terjadi kesalahan saat mengedit shift.", "error");
    }
  };

  return (
    <>
      <PageMeta title="Edit Shift" description="Edit Shift" />
      <PageHeader
        pageTitle="Edit Shift"
        titleClass="text-[32px] dark:text-white"
      />

      <div className="space-y-5 sm:space-y-6">
        <ComponentCard className="dark:bg-gray-800 dark:border-gray-700 p-6">

          {loading ? (
            <p className="text-gray-700 dark:text-gray-300">Loading...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Nama Shift */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1 dark:text-white">
                  Nama Shift
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="border px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Jam Masuk */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1 dark:text-white">
                  Jam Masuk
                </label>
                <input
                  type="time"
                  value={jamMasuk}
                  onChange={(e) => setJamMasuk(e.target.value)}
                  className="border px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Jam Pulang */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1 dark:text-white">
                  Jam Pulang
                </label>
                <input
                  type="time"
                  value={jamPulang}
                  onChange={(e) => setJamPulang(e.target.value)}
                  className="border px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Company */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1 dark:text-white">
                  Company
                </label>
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="border px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Pilih Company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl"
                >
                  Update
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/shift")}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-xl"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
