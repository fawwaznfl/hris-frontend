import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import api from "../../../api/axios";
import Swal from "sweetalert2";
import BottomNav from "../../../components/common/BottomNav";

interface FormState {
  company_id: string;
  pegawai_id: string;
  tanggal: string;
  nominal: string;
  keperluan: string;
  metode_pengiriman: "cash" | "transfer";
  nomor_rekening: string;
  status: string;
}

export default function EditKasbonPegawai() {
  const navigate = useNavigate();
  const { id } = useParams();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState<FormState>({
    company_id: "",
    pegawai_id: "",
    tanggal: "",
    nominal: "",
    keperluan: "",
    metode_pengiriman: "cash",
    nomor_rekening: "",
    status: "",
  });

  const [loading, setLoading] = useState(false);

  // =====================
  // FETCH DETAIL KASBON
  // =====================
  const fetchDetail = async () => {
    try {
      const res = await api.get(`/kasbon/${id}`);
      const d = res.data.data;

      // 🚫 Pegawai hanya boleh edit pending
      if (d.status !== "pending") {
        Swal.fire(
          "Tidak bisa diedit",
          "Kasbon sudah diproses",
          "warning"
        ).then(() => navigate("/kasbon-pegawai"));
        return;
      }

      setForm({
        company_id: String(d.company_id),
        pegawai_id: String(d.pegawai_id),
        tanggal: d.tanggal || "",
        nominal: String(d.nominal || 0),
        keperluan: d.keperluan || "",
        metode_pengiriman: d.metode_pengiriman || "cash",
        nomor_rekening: d.nomor_rekening || "",
        status: d.status,
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", "Data kasbon tidak ditemukan", "error")
        .then(() => navigate("/kasbon-pegawai"));
    }
  };

  useEffect(() => {
    fetchDetail();
  }, []);

  // =====================
  // HANDLE CHANGE
  // =====================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "metode_pengiriman") {
      setForm((s) => ({
        ...s,
        metode_pengiriman: value as "cash" | "transfer",
        nomor_rekening: value === "cash" ? "" : s.nomor_rekening,
      }));
      return;
    }

    setForm((s) => ({ ...s, [name]: value }));
  };

  // =====================
  // SUBMIT UPDATE
  // =====================
  const handleSubmit = async () => {
    if (!form.tanggal || !form.nominal || !form.keperluan) {
      Swal.fire("Validasi", "Lengkapi semua field", "warning");
      return;
    }

    if (
      form.metode_pengiriman === "transfer" &&
      !form.nomor_rekening
    ) {
      Swal.fire("Validasi", "Nomor rekening wajib diisi", "warning");
      return;
    }

    try {
      setLoading(true);

      await api.put(`/kasbon/${id}`, {
        company_id: form.company_id,
        pegawai_id: form.pegawai_id,
        tanggal: form.tanggal,
        nominal: Number(form.nominal),
        keperluan: form.keperluan,
        metode_pengiriman: form.metode_pengiriman,
        nomor_rekening:
            form.metode_pengiriman === "cash"
            ? null
            : form.nomor_rekening,
        });


      Swal.fire(
        "Berhasil",
        "Kasbon berhasil diperbarui",
        "success"
      ).then(() => navigate("/kasbon-pegawai"));
    } catch (err: any) {
      console.error(err.response?.data);
      Swal.fire("Gagal", "Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F6FA] pb-28">
      {/* HEADER */}
      <div className="bg-gradient-to-br from-[#4A4CFF] to-[#7A52FF] p-5 text-white text-center relative rounded-b-3xl">
        <ChevronLeft
          className="absolute left-5 top-5 cursor-pointer"
          size={26}
          onClick={() => navigate("/kasbon-pegawai")}
        />
        <p className="text-lg font-semibold">Edit Kasbon</p>
      </div>

      {/* FORM */}
      <div className="mx-4 mt-5 bg-white shadow-md rounded-3xl p-5 space-y-4">

        {/* NAMA PEGAWAI */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Nama Pegawai</label>
          <input
            type="text"
            readOnly
            value={user?.name || "-"}
            className="w-full border rounded-xl px-4 py-3 bg-gray-100"
          />
        </div>

        {/* TANGGAL */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Tanggal</label>
          <input
            type="date"
            name="tanggal"
            value={form.tanggal}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>

        {/* NOMINAL */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Nominal</label>
          <input
            type="number"
            name="nominal"
            value={form.nominal}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
            placeholder="Masukkan nominal"
          />
        </div>

        {/* KEPERLUAN */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Keperluan</label>
          <textarea
            name="keperluan"
            value={form.keperluan}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
            placeholder="Masukkan keperluan"
          />
        </div>

        {/* METODE */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Metode Pengiriman</label>
          <select
            name="metode_pengiriman"
            value={form.metode_pengiriman}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
          >
            <option value="cash">Cash</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>

        {/* REKENING */}
        {form.metode_pengiriman === "transfer" && (
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Nomor Rekening</label>
            <input
              type="text"
              name="nomor_rekening"
              value={form.nomor_rekening}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3"
              placeholder="Masukkan nomor rekening"
            />
          </div>
        )}

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl mt-5 text-lg font-medium disabled:bg-blue-400"
        >
          {loading ? "Menyimpan..." : "Update"}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
