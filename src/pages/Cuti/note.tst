import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";

interface Pegawai {
  id: number;
  name: string;
  company_id: number;
}

interface Company {
  id: number;
  name: string;
}

export default function AddCuti() {
  const [pegawais, setPegawais] = useState<Pegawai[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pegawaiFiltered, setPegawaiFiltered] = useState<Pegawai[]>([]);

  const navigate = useNavigate();

  const [form, setForm] = useState({
    pegawai_id: "",
    company_id: "",
    jenis_cuti: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    alasan: "",
    foto: null as File | null,
  });

  // FETCH COMPANY
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/companies", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCompanies(res.data.data ?? []);
      } catch (err) {
        console.error("Error fetch company:", err);
        setCompanies([]);
      }
    };

    fetchCompanies();
  }, []);

  // FETCH PEGAWAI
  useEffect(() => {
    const fetchPegawais = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/pegawais", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const mapped = (res.data.data ?? []).map((p: any) => ({
          id: p.id,
          name: p.name || "Unnamed",
          company_id: p.company_id ?? p.company?.id ?? null,
        }));

        setPegawais(mapped);
      } catch (err) {
        console.error("Error fetch pegawai:", err);
        setPegawais([]);
      }
    };

    fetchPegawais();
  }, []);

  // FILTER PEGAWAI BERDASARKAN COMPANY
  useEffect(() => {
    if (!form.company_id) {
      setPegawaiFiltered([]);
      return;
    }

    const filtered = pegawais.filter(
      (p) => p.company_id === Number(form.company_id)
    );

    setPegawaiFiltered(filtered);
  }, [form.company_id, pegawais]);

  // HANDLING COMPANY CHANGE
  const handleCompanyChange = (companyId: string) => {
    setForm((prev) => ({
      ...prev,
      company_id: companyId,
      pegawai_id: "",
    }));
  };

  // HANDLING PEGAWAI CHANGE
  const handlePegawaiChange = (id: string) => {
    const pg = pegawais.find((p) => p.id === Number(id));

    setForm((prev) => ({
      ...prev,
      pegawai_id: id,
      company_id: pg ? String(pg.company_id) : prev.company_id,
    }));
  };

  // SUBMIT FORM
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value as any);
    });

    try {
      await api.post("/cuti", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire("Berhasil!", "Cuti berhasil ditambahkan.", "success");
      navigate("/cuti");
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan data.", "error");
    }
  };

  return (
    <>
      <PageMeta title="Tambah Cuti" description="Form untuk menambah data cuti" />
      <PageHeader pageTitle="Tambah Cuti" titleClass="text-[32px] dark:text-white" />

      <div className="mt-4">
        <ComponentCard className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* COMPANY */}
            <div>
              <label className="block mb-1 font-medium">Company</label>
              <select
                value={form.company_id}
                onChange={(e) => handleCompanyChange(e.target.value)}
                className="border rounded-lg w-full p-2"
                required
              >
                <option value="">-- Pilih Company --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* PEGAWAI */}
            <div>
              <label className="block mb-1 font-medium">Pegawai</label>
              <select
                value={form.pegawai_id}
                onChange={(e) => handlePegawaiChange(e.target.value)}
                className="border rounded-lg w-full p-2"
                required
                disabled={!form.company_id}
              >
                <option value="">
                  {form.company_id ? "-- Pilih Pegawai --" : "Pilih company dulu"}
                </option>

                {pegawaiFiltered.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* JENIS CUTI */}
            <div>
              <label className="block mb-1 font-medium">Jenis Cuti</label>
              <input
                type="text"
                value={form.jenis_cuti}
                onChange={(e) =>
                  setForm({ ...form, jenis_cuti: e.target.value })
                }
                className="border rounded-lg w-full p-2"
                placeholder="Contoh: tahunan / sakit / melahirkan"
                required
              />
            </div>

            {/* TANGGAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Tanggal Mulai</label>
                <input
                  type="date"
                  value={form.tanggal_mulai}
                  onChange={(e) =>
                    setForm({ ...form, tanggal_mulai: e.target.value })
                  }
                  className="border rounded-lg w-full p-2"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Tanggal Selesai</label>
                <input
                  type="date"
                  value={form.tanggal_selesai}
                  onChange={(e) =>
                    setForm({ ...form, tanggal_selesai: e.target.value })
                  }
                  className="border rounded-lg w-full p-2"
                  required
                />
              </div>
            </div>

            {/* ALASAN */}
            <div>
              <label className="block mb-1 font-medium">Alasan</label>
              <textarea
                value={form.alasan}
                onChange={(e) => setForm({ ...form, alasan: e.target.value })}
                className="border rounded-lg w-full p-2"
                rows={3}
                placeholder="Masukkan alasan cuti"
                required
              />
            </div>

            {/* FOTO */}
            <div>
              <label className="block mb-1 font-medium">Foto (Opsional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm({ ...form, foto: e.target.files?.[0] || null })
                }
                className="border rounded-lg w-full p-2 cursor-pointer"
              />
            </div>

            {/* BUTTON */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Simpan
              </button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
