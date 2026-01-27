import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import Swal from "sweetalert2";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";

interface Pegawai {
  id: number;
  name: string;
  company_id: number | null;
}

interface Company {
  id: number;
  name: string;
}

export default function EditDokumen() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(true);

  const [existingFile, setExistingFile] = useState<string | null>(null);

  const [form, setForm] = useState({
    company_id: "",
    pegawai_id: "",
    nama_dokumen: "",
    keterangan: "",
    file: null as File | null,
  });

  const [pegawais, setPegawais] = useState<Pegawai[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  const [errors, setErrors] = useState({
    company_id: "",
    pegawai_id: "",
    nama_dokumen: "",
    file: "",
  });

  useEffect(() => {
    if (detailLoading) return;

    // ADMIN
    if (user.dashboard_type === "admin") {
      setForm((prev) => ({
        ...prev,
        company_id: String(user.company_id),
      }));
    }

    // PEGAWAI
    if (user.dashboard_type === "pegawai") {
      setForm((prev) => ({
        ...prev,
        company_id: String(user.company_id),
        pegawai_id: String(user.id),
      }));
    }
  }, [detailLoading]);


  // ===============================
  // FETCH DETAIL
  // ===============================
  const fetchDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/dokumen-pegawai/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const d = res.data.data;
      if (!d) throw new Error("Detail tidak ditemukan");

      setForm({
        company_id: d.company_id || "",
        pegawai_id: d.pegawai_id || "",
        nama_dokumen: d.nama_dokumen || "",
        keterangan: d.keterangan || "",
        file: null,
      });

      setExistingFile(d.file_url ?? null);
    } catch (err) {
      console.error("Error:", err);
      Swal.fire("Error", "Gagal mengambil data detail.", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  // ===============================
  // FETCH COMPANIES
  // ===============================
  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCompanies(res.data.data || []);
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  // ===============================
  // FETCH PEGAWAI
  // ===============================
  const fetchPegawais = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/pegawais", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mapped = res.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        company_id: p.company_id,
      }));

      setPegawais(mapped);
    } catch (err) {
      console.error("Error fetching pegawai:", err);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchPegawais();
    fetchDetail();
  }, []);

  // ===============================
  // HANDLE CHANGE INPUT
  // ===============================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (name === "file" && files) {
      setForm({ ...form, file: files[0] });
      return;
    }

    if (name === "company_id") {
      setForm({ ...form, company_id: value, pegawai_id: "" });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleRemoveFile = () => {
    setForm({ ...form, file: null });
  };

  // VALIDATION
  const validate = () => {
    const newErrors = {
      company_id: "",
      pegawai_id: "",
      nama_dokumen: "",
      file: "",
    };

    let valid = true;

    // SUPERADMIN
    if (user.dashboard_type === "superadmin") {
      if (!form.company_id) {
        newErrors.company_id = "Pilih company";
        valid = false;
      }

      if (!form.pegawai_id) {
        newErrors.pegawai_id = "Pilih pegawai";
        valid = false;
      }
    }

    // ADMIN
    if (user.dashboard_type === "admin") {
      // company auto → tidak perlu validasi
      if (!form.pegawai_id) {
        newErrors.pegawai_id = "Pilih pegawai";
        valid = false;
      }
    }

    // PEGAWAI
    if (user.dashboard_type === "pegawai") {
      // company & pegawai auto → tidak perlu validasi
    }

    if (!form.nama_dokumen || !form.nama_dokumen.trim()) {
      newErrors.nama_dokumen = "Nama dokumen wajib diisi";
      valid = false;
    }

    if (!id && !form.file) {
      newErrors.file = "File wajib diunggah";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // SUBMIT UPDATE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("company_id", form.company_id);
      formData.append("pegawai_id", form.pegawai_id);
      formData.append("nama_dokumen", form.nama_dokumen);
      formData.append("keterangan", form.keterangan);
      if (form.file) formData.append("file", form.file);

      await api.post(`/dokumen-pegawai/${id}?_method=PUT`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire("Berhasil!", "Dokumen berhasil diperbarui.", "success")
        .then(() => navigate("/dokumen-pegawai"));
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", "Terjadi kesalahan.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter pegawai berdasarkan company
  const filteredPegawai = pegawais.filter((p) => {
    if (user.dashboard_type === "superadmin") {
      return String(p.company_id) === String(form.company_id);
    }

    if (user.dashboard_type === "admin") {
      return String(p.company_id) === String(user.company_id);
    }

    if (user.dashboard_type === "pegawai") {
      return p.id === user.id;
    }

    return false;
  });

  if (detailLoading) {
    return <p className="text-gray-600 dark:text-gray-300">Loading data...</p>;
  }

  return (
    <>
      <PageMeta title="Edit Dokumen Pegawai" description="Edit dokumen pegawai" />
      <PageHeader
        pageTitle="Edit Dokumen Pegawai"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <button
            onClick={() => navigate("/dokumen-pegawai")}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-5 py-2 rounded-xl"
          >
            ⬅ Back
          </button>
        }
      />

      <div className="space-y-5 mt-4">
        <ComponentCard title="Form Edit Dokumen Pegawai">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Company */}
            {user.dashboard_type === "superadmin" && (
            <div>
              <Label>Company</Label>
              <select
                name="company_id"
                value={form.company_id}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">-- Pilih Company --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.company_id && (
                <p className="text-red-500">{errors.company_id}</p>
              )}
            </div>
          )}


            {/* Pegawai */}
            <div>
              <Label className="dark:text-gray-200">Pegawai</Label>
              <select
                name="pegawai_id"
                value={form.pegawai_id}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">-- Pilih Pegawai --</option>
                {filteredPegawai.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {errors.pegawai_id && <p className="text-red-500">{errors.pegawai_id}</p>}
            </div>

            {/* Nama Dokumen */}
            <div>
              <Label className="dark:text-gray-200">Nama Dokumen</Label>
              <Input
                name="nama_dokumen"
                value={form.nama_dokumen}
                onChange={handleChange}
                placeholder="Masukkan nama dokumen"
                className="dark:bg-gray-700 dark:text-white"
              />
              {errors.nama_dokumen && <p className="text-red-500">{errors.nama_dokumen}</p>}
            </div>

            {/* Keterangan */}
            <div>
              <Label className="dark:text-gray-200">Keterangan</Label>
              <textarea
                name="keterangan"
                value={form.keterangan}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full dark:bg-gray-700 dark:text-white"
                placeholder="Opsional"
              />
            </div>

            {/* File */}
            <div>
              <Label className="dark:text-gray-200">File Dokumen</Label>

              <div
                className="
                  border-2 border-dashed rounded p-4 relative flex flex-col items-center justify-center cursor-pointer
                  bg-gray-50 hover:bg-gray-100 border-gray-300
                  dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600
                "
              >
                {!form.file ? (
                  <>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Klik untuk pilih file
                    </p>
                    <input
                      type="file"
                      name="file"
                      onChange={handleChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </>
                ) : (
                  <div className="flex gap-2 items-center">
                    <span className="text-gray-800 dark:text-gray-100">{form.file.name}</span>
                    <button
                      type="button"
                      className="text-red-500"
                      onClick={handleRemoveFile}
                    >
                      ✖
                    </button>
                  </div>
                )}
              </div>

              {existingFile && !form.file && (
                <div className="mt-2 p-3 rounded-lg border bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800">
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    File Saat Ini:
                  </p>
                  <a
                    href={existingFile}
                    target="_blank"
                    className="text-blue-600 dark:text-blue-400 underline text-sm"
                  >
                    Lihat File
                  </a>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"} text-white px-6 py-2 rounded-xl`}
              >
                {loading ? "Menyimpan..." : "Update"}
              </button>
            </div>

          </form>

        </ComponentCard>
      </div>
    </>
  );
}
