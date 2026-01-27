import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Pegawai {
  id: number;
  name: string;
}

interface Kontrak {
  id: number;
  jenis_kontrak: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  keterangan?: string;
  file_path?: string; 
  pegawai_id: number;
}

export default function EditKontrak() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [form, setForm] = useState<Kontrak | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const jenisKontrakOptions = ["PKWT", "PKWTT", "THL"];

  // Custom button untuk DatePicker
  const CustomInput = ({ value, onClick }: any) => (
    <button
      onClick={onClick}
      className="border px-3 py-2 rounded-md w-40 bg-white text-left hover:border-blue-500"
    >
      {value || "Pilih tanggal"}
    </button>
  );

  useEffect(() => {
    fetchKontrak();
    fetchPegawai();
  }, []);

  // Fetch data kontrak berdasarkan id
  const fetchKontrak = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/kontrak/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data;
      setForm(data);
      setStartDate(new Date(data.tanggal_mulai));
      setEndDate(new Date(data.tanggal_selesai));
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal mengambil data kontrak", "error");
    }
  };

  // Fetch semua pegawai untuk dropdown
  const fetchPegawai = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/pegawais", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const mapped = res.data.map((p: any) => ({
        id: p.id,
        name: p.name || "Unnamed",
      }));
      setPegawaiList(mapped);
    } catch (error) {
      console.error(error);
      setPegawaiList([]);
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!form) return;
    const value = e.target.name === "pegawai_id" ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  // Submit form
  const handleSubmit = async () => {
    if (!form) return;

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("pegawai_id", String(form.pegawai_id));
      formData.append("jenis_kontrak", form.jenis_kontrak); // harus sesuai backend
      formData.append("tanggal_mulai", startDate?.toISOString().split("T")[0] || "");
      formData.append("tanggal_selesai", endDate?.toISOString().split("T")[0] || "");
      formData.append("keterangan", form.keterangan ?? "");

      if (file) formData.append("file", file);

      // Laravel multipart PUT workaround
      formData.append("_method", "PUT");

      await api.post(`/kontrak/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire("Berhasil!", "Kontrak berhasil diperbarui.", "success");
      navigate("/kontrak");
    } catch (error: any) {
      console.error(error);
      Swal.fire(
        "Gagal",
        error.response?.data?.message || "Terjadi kesalahan saat update kontrak.",
        "error"
      );
    }
  };

  if (!form) return <p className="text-center mt-10">Loading...</p>;

  return (
    <>
      <PageMeta title="Edit Kontrak" description="Form untuk mengedit data kontrak" />
      <PageHeader pageTitle="Edit Kontrak" titleClass="text-[32px] dark:text-white" />

      <div className="space-y-5 sm:space-y-6 mt-4">
        <ComponentCard title="Form Edit Kontrak">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Pegawai */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Nama Pegawai</label>
              <select
                name="pegawai_id"
                value={form.pegawai_id}
                onChange={handleChange}
                className="border px-3 py-2 rounded-md w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
              >
                <option value="">-- Pilih Pegawai --</option>
                {pegawaiList.map((p) => (
                  <option key={p.id} value={p.id} className="text-gray-900 dark:text-white">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Jenis Kontrak */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Jenis Kontrak</label>
              <select
                name="jenis_kontrak"
                value={form.jenis_kontrak}
                onChange={handleChange}
                className="border px-3 py-2 rounded-md w-full text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              >
                <option value="">-- Pilih Jenis Kontrak --</option>
                {jenisKontrakOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Tanggal Mulai */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Tanggal Mulai</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="yyyy-MM-dd"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                customInput={<CustomInput />}
              />
            </div>

            {/* Tanggal Selesai */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Tanggal Selesai</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="yyyy-MM-dd"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                customInput={<CustomInput />}
              />
            </div>

            {/* Keterangan */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Keterangan</label>
              <textarea
                name="keterangan"
                value={form.keterangan || ""}
                onChange={handleChange}
                className="border px-3 py-2 rounded-md w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* File Kontrak */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">File Kontrak</label>
              {form.file_path && (
                <div className="mb-2">
                  <a href={form.file_path} target="_blank" className="text-blue-600 underline">
                    📄 Lihat File Lama
                  </a>
                </div>
              )}
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="border px-3 py-2 rounded-md w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* BUTTON */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => navigate("/kontrak")}
              className="bg-gray-500 text-white px-5 py-2 rounded-lg"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
            >
              Simpan Perubahan
            </button>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
