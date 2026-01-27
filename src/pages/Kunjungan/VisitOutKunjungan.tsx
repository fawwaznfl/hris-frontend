import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import Swal from "sweetalert2";

export default function VisitOutKunjungan() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lokasiKeluar, setLokasiKeluar] = useState("");
  const [form, setForm] = useState({
    keterangan_keluar: "",
    foto_keluar: null as File | null,
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLokasiKeluar(`${pos.coords.latitude},${pos.coords.longitude}`);
      },
      () => Swal.fire("Error", "GPS tidak aktif", "error")
    );
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!form.foto_keluar || !lokasiKeluar) {
      Swal.fire("Error", "Foto & lokasi wajib diisi", "error");
      return;
    }

    const formData = new FormData();
    formData.append("foto_keluar", form.foto_keluar);
    formData.append("lokasi_keluar", lokasiKeluar);
    formData.append("keterangan_keluar", form.keterangan_keluar);

    try {
      await api.post(`/kunjungan/${id}?_method=PUT`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire("Berhasil", "Visit out berhasil", "success");
      navigate("/kunjungan");
    } catch (err: any) {
      Swal.fire("Gagal", err.response?.data?.message || "Error", "error");
    }
  };

  return (
    <>
      <PageMeta title="Visit Out" description="Visit Out Kunjungan" />
      <PageHeader pageTitle="Visit Out" />

      <ComponentCard>
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label>Keterangan</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              rows={3}
              onChange={(e) =>
                setForm({ ...form, keterangan_keluar: e.target.value })
              }
            />
          </div>

          <div>
            <label>Foto Keluar</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm({ ...form, foto_keluar: e.target.files?.[0] || null })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="flex justify-end">
            <button className="bg-orange-600 text-white px-6 py-2 rounded-lg">
              Simpan Visit Out
            </button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
