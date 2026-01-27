import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import Swal from "sweetalert2";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";

export default function AddCompany() {
  const navigate = useNavigate();

  const [company, setCompany] = useState({
    name: "",
    alamat: "",
    telepon: "",
    email: "",
    website: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    alamat: "",
    telepon: "",
    email: "",
    website: "",
  });

  const validate = () => {
    const newErrors = { name: "", alamat: "", telepon: "", email: "", website: "" };
    let isValid = true;

    if (!company.name.trim()) {
      newErrors.name = "Nama wajib diisi";
      isValid = false;
    }
    if (!company.alamat.trim()) {
      newErrors.alamat = "Alamat wajib diisi";
      isValid = false;
    }
    if (!company.telepon.trim()) {
      newErrors.telepon = "Telepon wajib diisi";
      isValid = false;
    }
    if (!company.email.trim()) {
      newErrors.email = "Email wajib diisi";
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(company.email)) {
      newErrors.email = "Format email tidak valid";
      isValid = false;
    }
    if (!company.website.trim()) {
      newErrors.website = "Website wajib diisi";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompany({ ...company, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await api.post("/companies", company, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Company berhasil ditambahkan.",
        confirmButtonColor: "#3085d6",
      }).then(() => {
        navigate("/company");
      });
    } catch (err) {
      console.error("Error adding company:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat menambahkan company.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Add-Company" description="Add Company" />

      <PageHeader
        pageTitle="Tambah Company"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <button
            onClick={() => navigate("/company")}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-5 py-2 rounded-xl"
          >
            ⬅ Back
          </button>
        }
      />

      <div className="space-y-5 sm:space-y-6 mt-4">
        <ComponentCard title="Form Tambah Company" className="dark:bg-gray-800 dark:border-gray-700">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Nama perusahaan"
                value={company.name}
                onChange={handleChange}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="alamat">Alamat</Label>
              <Input
                id="alamat"
                name="alamat"
                type="text"
                placeholder="Alamat perusahaan"
                value={company.alamat}
                onChange={handleChange}
                className={errors.alamat ? "border-red-500" : ""}
              />
              {errors.alamat && <p className="text-red-500 text-sm mt-1">{errors.alamat}</p>}
            </div>

            <div>
              <Label htmlFor="telepon">Telepon</Label>
              <Input
                id="telepon"
                name="telepon"
                type="text"
                placeholder="Nomor telepon"
                value={company.telepon}
                onChange={handleChange}
                className={errors.telepon ? "border-red-500" : ""}
              />
              {errors.telepon && <p className="text-red-500 text-sm mt-1">{errors.telepon}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email perusahaan"
                value={company.email}
                onChange={handleChange}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="text"
                placeholder="Website perusahaan"
                value={company.website}
                onChange={handleChange}
                className={errors.website ? "border-red-500" : ""}
              />
              {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
            </div>

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
