import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";

export default function AddBerita() {
  const navigate = useNavigate();

  // AMBIL USER
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const dashboardType = user.dashboard_type;
  const userCompanyId = user.company_id;

  const [companyId, setCompanyId] = useState(
    dashboardType === "admin" ? String(userCompanyId) : ""
  );
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [tipe, setTipe] = useState("berita");
  const [judul, setJudul] = useState("");
  const [isi_konten, setIsiKonten] = useState("");

  const [gambar, setGambar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // =============================
  // FETCH COMPANIES
  // =============================
  const fetchCompanies = async () => {
    if (dashboardType === "admin") {
      setLoading(false);
      return; // ADMIN tidak perlu fetch companies
    }

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

  // =============================
  // IMAGE PREVIEW
  // =============================
  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    setGambar(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  // =============================
  // SUBMIT
  // =============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("company_id", companyId.toString());
    formData.append("tipe", tipe);
    formData.append("judul", judul);
    formData.append("isi_konten", isi_konten);

    if (gambar instanceof File) {
      formData.append("gambar", gambar);
    }

    try {
      await api.post("/berita", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Berita berhasil dibuat 🎉",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/berita");
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: error.response?.data?.message || "Terjadi kesalahan!",
      });
    }
  };

  // ===========================================================
  // UI
  // ===========================================================
  const inputClass =
    "border px-3 py-2 rounded-lg bg-white text-gray-900 " +
    "dark:bg-gray-700 dark:text-white dark:border-gray-600";

  const labelClass = "text-sm font-medium mb-1 text-gray-800 dark:text-gray-200";

  return (
    <>
      <PageMeta title="Tambah Berita" description="Tambah Berita Baru" />

      <PageHeader pageTitle="Tambah Berita" titleClass="text-[32px] dark:text-white" />

      <div className="space-y-5 sm:space-y-6">
        <ComponentCard className="p-6 dark:bg-gray-800 dark:border-gray-700">

          {loading ? (
            <p className="text-gray-700 dark:text-gray-300">Loading...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* COMPANY */}
              {dashboardType === "superadmin" && (
                <div className="flex flex-col">
                  <label className={labelClass}>Company</label>
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    className={inputClass}
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

              {/* ADMIN — hidden company */}
              {dashboardType === "admin" && (
                <input type="hidden" value={userCompanyId} name="company_id" />
              )}

              {/* TIPE */}
              <div className="flex flex-col">
                <label className={labelClass}>Tipe</label>
                <select
                  value={tipe}
                  onChange={(e) => setTipe(e.target.value)}
                  className={inputClass}
                >
                  <option value="berita">Berita</option>
                  <option value="informasi">Informasi</option>
                </select>
              </div>

              {/* JUDUL */}
              <div className="flex flex-col">
                <label className={labelClass}>Judul</label>
                <input
                  type="text"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* KONTEN */}
              <div className="flex flex-col">
                <label className={labelClass}>Konten</label>
                <textarea
                  value={isi_konten}
                  onChange={(e) => setIsiKonten(e.target.value)}
                  rows={5}
                  className={inputClass}
                ></textarea>
              </div>

              {/* GAMBAR */}
              <div className="flex flex-col">
                <label className={labelClass}>Gambar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={inputClass}
                />

                {preview && (
                  <img
                    src={preview}
                    className="w-32 h-32 object-cover mt-3 rounded-lg border dark:border-gray-600"
                  />
                )}
              </div>

              {/* BUTTON */}
              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl"
                >
                  Simpan
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/berita")}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-xl"
                >
                  Batal
                </button>
              </div>

            </form>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
