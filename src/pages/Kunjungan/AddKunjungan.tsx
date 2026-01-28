import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

interface Pegawai {
  id: number;
  name: string;
  company_id: number | null;
}

interface Company {
  id: number;
  name: string;
}

export default function AddKunjungan() {
  const navigate = useNavigate();

  // USER
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const dashboardType = user.dashboard_type;
  const [lokasiMasuk, setLokasiMasuk] = useState("");
  const token = localStorage.getItem("token");


  // FORM STATE
  const [form, setForm] = useState({
    company_id: "",
    pegawai_id: "",
    keterangan: "",
    foto: null as File | null,
  });

  const [companies, setCompanies] = useState<Company[]>([]);
  const [pegawais, setPegawais] = useState<Pegawai[]>([]);

  // FETCH COMPANIES
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/companies", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCompanies(res.data.data || res.data);
      } catch (err) {
        console.error("Error fetch company:", err);
      }
    };

    fetchCompanies();
  }, []);


  // FETCH PEGAWAI
  useEffect(() => {
    const fetchPegawais = async () => {
      const res = await api.get("/pegawais");
      const mapped = (res.data.data || res.data).map((p: any) => ({
        id: p.id,
        name: p.name,
        company_id: p.company_id ?? p.company?.id ?? null,
      }));
      setPegawais(mapped);
    };
    fetchPegawais();
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
        (pos) => {
        setLokasiMasuk(`${pos.coords.latitude},${pos.coords.longitude}`);
        },
        () => {
        Swal.fire("Error", "GPS tidak aktif", "error");
        }
    );
    }, []);


  // FILTER PEGAWAI BY COMPANY
  const pegawaiFiltered = pegawais.filter(
    (p) => String(p.company_id) === String(form.company_id)
  );

  // SUBMIT
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!form.company_id || !form.pegawai_id || !form.foto || !lokasiMasuk) {
        Swal.fire("Error", "Semua data wajib diisi", "error");
        return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();

    formData.append("company_id", form.company_id);
    formData.append("pegawai_id", form.pegawai_id);
    formData.append("keterangan", form.keterangan);
    formData.append("upload_foto", form.foto); // 🔥 FIX
    formData.append("lokasi_masuk", lokasiMasuk); // 🔥 FIX

    try {
        await api.post("/kunjungan", formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        },
        });

        Swal.fire("Berhasil", "Visit in berhasil", "success");
        navigate("/kunjungan");
    } catch (err: any) {
        console.error(err.response?.data);
        Swal.fire("Gagal", err.response?.data?.message || "Error", "error");
    }
    };


  return (
    <>
      <PageMeta title="Tambah Kunjungan" description="Form untuk menambah kunjungan" />
      <PageHeader
        pageTitle="Tambah Kunjungan"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <button
            onClick={() => navigate("/kunjungan")}
            className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-xl"
          >
            ⬅ Back
          </button>
        }
      />

      <div className="mt-4">
        <ComponentCard>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* COMPANY */}
            {dashboardType === "superadmin" && (
              <div>
                <label className="text-gray-700 dark:text-gray-200">Company</label>
                <select
                  value={form.company_id}
                  onChange={(e) =>
                    setForm({ ...form, company_id: e.target.value, pegawai_id: "" })
                  }
                  className="w-full border px-3 py-2 rounded"
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

            {/* PEGAWAI */}
            <div>
              <label className="text-gray-700 dark:text-gray-200">Pegawai</label>
              <select
                value={form.pegawai_id}
                onChange={(e) =>
                  setForm({ ...form, pegawai_id: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                disabled={!form.company_id}
              >
                <option value="">
                  {form.company_id ? "-- Pilih Pegawai --" : "Pilih company dulu"}
                </option>
                {pegawaiFiltered.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* KETERANGAN */}
            <div>
              <label className="text-gray-700 dark:text-gray-200">Keterangan</label>
              <textarea
                value={form.keterangan}
                onChange={(e) =>
                  setForm({ ...form, keterangan: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                rows={3}
                placeholder="Masukkan keterangan kunjungan"
              />
            </div>

            {/* FOTO */}
            <div>
              <label className="text-gray-700 dark:text-gray-200">
                Foto Kunjungan
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm({ ...form, foto: e.target.files?.[0] || null })
                }
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div className="flex justify-end">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg">
                Simpan
              </button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
