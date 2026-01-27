import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import api from "../../../api/axios";
import Swal from "sweetalert2";
import BottomNav from "../../../components/common/BottomNav";
import { useNavigate, useParams } from "react-router";

interface Kategori {
  id: number;
  nama: string;
  jumlah: number;
  company_id: number;
}

interface FormState {
  company_id: string;
  pegawai_id: string;
  kategori_reimbursement_id: string;
  tanggal: string;
  event: string;
  jumlah: string;
  terpakai: string;
  metode_reim: "cash" | "transfer";
  no_rekening: string;
  total: string;
  sisa: string;
  status: string;
  file: File | null;
}

export default function EditReimbursementPegawai() {
  const navigate = useNavigate();
  const { id } = useParams();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [kategori, setKategori] = useState<Kategori[]>([]);

  const [form, setForm] = useState<FormState>({
    company_id: "",
    pegawai_id: "",
    kategori_reimbursement_id: "",
    tanggal: "",
    event: "",
    jumlah: "",
    terpakai: "",
    total: "",
    metode_reim: "cash",
    no_rekening: "",
    sisa: "",
    status: "",
    file: null,
  });

  const [oldFileUrl, setOldFileUrl] = useState<string>("");

  const [errors, setErrors] = useState({
    kategori_reimbursement_id: "",
  });

  // === HANDLE CHANGE ===
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // kategori selected -> isi otomatis
    if (name === "kategori_reimbursement_id") {
      const found = kategori.find((k) => String(k.id) === value);

      if (found) {
        const terpakaiNum = Number(form.terpakai || 0);
        const totalCalc = Math.max(found.jumlah - terpakaiNum, 0);

        setForm((s) => ({
          ...s,
          kategori_reimbursement_id: value,
          jumlah: String(found.jumlah),
          total: String(totalCalc),
          sisa: String(totalCalc),
        }));
      }
      return;
    }

    // terpakai
    if (name === "terpakai") {
      const terpakaiNum = Number(value || 0);
      const jumlahNum = Number(form.jumlah || 0);
      const final = jumlahNum - terpakaiNum >= 0 ? jumlahNum - terpakaiNum : 0;

      setForm((s) => ({
        ...s,
        terpakai: value,
        total: String(final),
        sisa: String(final),
      }));
      return;
    }

    setForm((s) => ({ ...s, [name]: value }));
  };

  // === FETCH KATEGORI ===
  const fetchKategori = async () => {
    try {
      const res = await api.get("/kategori-reimbursement");
      const data = Array.isArray(res.data.data) ? res.data.data : res.data;

      const filtered = data.filter((k: any) =>
        String(k.company_id) === String(user.company_id)
      );

      setKategori(filtered);
    } catch (err) {
      console.error("fetchKategori", err);
    }
  };

  // === FETCH DETAIL REIMBURSEMENT ===
  const fetchDetail = async () => {
    try {
      const res = await api.get(`/reimbursement/${id}`);
      const d = res.data.data ? res.data.data : res.data;

      setForm({
        company_id: String(d.company_id),
        pegawai_id: String(d.pegawai_id),
        kategori_reimbursement_id: String(d.kategori_reimbursement_id),
        tanggal: d.tanggal || "",
        event: d.event || "",
        jumlah: String(d.jumlah || 0),
        terpakai: String(d.terpakai || 0),
        total: String(d.total || 0),
        sisa: String(d.sisa || 0),
        status: d.status || "pending",
        metode_reim: d.metode_reim || "cash",
        no_rekening: d.no_rekening || "",
        file: null,
      });

      setOldFileUrl(d.file_url || "");
    } catch (err) {
      console.error("fetch detail error", err);
    }
  };

  useEffect(() => {
    fetchKategori();
    fetchDetail();
  }, []);

  // === SUBMIT UPDATE ===
  const handleSubmit = async () => {
    if (!form.kategori_reimbursement_id) {
      setErrors({ kategori_reimbursement_id: "Kategori wajib dipilih" });
      return;
    }

    const fd = new FormData();

    Object.entries(form).forEach(([key, val]) => {
      if (val !== null) {
        if (["jumlah", "terpakai", "total", "sisa"].includes(key)) {
          fd.append(key, String(Number(val)));
        } else {
          fd.append(key, val);
        }
      }
    });

    try {
      await api.post(`/reimbursement/${id}?_method=PUT`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Reimbursement berhasil diperbarui!",
      }).then(() => {
        navigate("/reimbursement-pegawai");
      });

    } catch (err: any) {
      console.log("UPDATE ERROR:", err.response?.data);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat update!",
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F6FA] pb-28">
      <div className="bg-gradient-to-br from-[#4A4CFF] to-[#7A52FF] p-5 text-white text-center relative rounded-b-3xl">
        <ChevronLeft
          className="absolute left-5 top-5 cursor-pointer"
          size={26}
          onClick={() => navigate("/reimbursement-pegawai")}
        />
        <p className="text-lg font-semibold">Edit Reimbursement</p>
      </div>

      <div className="mx-4 mt-5 bg-white shadow-md rounded-3xl p-5 space-y-4">

        {/* NAMA PEGAWAI */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Nama Pegawai</label>
          <input
            type="text"
            readOnly
            className="w-full border rounded-xl px-4 py-3 bg-gray-100"
            value={user?.name || "Tidak ada nama"}
          />
        </div>

        {/* KATEGORI */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Kategori</label>
          <select
            name="kategori_reimbursement_id"
            value={form.kategori_reimbursement_id}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
          >
            <option value="">Pilih Kategori</option>
            {kategori.map((k) => (
              <option key={k.id} value={String(k.id)}>
                {k.nama} — {Number(k.jumlah).toLocaleString()}
              </option>
            ))}
          </select>

          {errors.kategori_reimbursement_id && (
            <p className="text-red-500">{errors.kategori_reimbursement_id}</p>
          )}
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

        {/* EVENT */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Event</label>
          <input
            type="text"
            name="event"
            value={form.event}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
            placeholder="Isi event"
          />
        </div>

        {/* JUMLAH */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Jumlah (kategori)</label>
          <input
            name="jumlah"
            type="number"
            value={form.jumlah}
            readOnly
            className="w-full border rounded-xl px-4 py-3 bg-gray-100"
          />
        </div>

        {/* TERPAKAI */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Terpakai</label>
          <input
            name="terpakai"
            type="number"
            value={form.terpakai}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>

        {/* TOTAL */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Total</label>
          <input
            name="total"
            type="number"
            value={form.total}
            readOnly
            className="w-full border rounded-xl px-4 py-3 bg-gray-100"
          />
        </div>

        {/* SISA */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Sisa</label>
          <input
            name="sisa"
            type="number"
            value={form.sisa}
            readOnly
            className="w-full border rounded-xl px-4 py-3 bg-gray-100"
          />
        </div>

        {/* METODE REIMBURSEMENT */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Metode Reimbursement</label>
          <select
            name="metode_reim"
            value={form.metode_reim}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                metode_reim: e.target.value as "cash" | "transfer",
                no_rekening: e.target.value === "cash" ? "" : s.no_rekening,
              }))
            }
            className="w-full border rounded-xl px-4 py-3"
          >
            <option value="cash">Cash</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>

        {form.metode_reim === "transfer" && (
        <div className="space-y-1">
          <label className="text-sm text-gray-600">No Rekening</label>
          <input
            type="text"
            name="no_rekening"
            value={form.no_rekening}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
            placeholder="Masukkan nomor rekening"
          />
        </div>
      )}
      
        {/* FILE UPLOAD */}
        <div className="space-y-1 mt-4">
          <label className="text-sm text-gray-600">Upload File (opsional)</label>

          <label className="flex flex-col items-center justify-center w-full h-25 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                aria-hidden="true"
                className="w-10 h-10 text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 
                  1115.9 6h.1a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>

              <p className="text-sm text-gray-600">
                <span className="font-medium text-blue-600">Click to upload</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (max 5MB)</p>
            </div>

            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setForm((s) => ({ ...s, file }));
                }
              }}
            />
          </label>

          {/* OLD FILE PREVIEW */}
          {oldFileUrl && !form.file && (
            <div className="mt-3 bg-gray-100 p-3 rounded-xl">
              <p className="text-sm text-gray-700">File sebelumnya:</p>
              <a href={oldFileUrl} target="_blank" className="text-blue-600 underline text-sm">
                Lihat File
              </a>
            </div>
          )}

          {/* NEW FILE PREVIEW */}
          {form.file && (
            <div className="mt-3 flex items-center justify-between bg-gray-100 p-3 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-700">{form.file.name}</p>
                <p className="text-xs text-gray-500">
                  {(form.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <button
                type="button"
                onClick={() => setForm((s) => ({ ...s, file: null }))}
                className="text-red-500 font-semibold text-sm"
              >
                Hapus
              </button>
            </div>
          )}
        </div>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-3 rounded-xl mt-5 text-lg font-medium"
        >
          Update
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
