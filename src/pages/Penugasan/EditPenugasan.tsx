import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import Swal from "sweetalert2";

export default function EditPenugasan() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const [pegawaiList, setPegawaiList] = useState<any[]>([]);
  const [pegawaiFiltered, setPegawaiFiltered] = useState<any[]>([]);

  const [selectedCompany, setSelectedCompany] = useState<number | "">("");
  const [selectedPegawai, setSelectedPegawai] = useState<number | "">("");
  const [judul, setJudul] = useState("");
  const [rincian, setRincian] = useState("");
  const [status, setStatus] = useState("pending");

  const [loading, setLoading] = useState(true);

  // Fetch Companies
  const fetchCompanies = async () => {
    const token = localStorage.getItem("token");
    const res = await api.get("/companies", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCompanies(res.data.data);
  };

  // Fetch Pegawai
  const fetchPegawais = async () => {
    const token = localStorage.getItem("token");
    const res = await api.get("/pegawais", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const mapped = (res.data.data ?? res.data).map((p: any) => ({
      id: p.id,
      name: p.name,
      company_id: p.company_id ?? p.company?.id ?? null,
    }));

    setPegawaiList(mapped);
  };

  // Fetch existing penugasan
  const fetchDetail = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get(`/penugasan/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const d = res.data.data;

      setSelectedCompany(d.company_id);
      setSelectedPegawai(d.pegawai_id);
      setJudul(d.judul_pekerjaan);
      setRincian(d.rincian_pekerjaan);
      setStatus(d.status);

      setLoading(false);
    } catch (e) {
      Swal.fire("Error", "Gagal mengambil data penugasan.", "error");
      navigate("/penugasan");
    }
  };

  // Init fetch
  useEffect(() => {
    fetchCompanies();
    fetchPegawais();
    fetchDetail();
  }, []);

  // Update pegawai list ketika company berubah
  useEffect(() => {
    if (!selectedCompany) {
      setPegawaiFiltered([]);
      return;
    }

    const filtered = pegawaiList.filter(
      (p) => p.company_id === Number(selectedCompany)
    );

    setPegawaiFiltered(filtered);
  }, [selectedCompany, pegawaiList]);

  // Submit Update
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!selectedCompany || !selectedPegawai || !judul) {
      Swal.fire("Error", "Semua field wajib diisi!", "warning");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/penugasan/${id}`,
        {
          company_id: selectedCompany,
          pegawai_id: selectedPegawai,
          judul_pekerjaan: judul,
          rincian_pekerjaan: rincian,
          status: status,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire("Berhasil!", "Penugasan berhasil diperbarui.", "success");
      navigate("/penugasan");
    } catch (err) {
      Swal.fire("Error", "Gagal menyimpan perubahan.", "error");
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-300 mt-10">
        Loading...
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Edit Penugasan" description="Edit Penugasan" />

      <PageHeader
        pageTitle="Edit Penugasan"
        titleClass="text-[32px] dark:text-white"
      />

      <ComponentCard className="p-6 dark:bg-gray-800 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* COMPANY */}
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

          {/* PEGAWAI */}
          <div>
            <label className="block mb-1 font-medium dark:text-white">
              Pegawai
            </label>
            <select
              value={selectedPegawai}
              onChange={(e) => setSelectedPegawai(Number(e.target.value))}
              className="border w-full px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white"
              disabled={!selectedCompany}
            >
              <option value="">
                {selectedCompany
                  ? "-- Pilih Pegawai --"
                  : "Pilih company dahulu"}
              </option>

              {pegawaiFiltered.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}

              {selectedCompany && pegawaiFiltered.length === 0 && (
                <option>Tidak ada pegawai</option>
              )}
            </select>
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
            ></textarea>
          </div>

          {/* STATUS */}
          <div>
            <label className="block mb-1 font-medium dark:text-white">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border px-3 py-2 w-full rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="pending">Pending</option>
              <option value="process">Process</option>
              <option value="finish">Finish</option>
            </select>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl"
          >
            Simpan Perubahan
          </button>
        </form>
      </ComponentCard>
    </>
  );
}
