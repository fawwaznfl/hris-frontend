import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import api from "../../api/axios";
import Swal from "sweetalert2";

export default function EditCompany() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    alamat: "",
    telepon: "",
    email: "",
    website: "",
  });

  const [loading, setLoading] = useState(true);

  const fetchCompany = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/companies/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setForm(res.data.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", "Tidak bisa memuat data perusahaan", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      await api.put(`/companies/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire("Berhasil!", "Data perusahaan berhasil diperbarui.", "success");
      navigate("/company");
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", "Terjadi kesalahan saat update perusahaan.", "error");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-5 bg-white dark:bg-gray-800 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Edit Perusahaan</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div>
          <label className="block font-medium dark:text-gray-200">Nama</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block font-medium dark:text-gray-200">Alamat</label>
          <textarea
            name="alamat"
            value={form.alamat}
            onChange={handleChange}
            className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
          ></textarea>
        </div>

        <div>
          <label className="block font-medium dark:text-gray-200">Telepon</label>
          <input
            type="text"
            name="telepon"
            value={form.telepon}
            onChange={handleChange}
            className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block font-medium dark:text-gray-200">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block font-medium dark:text-gray-200">Website</label>
          <input
            type="text"
            name="website"
            value={form.website}
            onChange={handleChange}
            className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
        >
          Simpan Perubahan
        </button>

      </form>
    </div>
  );
}
