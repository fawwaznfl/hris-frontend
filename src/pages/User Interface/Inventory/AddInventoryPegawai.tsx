import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../api/axios";
import { ArrowLeft } from "lucide-react";

export default function AddInventoryPegawai() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [loading, setLoading] = useState(false);

  const [divisi, setDivisi] = useState<any[]>([]);
  const [filteredDivisi, setFilteredDivisi] = useState<any[]>([]);

  const generateKodeBarang = () => {
    const random = Math.floor(10000 + Math.random() * 90000);
    return `BRG-${random}`;
  };

  const [form, setForm] = useState({
    kode_barang: generateKodeBarang(),
    nama_barang: "",
    stok: "",
    satuan: "",
    divisi_id: "",
    keterangan: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.nama_barang || !form.stok || !form.satuan) {
      Swal.fire("Oops", "Lengkapi data wajib", "warning");
      return;
    }

    if (!user?.id || !user?.company_id) {
      Swal.fire("Error", "User tidak valid, silakan login ulang", "error");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        pegawai_id: user.id,
        company_id: user.company_id,
        status: "tersedia",
      };

      await api.post("/inventory", payload);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Inventory berhasil ditambahkan",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/inventory-pegawai");
    } catch (err: any) {
      console.error(err?.response?.data);
      Swal.fire(
        "Gagal",
        err?.response?.data?.message || "Terjadi kesalahan",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDivisi = async () => {
        try {
        const res = await api.get("/pegawai/divisi");
        const data = res.data.data || [];

        // filter by company pegawai
        const fd = data.filter(
            (d: any) => d.company_id == user.company_id
        );

        setDivisi(data);
        setFilteredDivisi(fd);
        } catch (error) {
        console.error("Gagal fetch divisi", error);
        Swal.fire("Error", "Gagal memuat data divisi", "error");
        }
    };

    if (user?.company_id) {
        fetchDivisi();
    }
    }, [user?.company_id]);


  // USER INTERFACE
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 rounded-b-3xl">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft />
          </button>
          <h1 className="text-lg font-semibold text-center flex-1">
            Tambah Inventory
          </h1>
        </div>
      </div>

      {/* FORM */}
      <div className="p-5 space-y-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm space-y-3">

          {/* NAMA PEGAWAI */}
          <div>
            <label className="text-sm text-gray-600">Nama Pegawai</label>
            <input
              type="text"
              readOnly
              value={user?.name || "-"}
              className="w-full border rounded-xl px-4 py-3 bg-gray-100"
            />
          </div>

          {/* KODE BARANG */}
          <div>
            <label className="text-sm text-gray-600">Kode Barang</label>
            <input
              type="text"
              name="kode_barang"
              value={form.kode_barang}
              readOnly
              className="w-full border rounded-xl px-4 py-3 bg-gray-100"
            />
          </div>

          {/* DIVISI */}
        <div>
        <label className="text-sm text-gray-600">Divisi</label>
        <select
            name="divisi_id"
            value={form.divisi_id}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
        >
            <option value="">Pilih Divisi</option>

            {filteredDivisi.length === 0 ? (
            <option disabled>Tidak ada divisi</option>
            ) : (
            filteredDivisi.map((d: any) => (
                <option key={d.id} value={d.id}>
                {d.nama || d.nama_divisi}
                </option>
            ))
            )}
        </select>
        </div>


          {/* NAMA BARANG */}
          <div>
            <label className="text-sm text-gray-600">Nama Barang</label>
            <input
              name="nama_barang"
              value={form.nama_barang}
              onChange={handleChange}
              placeholder="Nama barang"
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          {/* STOK */}
          <div>
            <label className="text-sm text-gray-600">Stok</label>
            <input
              type="number"
              name="stok"
              value={form.stok}
              onChange={handleChange}
              placeholder="Jumlah stok"
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          {/* SATUAN */}
          <div>
            <label className="text-sm text-gray-600">Satuan</label>
            <input
              name="satuan"
              value={form.satuan}
              onChange={handleChange}
              placeholder="pcs / unit / box"
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          {/* KETERANGAN */}
          <div>
            <label className="text-sm text-gray-600">Keterangan</label>
            <textarea
              name="keterangan"
              value={form.keterangan}
              onChange={handleChange}
              rows={4}
              placeholder="Keterangan tambahan"
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>
        </div>

        {/* SUBMIT */}
        <button
          disabled={loading}
          onClick={handleSubmit}
          className="w-full bg-indigo-600 text-white py-3 rounded-full shadow-md disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Simpan Inventory"}
        </button>
      </div>
    </div>
  );
}
