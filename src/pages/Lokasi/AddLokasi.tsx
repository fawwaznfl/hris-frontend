import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

interface Company {
  id: number;
  name: string;
}

export default function AddLokasi() {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const dashboardType = localStorage.getItem("dashboard_type");
  const userCompanyId = localStorage.getItem("user_company_id");


  const [form, setForm] = useState({
    company_id: "",
    nama_lokasi: "",
    lat_kantor: "",
    long_kantor: "",
    radius: "",
    status: "active",
    keterangan: "",
  });

  // Fetch Company
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
    fetchCompanies();
  }, []);

  useEffect(() => {
  if (dashboardType === "admin" && userCompanyId) {
    setForm((prev) => ({ ...prev, company_id: userCompanyId }));
  }
}, [dashboardType, userCompanyId]);


  // Handle form change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      await api.post("/lokasis", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire("Berhasil!", "Lokasi berhasil ditambahkan.", "success");
      navigate("/lokasi");
    } catch (err: any) {
      console.error("API Error:", err.response?.data);

      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Terjadi kesalahan.",
        "error"
      );
    }
  };

  return (
    <>
      <PageMeta title="Tambah Lokasi" description="Tambah lokasi kantor" />

      <PageHeader
        pageTitle="Tambah Lokasi"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <button
            onClick={() => navigate("/lokasi")}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-5 py-2 rounded-xl"
          >
            Kembali
          </button>
        }
      />

      <ComponentCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Company */}
          {dashboardType === "superadmin" && (
          <div>
            <label className="text-gray-700 dark:text-gray-200">Perusahaan</label>
            <select
              name="company_id"
              value={form.company_id}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:text-white"
              required
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
          {/* Nama Lokasi */}
          <div>
            <label className="text-gray-700 dark:text-gray-200">Nama Lokasi</label>
            <input
              type="text"
              name="nama_lokasi"
              value={form.nama_lokasi}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div className="text-gray-700 dark:text-gray-200">
            {/* Latitude */}
            <div>
              <label className="block font-semibold mb-1">Latitude</label>
              <input
                type="text"
                name="lat_kantor"
                value={form.lat_kantor}
                onChange={handleChange}
                className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            {/* Longitude */}
            <div>
              <label className="block font-semibold mb-1">Longitude</label>
              <input
                type="text"
                name="long_kantor"
                value={form.long_kantor}
                onChange={handleChange}
                className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Radius */}
          <div>
            <label className="text-gray-700 dark:text-gray-200">Radius (meter)</label>
            <input
              type="number"
              name="radius"
              value={form.radius}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-gray-700 dark:text-gray-200">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Keterangan */}
          <div>
            <label className="text-gray-700 dark:text-gray-200">Keterangan</label>
            <textarea
              name="keterangan"
              value={form.keterangan}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:text-white"
              rows={3}
            ></textarea>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Simpan
          </button>
        </form>
      </ComponentCard>
    </>
  );
}
