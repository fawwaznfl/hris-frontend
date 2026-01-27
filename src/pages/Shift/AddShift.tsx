import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";

export default function AddShift() {
  const navigate = useNavigate();

  const [nama, setNama] = useState("");
  const [jamMasuk, setJamMasuk] = useState("");
  const [jamPulang, setJamPulang] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambil role dan company user
  const dashboardType = localStorage.getItem("dashboard_type");
  const userCompanyId = localStorage.getItem("company_id");

  // Fetch companies hanya jika superadmin
  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(res.data.data);
    } catch (err) {
      console.error("Error fetching companies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dashboardType === "superadmin") {
      fetchCompanies();
    } else {
      // Admin → otomatis set companyId user
      const storedCompanyId = localStorage.getItem("company_id");
      console.log("Dashboard Type:", dashboardType);
      console.log("Stored Company ID:", storedCompanyId);
      setCompanyId(storedCompanyId || "");
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Validasi umum
    if (!nama || !jamMasuk || !jamPulang) {
      Swal.fire("Gagal", "Semua field wajib diisi!", "error");
      return;
    }

    // Validasi company hanya untuk superadmin
    if (dashboardType === "superadmin" && !companyId) {
      Swal.fire("Gagal", "Company wajib dipilih!", "error");
      return;
    }

    // DEBUG: Cek payload sebelum kirim
    console.log("Payload yang akan dikirim:", {
      nama,
      jam_masuk: jamMasuk,
      jam_pulang: jamPulang,
      company_id: companyId,
    });

    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/shifts",
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

      Swal.fire("Berhasil", "Shift berhasil ditambahkan.", "success");
      navigate("/shift");
    } catch (err: any) {
      console.error("API Error:", err.response?.data);
      Swal.fire("Gagal", "Terjadi kesalahan saat menambah shift.", "error");
    }
  };

  // USER INTERFACE
  return (
    <>
      <PageMeta title="Tambah Shift" description="Tambah Shift Baru" />
      <PageHeader
        pageTitle="Tambah Shift"
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
                  placeholder="Masukkan nama shift"
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

              {/* Company (hanya superadmin) */}
              {dashboardType === "superadmin" && (
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
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl"
                >
                  Simpan
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
