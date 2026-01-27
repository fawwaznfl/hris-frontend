import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import Swal from "sweetalert2";
import Label from "../../components/form/Label";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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

export default function AddKontrak() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const dashboardType = user.dashboard_type;
  const userCompanyId = user.company_id;

  const [tanggalMulai, setTanggalMulai] = useState<Date | null>(null);
  const [tanggalSelesai, setTanggalSelesai] = useState<Date | null>(null);


  const [kontrak, setKontrak] = useState({
    company_id: "",
    pegawai_id: "",
    jenis_kontrak: "---Pilih Jenis Kontrak ---",
    tanggal_mulai: "",
    tanggal_selesai: "",
    keterangan: "",
    file: null as File | null,
  });

  const [pegawais, setPegawais] = useState<Pegawai[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    company_id: "",
    pegawai_id: "",
    jenis_kontrak: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    file: "",
  });

  const payload = {
    tanggal_mulai: tanggalMulai ? tanggalMulai.toISOString().split("T")[0] : null,
    tanggal_selesai: tanggalSelesai ? tanggalSelesai.toISOString().split("T")[0] : null,
  };


  const jenisKontrakOptions = ["---Pilih Jenis Kontrak ---", "PKWT", "PKWTT", "THL"];

  // Fetch companies
  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCompanies(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setCompanies([]);
    }
  };

  // Fetch pegawai
  // Fetch pegawai
  const fetchPegawais = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/pegawais", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mapped: Pegawai[] = res.data.map((p: any) => ({
        id: p.id,
        name: p.name || "Unnamed",
        company_id: p.company_id || null,
      }));

      // SUPERADMIN → semua pegawai
      if (dashboardType === "superadmin") {
        setPegawais(mapped);
      }

      // ADMIN → hanya pegawai company yang sama
      else if (dashboardType === "admin" && userCompanyId) {
        const filtered = mapped.filter(
          (p: Pegawai) => String(p.company_id) === String(userCompanyId)
        );
        setPegawais(filtered); // ← WAJIB
      }
    } catch (err) {
      console.error("Error fetching pegawai:", err);
      setPegawais([]);
    }
  };


  useEffect(() => {
    // SUPERADMIN → fetch company
    if (dashboardType === "superadmin") {
      fetchCompanies();
    }

    // FETCH PEGAWAI (tetap)
    fetchPegawais();

    // ADMIN → company otomatis
    if (dashboardType === "admin" && userCompanyId) {
      setKontrak((prev) => ({
        ...prev,
        company_id: userCompanyId,
      }));
    }
  }, []);


  // Handle input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (name === "file" && files) {
      setKontrak({ ...kontrak, file: files[0] });
      return;
    }

    // Reset pegawai saat company berubah
    if (name === "company_id" && dashboardType === "superadmin") {
      setKontrak({
        ...kontrak,
        company_id: value,
        pegawai_id: "",
      });
      return;
    }

    setKontrak({ ...kontrak, [name]: value });
  };

  const handleRemoveFile = () => setKontrak({ ...kontrak, file: null });

  // VALIDATION
  const validate = () => {
    const newErrors = {
      company_id: "",
      pegawai_id: "",
      jenis_kontrak: "",
      tanggal_mulai: "",
      tanggal_selesai: "",
      file: "",
    };

    let isValid = true;

    if (!kontrak.company_id) {
      newErrors.company_id = "Pilih company";
      isValid = false;
    }
    if (!kontrak.pegawai_id) {
      newErrors.pegawai_id = "Pilih pegawai";
      isValid = false;
    }
    if (!kontrak.jenis_kontrak || kontrak.jenis_kontrak === "---Pilih Jenis Kontrak ---") {
      newErrors.jenis_kontrak = "Jenis kontrak wajib diisi";
      isValid = false;
    }
    if (!kontrak.tanggal_mulai) {
      newErrors.tanggal_mulai = "Tanggal mulai wajib diisi";
      isValid = false;
    }
    if (!kontrak.tanggal_selesai) {
      newErrors.tanggal_selesai = "Tanggal selesai wajib diisi";
      isValid = false;
    }
    if (!kontrak.file) {
      newErrors.file = "File kontrak wajib diunggah";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("company_id", kontrak.company_id);
      formData.append("pegawai_id", kontrak.pegawai_id);
      formData.append("jenis_kontrak", kontrak.jenis_kontrak);
      formData.append("tanggal_mulai", kontrak.tanggal_mulai);
      formData.append("tanggal_selesai", kontrak.tanggal_selesai);
      formData.append("keterangan", kontrak.keterangan || "");
      if (kontrak.file) formData.append("file", kontrak.file);

      await api.post("/kontrak", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Kontrak berhasil ditambahkan.",
      }).then(() => navigate("/kontrak"));
    } catch (err) {
      console.error("Error adding kontrak:", err);
      Swal.fire({ icon: "error", title: "Gagal", text: "Terjadi kesalahan." });
    } finally {
      setLoading(false);
    }
  };

  // FILTER PEGAWAI
  const filteredPegawai =
    dashboardType === "admin"
      ? pegawais                   // Admin → langsung tampilkan pegawai
      : pegawais.filter(           // Superadmin → filter berdasarkan company
          (p) => String(p.company_id) === String(kontrak.company_id)
  );

  const CustomInput = ({ value, onClick }: any) => (
  <button
    onClick={onClick}
    type="button"
    className="
      border px-3 py-2 rounded-md w-full text-left bg-white text-gray-900 
      hover:border-blue-500
      dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:hover:border-blue-400
    "
  >
    {value || "Pilih tanggal"}
  </button>
);


  return (
    <>
      <PageMeta title="Add-Kontrak" description="Add Kontrak" />
      <PageHeader
        pageTitle="Tambah Kontrak"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <button
            onClick={() => navigate("/kontrak")}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-5 py-2 rounded-xl"
          >
            ⬅ Back
          </button>
        }
      />

      <div className="space-y-5 sm:space-y-6 mt-4">
        <ComponentCard title="Form Tambah Kontrak">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* COMPANY */}
            {dashboardType === "superadmin" && (
              <div>
                <Label>Company</Label>
                <select
                  name="company_id"
                  value={kontrak.company_id}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">-- Pilih Company --</option>
                  {companies.map((c: Company) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}

                </select>
                {errors.company_id && <p className="text-red-500">{errors.company_id}</p>}
              </div>
            )}


            {/* PEGAWAI */}
            <div>
              <Label htmlFor="pegawai_id">Nama Pegawai</Label>
              <select
                id="pegawai_id"
                name="pegawai_id"
                value={kontrak.pegawai_id}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">-- Pilih Pegawai --</option>
                {filteredPegawai.map((p: Pegawai) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}

              </select>
              {errors.pegawai_id && (
                <p className="text-red-500">{errors.pegawai_id}</p>
              )}
            </div>

            {/* Jenis Kontrak */}
            <div>
              <Label htmlFor="jenis_kontrak">Jenis Kontrak</Label>
              <select
                id="jenis_kontrak"
                name="jenis_kontrak"
                value={kontrak.jenis_kontrak}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {jenisKontrakOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* tanggal mulai */}
            <div>
              <Label htmlFor="tanggal_mulai">Tanggal Mulai</Label>
              <DatePicker
                selected={tanggalMulai}
                onChange={(date) => {
                  setTanggalMulai(date);
                  setKontrak((prev) => ({
                    ...prev,
                    tanggal_mulai: date ? date.toISOString().split("T")[0] : ""
                  }));
                }}
                dateFormat="yyyy-MM-dd"
                customInput={<CustomInput />}
              />
              {errors.tanggal_mulai && (
                <p className="text-red-500">{errors.tanggal_mulai}</p>
              )}
            </div>


            {/* tanggal selesai */}
            <div>
              <Label htmlFor="tanggal_selesai">Tanggal Selesai</Label>
              <DatePicker
                selected={tanggalSelesai}
                onChange={(date) => {
                  setTanggalSelesai(date);
                  setKontrak((prev) => ({
                    ...prev,
                    tanggal_selesai: date ? date.toISOString().split("T")[0] : ""
                  }));
                }}
                dateFormat="yyyy-MM-dd"
                customInput={<CustomInput />}
              />
              {errors.tanggal_selesai && (
                <p className="text-red-500">{errors.tanggal_selesai}</p>
              )}
            </div>


            {/* Keterangan */}
            <div>
              <Label htmlFor="keterangan">Keterangan</Label>
              <textarea
                id="keterangan"
                name="keterangan"
                value={kontrak.keterangan}
                onChange={handleChange}
                className="border px-3 py-2 rounded-md w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Masukkan keterangan kontrak (opsional)"
              />
            </div>

            {/* File Upload */}
            <div>
              <Label>File Kontrak</Label>
              <div className="border-2 border-dashed rounded p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 relative">
                {!kontrak.file ? (
                  <>
                    <p className="text-gray-500">Klik untuk pilih file atau drag file di sini</p>
                    <input
                      type="file"
                      name="file"
                      onChange={handleChange}
                      required
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{kontrak.file.name}</span>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-red-500 font-bold"
                    >
                      ✖
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`${
                  loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                } text-white font-medium px-6 py-2 rounded-xl`}
              >
                {loading ? "Menyimpan..." : "Save"}
              </button>
            </div>

          </form>
        </ComponentCard>
      </div>
    </>
  );
}
