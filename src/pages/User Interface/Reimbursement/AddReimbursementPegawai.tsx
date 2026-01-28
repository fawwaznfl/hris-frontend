import { useState, useEffect } from "react";
import { ChevronLeft, Trash2 } from "lucide-react";
import api from "../../../api/axios";
import Swal from "sweetalert2";

import BottomNav from "../../../components/common/BottomNav"; 
import { useNavigate } from "react-router-dom";

interface RowItem {
  id: number;
  name: string;
  fee: string;
}

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
  metode_reim: string;          
  no_rekening: string;  
  tanggal: string;
  event: string;
  jumlah: string;
  terpakai: string;
  total: string;
  sisa: string;
  status: string;
  file: File | null;
}


export default function AddReimbursementPegawai() {

  const navigate = useNavigate();

  const [rows, setRows] = useState<RowItem[]>([
    { id: Date.now(), name: "", fee: "" }
  ]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [kategori, setKategori] = useState<Kategori[]>([]);

  const [form, setForm] = useState<FormState>({
  company_id: user.company_id ? String(user.company_id) : "",
  pegawai_id: String(user.id),
  kategori_reimbursement_id: "",
  tanggal: "",
  event: "",
  metode_reim: "cash", 
  no_rekening: "",
  jumlah: "",
  terpakai: "",
  total: "",
  sisa: "",
  status: "pending",
  file: null,
});

const [errors, setErrors] = useState({
  kategori_reimbursement_id: "",
});

const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => {
  const name = e.target.name;
  const value = e.target.value;

  if (name === "metode_reim") {
  setForm((s) => ({
    ...s,
    metode_reim: value,
    no_rekening: value === "transfer" ? s.no_rekening : "", // reset kalau bukan transfer
  }));
  return;
}

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
        terpakai: s.terpakai || "0",
        total: String(totalCalc),
        sisa: String(totalCalc),
      }));
    } else {
      setForm((s) => ({
        ...s,
        kategori_reimbursement_id: value,
        jumlah: "",
        total: "",
        sisa: "",
      }));
    }
    return;
  }

  // terpakai direfresh otomatis
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


  const addRow = () => {
    setRows([...rows, { id: Date.now(), name: "", fee: "" }]);
  };

  const removeRow = (id: number) => {
    setRows(rows.filter((r) => r.id !== id));
  };

  const fetchKategori = async () => {
    try {
      const res = await api.get("/kategori-reimbursement");
      const data = Array.isArray(res.data.data) ? res.data.data : res.data;

      // FILTER: berdasarkan company user
      const filtered = data.filter((k: any) => 
        String(k.company_id) === String(user.company_id)
      );

      setKategori(filtered);
    } catch (err) {
      console.error("fetchKategori", err);
    }
  };

  useEffect(() => {
  fetchKategori();
}, []);

  const handleSubmit = async () => {
  if (!form.kategori_reimbursement_id) {
    setErrors({ kategori_reimbursement_id: "Kategori wajib dipilih" });
    return;
  }

  if (form.metode_reim === "transfer" && !form.no_rekening) {
    Swal.fire({
      icon: "warning",
      title: "Nomor rekening wajib diisi",
    });
    return;
  }

  const fd = new FormData();

  Object.entries(form).forEach(([key, val]) => {
    if (val !== null) {
      if (["jumlah", "terpakai", "total", "sisa"].includes(key)) {
        fd.append(key, String(Number(val))); // convert ke integer
      } else {
        fd.append(key, val);
      }
    }
  });

  try {
    const res = await api.post("/reimbursement", fd, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    Swal.fire({
      icon: "success",
      title: "Berhasil",
      text: "Reimbursement berhasil diajukan!"
    });

  } catch (err: any) {
    console.log("ERR RESPONSE:", err.response?.data);

    Swal.fire({
    icon: "success",
    title: "Berhasil",
    text: "Reimbursement berhasil diajukan!"
  }).then(() => {
    navigate("/reimbursement-pegawai");
  });
  }
};




/// User Interface

  return (
    <div className="w-full min-h-screen bg-[#F5F6FA] pb-28"> 
      {/* pb-28 agar tidak ketutup BottomNav */}

      {/* HEADER */}
      <div className="bg-gradient-to-br from-[#4A4CFF] to-[#7A52FF] p-5 text-white text-center relative rounded-b-3xl">
        <ChevronLeft
          className="absolute left-5 top-5 cursor-pointer"
          size={26}
          onClick={() => navigate("/reimbursement-pegawai")}
        />

        <p className="text-lg font-semibold">Reimbursement</p>
      </div>

      {/* CONTENT CARD */}
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
          <label className="text-sm text-gray-600">Jumlah dari kategori</label>
          <input
            name="jumlah"
            type="number"
            value={form.jumlah}
            readOnly
            className="w-full border rounded-xl px-4 py-3 bg-gray-100"
          />
        </div>

        {/* Terpakai */}
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
        <div className="space-y-1 mt-6">
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
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
          >
            <option value="cash">Cash</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>

        {/* NOMOR REKENING (MUNCUL JIKA TRANSFER) */}
        {form.metode_reim === "transfer" && (
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Nomor Rekening</label>
            <input
              type="text"
              name="no_rekening"
              value={form.no_rekening}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3"
              placeholder="Contoh: 1234567890 (BCA)"
            />
          </div>
        )}

        {/* FILE UPLOAD */}
        <div className="space-y-1 mt-4">
          <label className="text-sm text-gray-600">Upload File</label>

          {/* UPLOAD BOX */}
          <label
            className="flex flex-col items-center justify-center w-full h-25 border-2 border-dashed 
              border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                aria-hidden="true"
                className="w-10 h-10 text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 
                    1115.9 6h.1a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>

              <p className="text-sm text-gray-600">
                <span className="font-medium text-blue-600">Click to upload</span> atau drag file
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

          {/* FILE PREVIEW */}
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
          Submit
        </button>
      </div>

      {/* BOTTOM NAV */}
      <BottomNav />
    </div>
  );
}
