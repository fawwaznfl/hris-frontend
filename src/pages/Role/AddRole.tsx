import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import Swal from "sweetalert2";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";

interface Company {
  id: number;
  name: string;
}

export default function AddRole() {
  const navigate = useNavigate();

  const dashboardType = localStorage.getItem("dashboard_type");
  const userCompanyId = localStorage.getItem("company_id");


  const [role, setRole] = useState({
    nama: "",
    company_id: "",
  });

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    nama: "",
    company_id: "",
  });

  // FETCH COMPANIES
  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(res.data.data) ? res.data.data : [];
      setCompanies(data);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setCompanies([]);
    }
  };

  useEffect(() => {
    fetchCompanies();

    // Jika admin, set company_id otomatis & sembunyikan dropdown
    if (dashboardType === "admin") {
      setRole((prev) => ({
        ...prev,
        company_id: userCompanyId || "",
      }));
    }
  }, []);

  // VALIDASI
  const validate = () => {
    const newErrors = { nama: "", company_id: "" };
    let isValid = true;

    if (!role.nama.trim()) {
      newErrors.nama = "Nama role wajib diisi";
      isValid = false;
    }
    // VALIDASI UNTUK COMPANY (HANYA SUPERADMIN)
    if (dashboardType === "superadmin" && !role.company_id) {
      newErrors.company_id = "Pilih company";
      isValid = false;
    }


    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setRole({ ...role, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await api.post("/roles", role, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Role berhasil ditambahkan.",
        confirmButtonColor: "#3085d6",
      }).then(() => navigate("/role"));
    } catch (err) {
      console.error("Error adding role:", err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat menambahkan role.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Add-Role" description="Add Role" />
      <PageHeader
        pageTitle="Tambah Role"
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
        <ComponentCard
          title="Form Tambah Role"
          className="dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="space-y-4">
            
            {/* Company */}
            {dashboardType === "superadmin" && (
              <div>
                <Label>Company</Label>
                <select
                  name="company_id"
                  value={role.company_id}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">-- Pilih Company --</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.company_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.company_id}</p>
                )}
              </div>
            )}

            {/* Nama Role */}
            <div>
              <Label htmlFor="nama">Nama Role</Label>
              <Input
                id="nama"
                name="nama"
                type="text"
                placeholder="Contoh: Admin, HR, Manager"
                value={role.nama}
                onChange={handleChange}
                className={errors.nama ? "border-red-500" : ""}
              />
              {errors.nama && (
                <p className="text-red-500 text-sm mt-1">{errors.nama}</p>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`${
                  loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                } text-white font-medium px-6 py-2 rounded-xl`}
              >
                {loading ? "Menyimpan..." : "Save"}
              </button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
