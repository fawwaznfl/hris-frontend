import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import Swal from "sweetalert2";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";

interface Pegawai {
  id: number;
  name: string;
  company_id: number | null;
}

interface Company {
  id: number;
  name: string;
}

interface Kategori {
  id: number;
  nama: string;
  jumlah: number;
}

type FormState = {
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
};

export default function AddReimbursement() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const dashboardType = user.dashboard_type;
  const userCompanyId = user.company_id;

  const [form, setForm] = useState<FormState>({
    company_id: dashboardType === "admin" ? String(userCompanyId) : "",
    pegawai_id: "",
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

  const [pegawais, setPegawais] = useState<Pegawai[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const formatRupiah = (value: number | string | null) => {
    if (!value) return "Rp0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(value));
  };


  const [errors, setErrors] = useState({
    company_id: "",
    pegawai_id: "",
    kategori_reimbursement_id: "",
    tanggal: "",
    event: "",
    file: "",
  });

  // ============================
  // FETCH DATA
  // ============================
  const fetchCompanies = async () => {
    try {
      const res = await api.get("/companies");
      setCompanies(res.data.data ?? []);
    } catch (err) {
      console.error("fetchCompanies", err);
      setCompanies([]);
    }
  };

  const fetchPegawais = async () => {
    try {
      const res = await api.get("/pegawais");
      const payload = Array.isArray(res.data) ? res.data : res.data.data ?? [];

      const mapped = payload.map((p: Pegawai) => ({
        id: p.id,
        name: p.name ?? "-",
        company_id: p.company_id ?? null,
      }));

      if (dashboardType === "superadmin") {
        setPegawais(mapped);
      } else {
        setPegawais(
          mapped.filter((p: Pegawai) => String(p.company_id) === String(userCompanyId))
        );
      }
    } catch (err) {
      console.error("fetchPegawais", err);
      setPegawais([]);
    }
  };



  const fetchKategori = async () => {
    try {
      // Using the confirmed correct endpoint:
      const res = await api.get("/kategori-reimbursement");
      const data = Array.isArray(res.data.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setKategori(data);
    } catch (err) {
      console.error("fetchKategori", err);
      setKategori([]);
    }
  };

  useEffect(() => {
    setFetching(true);
    Promise.all([fetchCompanies(), fetchPegawais(), fetchKategori()]).finally(() =>
      setFetching(false)
    );
  }, []);

  // FILTER PEGAWAI BERDASARKAN COMPANY YANG DIPILIH
  const filteredPegawai =
    dashboardType === "admin"
      ? pegawais
      : pegawais.filter((p) => String(p.company_id) === String(form.company_id));


  // ============================
  // HANDLE INPUT
  // ============================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const name = e.target.name;
    const value = (e.target as HTMLInputElement).value;
    const files = (e.target as HTMLInputElement).files;

    if (name === "metode_reim") {
    setForm((s) => ({
      ...s,
      metode_reim: value,
      no_rekening: value === "transfer" ? s.no_rekening : "", // reset kalau bukan transfer
    }));
    return;
  }

    // FILE
    if (name === "file") {
      if (files && files[0]) {
        setForm((s) => ({ ...s, file: files[0] }));
      }
      return;
    }

    // RESET pegawai saat company berubah
    if (name === "company_id") {
      setForm((s) => ({ ...s, company_id: value, pegawai_id: "" }));
      return;
    }

    // KATEGORI dipilih -> isi jumlah/total/sisa otomatis
    if (name === "kategori_reimbursement_id") {
      const found = kategori.find((k) => String(k.id) === value);
      if (found) {
        const terpakaiNum = Number(form.terpakai || 0);
        const totalCalc = Math.max(found.jumlah - terpakaiNum, 0);
        setForm((s) => ({
          ...s,
          kategori_reimbursement_id: value,
          jumlah: String(found.jumlah),
          // keep terpakai if exists else default to "0"
          terpakai: s.terpakai || "0",
          total: String(totalCalc),
          sisa: String(totalCalc),
        }));
      } else {
        // clear if no found
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

    // terpakai -> recalc total & sisa
    if (name === "terpakai") {
      const terpakaiNum = Number(value || 0);
      const jumlahNum = Number(form.jumlah || 0);
      const totalNum = jumlahNum - terpakaiNum;
      const final = totalNum >= 0 ? totalNum : 0;
      setForm((s) => ({
        ...s,
        terpakai: String(terpakaiNum),
        total: String(final),
        sisa: String(final),
      }));
      return;
    }

    // default set
    setForm((s) => ({ ...s, [name]: value }));
  };

  const removeFile = () => setForm((s) => ({ ...s, file: null }));

  // ============================
  // VALIDATION
  // ============================
  const validate = () => {
    const newErr = {
      company_id: "",
      pegawai_id: "",
      kategori_reimbursement_id: "",
      tanggal: "",
      event: "",
      file: "",
    };

    let ok = true;

    if (!form.company_id) {
      newErr.company_id = "Pilih company";
      ok = false;
    }

    if (!form.pegawai_id) {
      newErr.pegawai_id = "Pilih pegawai";
      ok = false;
    }

    if (!form.kategori_reimbursement_id) {
      newErr.kategori_reimbursement_id = "Pilih kategori";
      ok = false;
    }

    if (!form.tanggal) {
      newErr.tanggal = "Tanggal wajib diisi";
      ok = false;
    }

    if (!form.event.trim()) {
      newErr.event = "Event wajib diisi";
      ok = false;
    }

    if (!form.file) {
      newErr.file = "File wajib diupload";
      ok = false;
    }

    if (form.metode_reim === "transfer" && !form.no_rekening.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Nomor rekening wajib diisi",
      });
      ok = false;
    }

    setErrors(newErr);
    return ok;
  };


  // ============================
  // SUBMIT
  // ============================
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      const fd = new FormData();

      fd.append("pegawai_id", form.pegawai_id);
      fd.append("kategori_reimbursement_id", form.kategori_reimbursement_id);
      fd.append("tanggal", form.tanggal);

      // 🚨 REQUIRED
      fd.append("event", form.event);
      fd.append("metode_reim", form.metode_reim);

      // 🚨 REQUIRED_IF transfer
      if (form.metode_reim === "transfer") {
        fd.append("no_rekening", form.no_rekening);
      }

      // optional tapi aman
      fd.append("jumlah", String(Number(form.jumlah || 0)));
      fd.append("terpakai", String(Number(form.terpakai || 0)));

      if (form.file) {
        fd.append("file", form.file);
      }

      await api.post("/reimbursement", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire("Berhasil", "Reimbursement berhasil ditambahkan", "success")
        .then(() => navigate("/reimbursement"));

    } catch (err: any) {
      console.error(err?.response?.data);
      Swal.fire(
        "Gagal",
        JSON.stringify(err?.response?.data?.errors || err?.response?.data),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };


  // ============================
  // User Interface
  // ============================
  return (
    <>
      <PageMeta title="Add-Reimbursement" description="Add Reimbursement" />
      <PageHeader
        pageTitle="Tambah Reimbursement"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <button
            onClick={() => navigate("/reimbursement")}
            className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-xl"
          >
            ⬅ Back
          </button>
        }
      />

      <div className="mt-4">
        <ComponentCard title="Form Reimbursement">
          {fetching ? (
            <p className="text-gray-700 dark:text-gray-300">Loading...</p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {/* COMPANY */}
              {dashboardType === "superadmin" && (
                <div>
                  <Label>Company</Label>
                  <select
                    name="company_id"
                    value={form.company_id}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">-- Pilih Company --</option>
                    {companies.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.company_id && <p className="text-red-500">{errors.company_id}</p>}
                </div>
              )}

              {/* PEGAWAI */}
              <div>
                <Label>Pegawai</Label>
                <select
                  name="pegawai_id"
                  value={form.pegawai_id}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-800 dark:text-white"
                  disabled={dashboardType === "superadmin" && !form.company_id}
                >
                  <option value="">
                    {dashboardType === "admin"
                      ? "-- Pilih Pegawai --"
                      : form.company_id
                      ? "-- Pilih Pegawai --"
                      : "Pilih company dulu"}
                  </option>

                  {filteredPegawai.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {errors.pegawai_id && <p className="text-red-500">{errors.pegawai_id}</p>}
              </div>

              {/* KATEGORI */}
              <div>
                <Label>Kategori Reimbursement</Label>
                <select
                  name="kategori_reimbursement_id"
                  value={form.kategori_reimbursement_id}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-800 dark:text-white"
                >
                  <option value="">-- Pilih Kategori --</option>
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
              <div>
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  name="tanggal"
                  value={form.tanggal}
                  onChange={handleChange}
                  className="dark:bg-gray-800 dark:text-white"
                />
                {errors.tanggal && <p className="text-red-500">{errors.tanggal}</p>}
              </div>

              {/* EVENT */}
              <div>
                <Label>Event</Label>
                <Input
                  name="event"
                  value={form.event}
                  onChange={handleChange}
                  placeholder="Nama event"
                  className="dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* JUMLAH (AUTO) */}
              <div>
                <Label>Jumlah (dari kategori)</Label>
                <Input
                  name="jumlah"
                  value={form.jumlah ? formatRupiah(form.jumlah) : ""}
                  disabled
                  className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white"
                />
              </div>

              {/* TERPAKAI */}
              <div>
                <Label>Terpakai</Label>
                <Input
                  type="number"
                  name="terpakai"
                  value={form.terpakai}
                  onChange={handleChange}
                  className="dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* TOTAL (AUTO) */}
              <div>
                <Label>Total</Label>
                <Input
                  name="total"
                  value={form.total ? formatRupiah(form.total) : ""}
                  disabled
                  className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white"
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

              {/* STATUS */}
              <div>
                <Label>Status</Label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* FILE */}
              <div>
                <Label>File Reimbursement</Label>
                <div className="border-2 border-dashed p-4 rounded relative cursor-pointer">
                  {!form.file ? (
                    <>
                      <p className="text-gray-500">Klik untuk pilih file</p>
                      <input
                        type="file"
                        name="file"
                        onChange={handleChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{form.file.name}</span>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="text-red-500 font-bold"
                      >
                        ✖
                      </button>
                    </div>
                  )}
                </div>
                {errors.file && <p className="text-red-500">{errors.file}</p>}
              </div>

              {/* SUBMIT */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`${
                    loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  } text-white px-6 py-2 rounded-xl`}
                >
                  {loading ? "Menyimpan..." : "Save"}
                </button>
              </div>
            </form>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
