import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

export default function EditInventory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    kode_barang: "",
    nama_barang: "",
    stok: "",
    satuan: "",
    lokasi_id: "",
    divisi_id: "",
    company_id: "",
    keterangan: "",
  });

  // Master data
  const [companies, setCompanies] = useState<any[]>([]);
  const [lokasi, setLokasi] = useState<any[]>([]);
  const [divisi, setDivisi] = useState<any[]>([]);
  const [filteredLokasi, setFilteredLokasi] = useState<any[]>([]);
  const [filteredDivisi, setFilteredDivisi] = useState<any[]>([]);

  // Normalize Response
  const normalize = (res: any) => res?.data?.data || res?.data || [];

  // ===========================
  // FETCH MASTER DATA
  // ===========================
  const fetchMasterData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [comp, lok, div] = await Promise.all([
        api.get("/companies", { headers }),
        api.get("/lokasis", { headers }),
        api.get("/divisis", { headers }),
      ]);

      setCompanies(normalize(comp));
      setLokasi(normalize(lok));
      setDivisi(normalize(div));
    } catch (err) {
      console.error(err);
    }
  };

  // ===========================
  // FETCH INVENTORY DETAIL
  // ===========================
  const fetchInventoryDetail = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const res = await api.get(`/inventory/${id}`, { headers });
      const data = res.data.data;

      setForm({
        kode_barang: data.kode_barang,
        nama_barang: data.nama_barang,
        stok: data.stok,
        satuan: data.satuan,
        lokasi_id: data.lokasi_id || "",
        divisi_id: data.divisi_id || "",
        company_id: data.company_id || "",
        keterangan: data.keterangan || "",
      });
    } catch (err) {
      console.error("Error fetch detail:", err);
      Swal.fire("Error", "Gagal memuat data inventory!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterData();
    fetchInventoryDetail();
  }, []);

  // ===========================
  // Filter lokasi & divisi ketika company berubah
  // ===========================
  useEffect(() => {
    if (!form.company_id) return;

    const fl = lokasi.filter((l) => l.company_id == form.company_id);
    const fd = divisi.filter((d) => d.company_id == form.company_id);

    setFilteredLokasi(fl);
    setFilteredDivisi(fd);
  }, [form.company_id, lokasi, divisi]);

  // ===========================
  // Handle Change
  // ===========================
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ===========================
  // SUBMIT UPDATE
  // ===========================
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${token}` };

      await api.put(`/inventory/${id}`, form, { headers });

      Swal.fire("Berhasil", "Inventory berhasil diperbarui", "success");
      navigate("/inventory");
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", "Periksa kembali input data!", "error");
    }
  };

  return (
    <>
      <PageMeta title="Edit Inventory" description="Edit data inventory" />

      <PageHeader
        pageTitle="Edit Inventory"
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
                className="border px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white"
                required
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
                {filteredLokasi.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nama_lokasi}
                  </option>
                ))}
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
                {filteredDivisi.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama_divisi || d.nama}
                  </option>
                ))}
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
                Simpan Perubahan
              </button>
            </div>
          </form>
        )}
      </ComponentCard>
    </>
  );
}
