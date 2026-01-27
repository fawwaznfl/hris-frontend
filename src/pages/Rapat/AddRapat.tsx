import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";

interface Pegawai {
  id: number;
  name: string;
  company_id: number | null;
}

interface Company {
  id: number;
  name: string;
}

interface FormState {
  company_id: number | "";
  pegawai_id?: number | "";
  nama_pertemuan: string;
  tanggal_rapat: string;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi: string;
  detail_pertemuan: string;
  jenis_pertemuan: string;
}

export default function AddRapat() {
  const navigate = useNavigate();

  const [tanggalRapat, setTanggalRapat] = useState<Date | null>(null);
  //const dashboardType = localStorage.getItem("dashboard_type");
  //const userCompanyId = localStorage.getItem("company_id");
  const [pegawais, setPegawais] = useState<Pegawai[]>([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const dashboardType = user.dashboard_type;
  const userCompanyId = user.company_id;

  const [selectedPegawai, setSelectedPegawai] = useState<number[]>([]);



  const [form, setForm] = useState<FormState>({
    company_id: "",
    pegawai_id: "",
    nama_pertemuan: "",
    tanggal_rapat: "",
    waktu_mulai: "",
    waktu_selesai: "",
    lokasi: "",
    detail_pertemuan: "",
    jenis_pertemuan: "",
  });

  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/companies", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCompanies(res.data.data || res.data);
      } catch (err) {
        console.error("Gagal fetch companies:", err);
      }
    };

    fetchCompanies();
    fetchPegawais();

    // Jika admin → isi otomatis dan sembunyikan dropdown
    if (dashboardType === "admin" && userCompanyId) {
      setForm((prev) => ({
        ...prev,
        company_id: Number(userCompanyId),
      }));
    }
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // reset pegawai kalau company diganti (superadmin)
    if (name === "company_id" && dashboardType === "superadmin") {
      setForm((prev) => ({
        ...prev,
        company_id: Number(value),
        pegawai_id: "",
      }));
      return;
    }

    setForm({ ...form, [name]: value });
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await api.post("/rapat", {
        ...form,
        pegawai_ids: selectedPegawai,
      });


      Swal.fire("Berhasil", "Rapat berhasil ditambahkan", "success");
      navigate("/rapat");
    } catch (err: any) {
      console.error("ERROR RAPAT:", err.response?.data);

      Swal.fire(
        "Error",
        err.response?.data?.message || "Validasi gagal",
        "error"
      );
    }

  };

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

      // ADMIN → hanya pegawai company sendiri
      else if (dashboardType === "admin" && userCompanyId) {
        setPegawais(
          mapped.filter(
            (p) => String(p.company_id) === String(userCompanyId)
          )
        );
      }
    } catch (err) {
      console.error("Gagal fetch pegawai:", err);
      setPegawais([]);
    }
  };

  const filteredPegawai =
    dashboardType === "admin"
      ? pegawais
      : pegawais.filter(
          (p) => String(p.company_id) === String(form.company_id)
        );



  // USER INTERFACE
  return (
    <>
      <PageMeta title="Tambah Rapat" description="Form menambah data rapat" />

      <PageHeader
        pageTitle="Tambah Rapat"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <button
            onClick={() => navigate("/rapat")}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-5 py-2 rounded-xl"
          >
            ⬅ Back
          </button>
        }
      />

      <ComponentCard>
        <form onSubmit={handleSubmit} className="space-y-6 p-4">

          {/* Company Dropdown hanya untuk Superadmin */}
          {dashboardType === "superadmin" && (
            <div>
              <label className="font-medium dark:text-white">Company</label>
              <select
                name="company_id"
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={form.company_id}
                onChange={handleChange}
                required
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

          {/* Admin → tidak tampilkan dropdown, kirim hidden input */}
          {dashboardType === "admin" && (
            <input type="hidden" name="company_id" value={form.company_id} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="font-medium dark:text-white">Nama Pertemuan</label>
              <input
                type="text"
                name="nama_pertemuan"
                className="w-full border rounded-lg px-3 py-2
             dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={form.nama_pertemuan}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="font-medium dark:text-white">Tanggal</label>
              <div>
              <DatePicker
                selected={tanggalRapat}
                onChange={(date: Date | null) => {
                  setTanggalRapat(date);

                  setForm((prev) => ({
                    ...prev,
                    tanggal_rapat: date
                      ? date.toISOString().split("T")[0] // hasil: 2025-01-05
                      : "",
                  }));
                }}
                dateFormat="yyyy-MM-dd"
                placeholderText="Pilih tanggal"
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            </div>

            <div>
              <label className="font-medium dark:text-white">Jam Mulai</label>
              <input
                type="time"
                name="waktu_mulai"
                className="w-full border rounded-lg px-3 py-2
             dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={form.waktu_mulai}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="font-medium dark:text-white">Jam Selesai</label>
              <input
                type="time"
                name="waktu_selesai"
                className="w-full border rounded-lg px-3 py-2
             dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={form.waktu_selesai}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="font-medium dark:text-white">Lokasi Pertemuan</label>
              <input
                type="text"
                name="lokasi"
                className="w-full border rounded-lg px-3 py-2
             dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={form.lokasi}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="font-medium dark:text-white">Jenis Pertemuan</label>
              <select
                name="jenis_pertemuan"
                className="w-full border rounded-lg px-3 py-2
             dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={form.jenis_pertemuan}
                onChange={handleChange}
                required
              >
                <option value="">Pilih Jenis</option>
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </select>
            </div>
          </div>

          {/* Pegawai */}
            <div>
            <label className="font-medium dark:text-white">Nama Pegawai</label>
            <select
              multiple
              value={selectedPegawai.map(String)}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions).map(
                  (o) => Number(o.value)
                );
                setSelectedPegawai(values);
              }}
              className="w-full border rounded-lg px-3 py-2"
            >
              {filteredPegawai.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <div>
              <label className="font-extralight dark:text-white">Tekan ctrl/command untuk memilih lebih dari 1</label>
            </div>
            <button
              type="button"
              onClick={() =>
                setSelectedPegawai(filteredPegawai.map((p) => p.id))
              }
              className="text-sm text-blue-600 hover:underline"
            >
              Pilih Semua Pegawai
            </button>

            <div className="mt-2 flex flex-wrap gap-2">
              {selectedPegawai.map((id) => {
                const p = filteredPegawai.find((x) => x.id === id);
                if (!p) return null;

                return (
                  <span
                    key={id}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {p.name}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPegawai(selectedPegawai.filter((x) => x !== id))
                      }
                      className="text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          <div>
            <label className="font-medium dark:text-white">Detail Pertemuan</label>
            <textarea
              name="detail_pertemuan"
              rows={4}
              className="w-full border rounded-lg px-3 py-2
             dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={form.detail_pertemuan}
              onChange={handleChange}
              required
            ></textarea>
          </div>

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
