import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function AddInventory() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const dashboardType = user.dashboard_type;
  const userCompanyId = user.company_id;

  // Generate Kode Barang
  const generateKodeBarang = () => {
    const random = Math.floor(10000 + Math.random() * 90000);
    return `BRG-${random}`;
  };

  // State Form
  const [form, setForm] = useState({
  kode_barang: generateKodeBarang(),
  nama_barang: "",
  stok: "",
  satuan: "",
  lokasi_id: "",
  divisi_id: "",
  company_id: dashboardType === "admin" ? String(userCompanyId) : "",
  status: "tersedia",
  tanggal_masuk: new Date().toISOString().split("T")[0],
  keterangan: "",
});


  // State Master Data
  const [companies, setCompanies] = useState<any[]>([]);
  const [lokasi, setLokasi] = useState<any[]>([]);
  const [divisi, setDivisi] = useState<any[]>([]);
  const [filteredLokasi, setFilteredLokasi] = useState<any[]>([]);
  const [filteredDivisi, setFilteredDivisi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const normalizeResponse = (res: any) => {
    return res?.data?.data || res?.data || [];
  };

  // Fetch Master Data

  const fetchMasterData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      let comp: any[] = [];
      
      // 🚫 ADMIN tidak boleh fetch companies
      if (dashboardType === "superadmin") {
        const resComp = await api.get("/companies", { headers });
        comp = normalizeResponse(resComp);
      }

      const [lok, div] = await Promise.all([
        api.get("/lokasis", { headers }),
        api.get("/divisis", { headers }),
      ]);

      setCompanies(comp);
      setLokasi(normalizeResponse(lok));
      setDivisi(normalizeResponse(div));

    } catch (error) {
      console.error("Fetch master data error:", error);
      Swal.fire("Error", "Gagal memuat data master!", "error");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
  if (dashboardType === "admin" && userCompanyId) {
    const fl = lokasi.filter((l) => l.company_id == userCompanyId);
    const fd = divisi.filter((d) => d.company_id == userCompanyId);

    setFilteredLokasi(fl);
    setFilteredDivisi(fd);
  }
}, [lokasi, divisi, dashboardType, userCompanyId]);


  // Filter lokasi & divisi by company
  useEffect(() => {
    if (!form.company_id) {
      setFilteredLokasi([]);
      setFilteredDivisi([]);
      return;
    }

    const fl = lokasi.filter((l) => l.company_id == form.company_id);
    const fd = divisi.filter((d) => d.company_id == form.company_id);

    setFilteredLokasi(fl);
    setFilteredDivisi(fd);

    // Reset lokasi & divisi ketika pilih company
    setForm((prev) => ({
      ...prev,
      lokasi_id: "",
      divisi_id: "",
      kode_barang: generateKodeBarang(),
    }));
  }, [form.company_id, lokasi, divisi]);

  // Handle Input Change
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit Form
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const headers = { Authorization: `Bearer ${token}` };

      console.log("PAYLOAD DIKIRIM:", form);

      await api.post("/inventory", form, { headers });

      Swal.fire("Berhasil", "Data inventory berhasil ditambahkan", "success");
      navigate("/inventory");
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", "Periksa kembali input data!", "error");
    }
  };

  // UI FORM
  return (
    <>
      <PageMeta title="Tambah Inventory" description="Tambah data inventory" />

      <PageHeader
        pageTitle="Tambah Inventory"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <button
            onClick={() => navigate("/inventory")}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-5 py-2 rounded-xl"
          >
            Kembali
          </button>
        }
      />

      <ComponentCard className="dark:bg-gray-800 dark:border-gray-700 p-6">
        {loading ? (
          <p className="text-gray-700 dark:text-gray-300">Loading...</p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Kode Barang */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1 dark:text-white">
                Kode Barang
              </label>
              <input
                name="kode_barang"
                value={form.kode_barang}
                onChange={handleChange}
                required
                className="border px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Nama Barang */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1 dark:text-white">
                Nama Barang
              </label>
              <input
                name="nama_barang"
                value={form.nama_barang}
                onChange={handleChange}
                required
                className="border px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Stok */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1 dark:text-white">
                Stok
              </label>
              <input
                type="number"
                name="stok"
                value={form.stok}
                onChange={handleChange}
                required
                className="border px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Satuan */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1 dark:text-white">
                Satuan
              </label>
              <input
                name="satuan"
                value={form.satuan}
                onChange={handleChange}
                required
                placeholder="pcs / unit / box"
                className="border px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Company */}
            {dashboardType === "superadmin" && (
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1 dark:text-white">
                  Company
                </label>
                <select
                  name="company_id"
                  value={form.company_id}
                  onChange={handleChange}
                  required
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

            {/* ADMIN → tidak tampilkan dropdown tetapi kirimkan nilai hidden */}
            {dashboardType === "admin" && (
              <input type="hidden" name="company_id" value={form.company_id} />
            )}


            {/* Lokasi */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1 dark:text-white">
                Lokasi
              </label>
              <select
                name="lokasi_id"
                value={form.lokasi_id}
                onChange={handleChange}
                className="border px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">Pilih Lokasi</option>

                {filteredLokasi.length === 0 ? (
                  <option disabled>Tidak ada data</option>
                ) : (
                  filteredLokasi.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nama_lokasi}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Divisi */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1 dark:text-white">
                Divisi
              </label>
              <select
                name="divisi_id"
                value={form.divisi_id}
                onChange={handleChange}
                className="border px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">Pilih Divisi</option>

                {filteredDivisi.length === 0 ? (
                  <option disabled>Tidak ada data</option>
                ) : (
                  filteredDivisi.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nama_divisi || d.nama}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Keterangan */}
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-medium mb-1 dark:text-white">
                Keterangan
              </label>
              <textarea
                name="keterangan"
                value={form.keterangan}
                onChange={handleChange}
                rows={3}
                className="border px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white"
              ></textarea>
            </div>

            {/* Submit */}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl"
              >
                Simpan
              </button>
            </div>
          </form>
        )}
      </ComponentCard>
    </>
  );
}
