import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../api/axios";
import BottomNav from "../../../components/common/BottomNav";
import { useNavigate } from "react-router-dom";

export default function AddKasbonPegawai() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    pegawai_id: user.id ? String(user.id) : "",
    company_id: user.company_id || "",
    tanggal: "",
    nominal: "",
    keperluan: "",
    metode_pengiriman: "cash", 
    nomor_rekening: "", 
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {

    // VALIDASI
    if (!form.tanggal || !form.nominal || !form.keperluan) {
      Swal.fire({
        icon: "warning",
        title: "Lengkapi Data",
        text: "Tanggal, nominal, dan keperluan wajib diisi.",
      });
      return;
    }

    if (
      !form.tanggal ||
      !form.nominal ||
      !form.keperluan ||
      (form.metode_pengiriman === "transfer" && !form.nomor_rekening)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Lengkapi Data",
        text:
          form.metode_pengiriman === "transfer" && !form.nomor_rekening
            ? "Nomor rekening wajib diisi untuk metode transfer."
            : "Tanggal, nominal, dan keperluan wajib diisi.",
      });
      return;
    }

    try {
      // SEND API
      const res = await api.post("/kasbon", {
        pegawai_id: form.pegawai_id,
        company_id: form.company_id,
        tanggal: form.tanggal,
        nominal: Number(form.nominal.replace(/\D/g, "")),
        keperluan: form.keperluan,
        metode_pengiriman: form.metode_pengiriman,
        nomor_rekening:
          form.metode_pengiriman === "transfer"
            ? form.nomor_rekening
            : null,
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Kasbon berhasil ditambahkan!",
      }).then(() => {
        navigate("/kasbon-pegawai"); // redirect
      });

    } catch (err: any) {
      console.error("ERR:", err.response?.data);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || "Terjadi kesalahan.",
      });
    }
  };

  const formatRupiah = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number
      ? "Rp " + Number(number).toLocaleString("id-ID")
      : "";
  };


  // USER INTERFACE

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-indigo-400 text-white py-6 text-center rounded-b-3xl">
        <button className="absolute left-4 top-6">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-lg font-semibold">Tambah Data Kasbon</h1>
      </div>

      {/* CARD */}
      <div className="px-4 py-6">
        <div className="bg-white shadow-lg rounded-2xl p-6">

          {/* TANGGAL */}
          <label className="text-gray-600 text-sm">Tanggal</label>
          <input
            type="date"
            name="tanggal"
            value={form.tanggal}
            onChange={handleChange}
            className="w-full mt-1 mb-5 p-3 border rounded-xl"
          />

          {/* NOMINAL */}
          <label className="text-gray-600 text-sm">Nominal</label>
          <input
            type="text"
            name="nominal"
            value={form.nominal}
            onChange={(e) =>
              setForm({
                ...form,
                nominal: formatRupiah(e.target.value),
              })
            }
            className="w-full mt-1 mb-5 p-3 border rounded-xl"
            placeholder="Masukan Nominal"
          />


          {/* METODE PENGIRIMAN */}
          <label className="text-gray-600 text-sm">Metode Pengiriman</label>
          <select
            name="metode_pengiriman"
            value={form.metode_pengiriman}
            onChange={handleChange}
            className="w-full mt-1 mb-5 p-3 border rounded-xl bg-white"
          >
            <option value="cash">Cash</option>
            <option value="transfer">Transfer</option>
          </select>

          {form.metode_pengiriman === "transfer" && (
          <>
            <label className="text-gray-600 text-sm">Nomor Rekening</label>
            <input
              type="text"
              name="nomor_rekening"
              value={form.nomor_rekening}
              onChange={handleChange}
              className="w-full mt-1 mb-5 p-3 border rounded-xl"
              placeholder="Masukkan nomor rekening"
            />
          </>
        )}

          {/* KEPERLUAN */}
          <label className="text-gray-600 text-sm">Keperluan</label>
          <textarea
            name="keperluan"
            rows={3}
            value={form.keperluan}
            onChange={handleChange}
            className="w-full mt-1 mb-5 p-3 border rounded-xl"
            placeholder="Masukkan keperluan"
          />
        </div>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl text-lg font-medium shadow-md hover:bg-blue-700"
        >
          Submit
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
