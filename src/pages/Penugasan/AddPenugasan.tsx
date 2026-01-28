import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

type Pegawai = {
  id: number;
  name: string;
  company_id: number | null;
};

export default function AddPenugasan() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const dashboardType = user.dashboard_type; // "superadmin" / "admin"
  const userCompanyId = user.company_id;

  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [pegawaiFiltered, setPegawaiFiltered] = useState<Pegawai[]>([]);

  const [selectedCompany, setSelectedCompany] = useState<number | "">(
    dashboardType === "admin" ? userCompanyId : ""
  );

  const [selectedPegawai, setSelectedPegawai] = useState("");
  const [judul, setJudul] = useState("");
  const [rincian, setRincian] = useState("");
  const [loadingPegawai, setLoadingPegawai] = useState(false);

  // ========== FETCH COMPANIES (SUPERADMIN ONLY) ==========
  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(res.data.data);
    } catch {
      setCompanies([]);
    }
  };

  // ========== FETCH PEGAWAI ==========
  const fetchPegawais = async () => {
    try {
      setLoadingPegawai(true);

      const token = localStorage.getItem("token");
      const res = await api.get("/pegawais", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mapped: Pegawai[] = (res.data.data ?? res.data).map((p: any) => ({
        id: p.id,
        name: p.name,
        company_id: p.company_id ?? p.company?.id ?? null,
      }));

      if (dashboardType === "admin") {
        // Admin hanya boleh lihat pegawai dari company-nya
        const filtered = mapped.filter(
          (p) => p.company_id === Number(userCompanyId)
        );
        setPegawaiList(filtered);
      } else {
        setPegawaiList(mapped);
      }
    } catch (err) {
      console.error("Error fetching pegawai:", err);
      setPegawaiList([]);
    } finally {
      setLoadingPegawai(false);
    }
  };

  // Fetch awal
  useEffect(() => {
    if (dashboardType === "superadmin") fetchCompanies();
    fetchPegawais();
  }, []);

  // ========== FILTER PEGAWAI (SUPERADMIN & ADMIN) ==========
  useEffect(() => {
    if (!selectedCompany) {
      setPegawaiFiltered([]);
      return;
    }

    const filtered = pegawaiList.filter(
      (p: Pegawai) => p.company_id === Number(selectedCompany)
    );

    setPegawaiFiltered(filtered);
  }, [selectedCompany, pegawaiList]);

  // ========== SUBMIT ==========
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!selectedCompany || !selectedPegawai || !judul || !rincian) {
      Swal.fire("Gagal", "Semua field harus diisi.", "warning");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/penugasan",
        {
          company_id: selectedCompany,
          pegawai_id: selectedPegawai,
          judul_pekerjaan: judul,
          rincian_pekerjaan: rincian,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Berhasil", "Penugasan berhasil ditambahkan!", "success");
      navigate("/penugasan");
    } catch (err) {
      Swal.fire("Error", "Gagal menambahkan penugasan.", "error");
    }
  };

  return (
    <>
      <PageMeta title="Tambah Penugasan" description="Tambah data penugasan" />
      <PageHeader
        pageTitle="Tambah Penugasan"
        titleClass="text-[32px] dark:text-white"
      />

      <ComponentCard className="p-6 dark:bg-gray-800 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SHOW COMPANY ONLY FOR SUPERADMIN */}
          {dashboardType === "superadmin" && (
            <div>
              <label className="block mb-1 font-medium dark:text-white">
                Company
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(Number(e.target.value))}
                className="border w-full px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white"
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
            <label className="block mb-1 font-medium dark:text-white">
              Nama Pegawai
            </label>

            {loadingPegawai ? (
              <div className="text-gray-600 dark:text-gray-300">
                Loading pegawai...
              </div>
            ) : (
              <select
                value={selectedPegawai}
                onChange={(e) => setSelectedPegawai(e.target.value)}
                className="border w-full px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">-- Pilih Pegawai --</option>

                {pegawaiFiltered.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* JUDUL */}
          <div>
            <label className="block mb-1 font-medium dark:text-white">
              Judul Pekerjaan
            </label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="border w-full px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="Masukkan judul pekerjaan..."
            />
          </div>

          {/* RINCIAN */}
          <div>
            <label className="block mb-1 font-medium dark:text-white">
              Rincian Pekerjaan
            </label>
            <textarea
              value={rincian}
              onChange={(e) => setRincian(e.target.value)}
              className="border w-full px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white h-32"
              placeholder="Masukkan rincian pekerjaan..."
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-medium"
          >
            Simpan Penugasan
          </button>
        </form>
      </ComponentCard>
    </>
  );
}
