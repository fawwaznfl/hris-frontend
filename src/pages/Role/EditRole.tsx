import { useEffect, useState, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import Swal from "sweetalert2";

interface Role {
  id: number;
  nama: string;
  guard_name?: string;
  created_at?: string;
}

export default function EditRole() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<Role>({
    id: 0,
    nama: "",
    guard_name: "web",
  });
  const [loading, setLoading] = useState(true);

  const fetchRole = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/roles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ ...res.data.data, guard_name: "web" });
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", "Tidak bisa memuat data role", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRole();
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await api.put(`/roles/${id}`, { nama: form.nama }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Berhasil", "Role berhasil diperbarui", "success");
      navigate("/role");
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", "Terjadi kesalahan saat update role", "error");
    }
  };

  if (loading) return <p className="text-gray-700 dark:text-gray-300">Loading...</p>;

  return (
    <>
      <PageMeta title="Edit Role" description="Edit Role" />
      <PageHeader
        pageTitle="Edit Role"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <button
            onClick={() => navigate("/role")}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-5 py-2 rounded-xl"
          >
            ⬅ Back
          </button>
        }
      />

      <div className="space-y-5 sm:space-y-6 mt-4">
        <ComponentCard title="Form Edit Role" className="dark:bg-gray-800 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Nama Role */}
            <div>
              <label className="block font-medium dark:text-gray-200">Nama Role</label>
              <input
                type="text"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Masukkan nama role"
              />
            </div>

            {/* Guard Name */}
            <div>
              <label className="block font-medium dark:text-gray-200">Guard Name</label>
              <input
                type="text"
                name="guard_name"
                value={form.guard_name}
                readOnly
                className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-xl"
            >
              Simpan Perubahan
            </button>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
