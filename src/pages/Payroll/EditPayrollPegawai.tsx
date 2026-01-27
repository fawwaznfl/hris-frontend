import { useEffect, useState, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import EditableBarValue from "../../components/Payroll/EditableBarValue";
import BarValueEdit from "../../components/Payroll/Edit/BarValueEdit";
import DualBarValueEdit from "../../components/Payroll/Edit/DualBarValueEdit";

const formatRupiah = (value: number | string) => {
  if (!value) return "";
  const num = typeof value === "number" ? value : Number(value);
  return num.toLocaleString("id-ID");
};

const parseRupiah = (value: string) => {
  return Number(value.replace(/\D/g, "")) || 0;
};


interface DualBarValueEditableBottomProps {
  title: string;
  topValue: number;
  topLabel: string;
  bottomValue: number;
  bottomLabel: string;
  onBottomChange: (val: number) => void;
}

const DualBarValueEditableBottom = ({
  title,
  topValue,
  topLabel,
  bottomValue,
  bottomLabel,
  onBottomChange,
}: DualBarValueEditableBottomProps) => {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    setDisplay(bottomValue > 0 ? formatRupiah(bottomValue) : "");
  }, [bottomValue]);


  return (
    <div className="flex flex-col space-y-3">
      <span className="text-sm font-medium text-gray-700">{title}</span>

      {/* BAR ATAS — READ ONLY */}
      <div className="flex overflow-hidden rounded-xl border bg-gray-100">
        <div className="flex-1 bg-orange-400 px-4 py-2 text-black">
          {topValue.toLocaleString("id-ID")}
        </div>
        <div className="bg-gray-200 px-4 py-2 text-gray-700 whitespace-nowrap">
          {topLabel}
        </div>
      </div>

      {/* BAR BAWAH — EDITABLE */}
      <div className="flex overflow-hidden rounded-xl border bg-gray-100">
        <input
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={display}
          onChange={(e) => {
            const raw = e.target.value;
            const parsed = parseRupiah(raw);

            setDisplay(parsed ? formatRupiah(parsed) : "");
            onBottomChange(parsed);
          }}
          className="flex-1 bg-white px-4 py-2 text-black outline-none"
        />
        <div className="bg-gray-200 px-4 py-2 text-gray-700 whitespace-nowrap">
          {bottomLabel}
        </div>
      </div>
    </div>
  );
};

interface GajiForm {
  company_id?: number;
  pegawai: string;
  jabatan: string;
  total_tambah: number;
  total_pengurangan: number;
  gaji_diterima: number;
  pegawai_id?: number;
  bulan: string;
  tahun: number;
  rekening: string;
  tanggal_bergabung: string;
  tanggal_mulai: string;
  tanggal_akhir: string;
  nomor_gaji: string;
  total_reimbursement: number; 
  mangkir_count: number;  
  mangkir: number;
  lembur_count: number;  
  lembur: number;
  izin_masuk_count: number;  
  izin: number;
  terlambat_count: number;  
  terlambat: number;
  kehadiran_100_count: number;  
  kehadiran: number;
  saldo_kasbon_count: number;  
  saldo_kasbon: number;
  tunjangan_bpjs_kesehatan_count: number;  
  tunjangan_bpjs_kesehatan: number;
  tunjangan_bpjs_ketenagakerjaan_count: number;  
  tunjangan_bpjs_ketenagakerjaan: number;
  tunjangan_pajak_count: number;  
  tunjangan_pajak: number;
  potongan_bpjs_kesehatan_count: number;  
  potongan_bpjs_kesehatan: number;
  potongan_bpjs_ketenagakerjaan_count: number;  
  potongan_bpjs_ketenagakerjaan: number;
  thr: number;
  thr_count: number;

  bonus_pribadi: number;
  bonus_team: number;
  bonus_jackpot: number;

  gaji_pokok: number;
  uang_transport: number;
  potongan: number;
  loss: number;
}

interface InputProps {
  label: string;
  value?: string | number;
  type?: string;
  disabled?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Input = ({
  label,
  value,
  type = "text",
  disabled = false,
  onChange,
}: InputProps) => (
  <div className="flex flex-col space-y-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      value={value}
      disabled={disabled}
      onChange={onChange}
      className="rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
    />
  </div>
);

  interface SelectProps {
    label: string;
    value: string | number;
    options: { label: string; value: string | number }[];
    disabled?: boolean;
    onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  }

  const Select = ({
    label,
    value,
    options,
    disabled = false,
    onChange,
  }: SelectProps) => (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        disabled={disabled}
        onChange={onChange}
        className="rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      >
        <option value="">Pilih</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );


export default function EditPayrollPegawai() {
  const { payrollId } = useParams<{ payrollId: string }>();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const startDateParam = searchParams.get("start_date");
  const endDateParam = searchParams.get("end_date");

  const toNumber = (val: any) => Number(val) || 0;
  

  



  const [form, setForm] = useState<GajiForm>({
    pegawai: "",
    jabatan: "",
    bulan: "",
    pegawai_id: undefined,
    tanggal_bergabung: "",
    tahun: 0,
    rekening: "",
    tanggal_mulai: "",
    tanggal_akhir: "",
    nomor_gaji: "",
    potongan: 0,

    gaji_pokok: 0,
    uang_transport: 0,

    total_reimbursement: 0,

    mangkir_count: 0,
    mangkir: 0,

    lembur_count: 0,
    lembur: 0,

    izin_masuk_count: 0,
    izin: 0,

    terlambat_count: 0,
    terlambat: 0,

    kehadiran_100_count: 0,
    kehadiran: 0,

    saldo_kasbon: 0,
    saldo_kasbon_count: 0,

    tunjangan_bpjs_kesehatan: 0,
    tunjangan_bpjs_kesehatan_count: 0,

    tunjangan_bpjs_ketenagakerjaan: 0,
    tunjangan_bpjs_ketenagakerjaan_count: 0,

    tunjangan_pajak: 0,
    tunjangan_pajak_count: 0,

    potongan_bpjs_kesehatan: 0,
    potongan_bpjs_kesehatan_count: 0,

    potongan_bpjs_ketenagakerjaan: 0,
    potongan_bpjs_ketenagakerjaan_count: 0,

    thr: 0,
    thr_count: 0,

    bonus_pribadi: 0,
    bonus_team: 0,
    bonus_jackpot: 0,

    loss: 0,

    total_tambah: 0,
    total_pengurangan: 0,
    gaji_diterima: 0,
    });


  const fetchData = async () => {
    if (!payrollId) return;

    const res = await api.get(`/payrolls/${payrollId}`);
    const d = res.data;
    const [start = "", end = ""] = (d.periode ?? "").split(" - ");


    setForm((prev) => ({
    ...prev,

    company_id: d.company_id,
    pegawai: d.pegawai.name,
    pegawai_id: d.pegawai_id,
    jabatan: d.pegawai.divisi?.nama || "",
    bulan: d.bulan,
    tahun: d.tahun,
    rekening: d.pegawai.rekening || "",
    tanggal_bergabung: d.pegawai.tanggal_bergabung ?? "",
    tanggal_mulai: start,
    nomor_gaji: d.nomor_gaji,
    tanggal_akhir: end,
    gaji_pokok: Math.floor(Number(d.gaji_pokok)),
    uang_transport: Math.floor(Number(d.uang_transport)),
    total_reimbursement: Math.floor(Number(d.reimbursement ?? 0)),
    lembur_count: d.lembur ?? 0,
    lembur: d.uang_lembur ?? 0,
    thr_count: d.thr ?? 0,                 
    thr: d.tunjangan_hari_raya ?? 0, 


    mangkir_count: d.mangkir ?? 0,
    mangkir: d.uang_mangkir ?? 0,
    izin_masuk_count: d.izin ?? 0,
    izin: d.uang_izin ?? 0,
    terlambat_count: d.terlambat ?? 0,
    terlambat: d.uang_terlambat ?? 0,
    bonus_pribadi: Math.floor(Number(d.bonus_pribadi ?? 0)),
    bonus_team: Math.floor(Number(d.bonus_team ?? 0)),
    bonus_jackpot: Math.floor(Number(d.bonus_jackpot ?? 0)),
    tunjangan_bpjs_kesehatan: Math.floor(Number(d.tunjangan_bpjs_kesehatan ?? 0)),
    tunjangan_bpjs_kesehatan_count: 0,
    tunjangan_bpjs_ketenagakerjaan: Math.floor(Number(d.tunjangan_bpjs_ketenagakerjaan ?? 0)),
    tunjangan_bpjs_ketenagakerjaan_count: 0,
    tunjangan_pajak: Math.floor(Number(d.tunjangan_pajak ?? 0)),
    tunjangan_pajak_count: 0,
    potongan_bpjs_kesehatan: Math.floor(Number(d.potongan_bpjs_kesehatan ?? 0)),
    potongan_bpjs_kesehatan_count: 0,
    potongan_bpjs_ketenagakerjaan: Math.floor(Number(d.potongan_bpjs_ketenagakerjaan ?? 0)),
    potongan_bpjs_ketenagakerjaan_count: 0,
    saldo_kasbon: d.pegawai?.saldo_kasbon ?? 0,
    saldo_kasbon_count: d.bayar_kasbon ?? 0,
    kehadiran: d.bonus_kehadiran ?? 0,
    kehadiran_100_count: d.kehadiran_100 ?? 0,
    loss: d.loss ?? 0,
    }));
  }

  

  useEffect(() => {
    const init = async () => {
      try {
        await fetchData();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [payrollId]);

  const bulanOptions = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ].map((b) => ({ label: b, value: b }));

  const currentYear = new Date().getFullYear();
  const tahunOptions = Array.from({ length: 7 }, (_, i) => {
    const year = currentYear - 3 + i;
    return { label: year.toString(), value: year };
  });

  const handleSimpanPayroll = async () => {
    const confirm = await Swal.fire({
      title: "Simpan Payroll?",
      text: "Pastikan data sudah benar",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      const payload = {
        pegawai_id: form.pegawai_id,
        bulan: form.bulan,
        tahun: Number(form.tahun),

        gaji_pokok: toNumber(form.gaji_pokok),
        uang_transport: toNumber(form.uang_transport),

        lembur: toNumber(form.lembur_count),
        uang_lembur: toNumber(form.lembur),

        kehadiran_100: toNumber(form.kehadiran_100_count),
        bonus_kehadiran: toNumber(form.kehadiran),

        thr: toNumber(form.thr_count),
        tunjangan_hari_raya: toNumber(form.thr),

        bonus_pribadi: toNumber(form.bonus_pribadi),
        bonus_team: toNumber(form.bonus_team),
        bonus_jackpot: toNumber(form.bonus_jackpot),

        reimbursement: toNumber(form.total_reimbursement),

        tunjangan_bpjs_kesehatan: toNumber(form.tunjangan_bpjs_kesehatan),
        tunjangan_bpjs_ketenagakerjaan: toNumber(form.tunjangan_bpjs_ketenagakerjaan),
        tunjangan_pajak: toNumber(form.tunjangan_pajak),

        mangkir: toNumber(form.mangkir_count),
        uang_mangkir: toNumber(form.mangkir),

        izin: toNumber(form.izin_masuk_count),
        uang_izin: toNumber(form.izin),

        terlambat: toNumber(form.terlambat_count),
        uang_terlambat: toNumber(form.terlambat),

        bayar_kasbon: toNumber(form.saldo_kasbon_count),

        potongan_bpjs_kesehatan: toNumber(form.potongan_bpjs_kesehatan),
        potongan_bpjs_ketenagakerjaan: toNumber(form.potongan_bpjs_ketenagakerjaan),
        loss: toNumber(form.loss),

        total_tambah: toNumber(form.total_tambah),
        total_pengurangan: toNumber(form.total_pengurangan),
        gaji_diterima: toNumber(form.gaji_diterima),

        periode_awal: startDateParam ?? form.tanggal_mulai,
        periode_akhir: endDateParam ?? form.tanggal_akhir,
        status: "final",
      };



      await api.put(`/payrolls/${payrollId}`, payload);

      Swal.fire({
      icon: "success",
      title: "Payroll Tersimpan 🎉",
      text: "Data payroll berhasil disimpan",
      confirmButtonText: "Oke",
      confirmButtonColor: "#2563eb",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/payroll");
      }
    });
    } catch (error: any) {
    if (error.response) {
      console.log("STATUS:", error.response.status);
      console.log("DATA:", error.response.data);
      console.log("ERROR VALIDASI:", error.response.data.errors);
    } else {
      console.log(error);
    }
  }

  };

  // === HITUNG PENJUMLAHAN ===
  const totalLembur =
    (form.lembur_count || 0) * (form.lembur || 0);

  const totalKehadiran =
    (form.kehadiran_100_count || 0) * (form.kehadiran || 0);

  const totalTHR =
    (form.thr_count || 0) * (form.thr || 0);

  const totalPenjumlahan =
    (form.gaji_pokok || 0) +
    (form.uang_transport || 0) +
    (form.total_reimbursement || 0) +
    totalLembur +
    (form.bonus_pribadi || 0) +
    (form.bonus_team || 0) +
    (form.bonus_jackpot || 0) +
    totalKehadiran +
    (form.tunjangan_bpjs_kesehatan || 0) +
    (form.tunjangan_bpjs_ketenagakerjaan || 0) +
    (form.tunjangan_pajak || 0) +
    totalTHR;

    // === HITUNG PENGURANGAN ===
    const totalMangkir =
      (form.mangkir_count || 0) * (form.mangkir || 0);

    const totalIzin =
      (form.izin_masuk_count || 0) * (form.izin || 0);

    const totalTerlambat =
      (form.terlambat_count || 0) * (form.terlambat || 0);

    const totalPengurangan =
      Number(totalMangkir) +
      Number(totalIzin) +
      Number(totalTerlambat) +
      Number(form.saldo_kasbon_count || 0) +
      Number(form.potongan_bpjs_kesehatan || 0) +
      Number(form.potongan_bpjs_ketenagakerjaan || 0) +
      Number(form.loss || 0);


    const grandTotalGaji =
      totalPenjumlahan - totalPengurangan;

    useEffect(() => {
      if (loading) return;

      setForm((prev) => ({
        ...prev,
        total_tambah: Number(totalPenjumlahan),
        total_pengurangan: Number(totalPengurangan),
        gaji_diterima: Number(grandTotalGaji),
      }));
    }, [loading, totalPenjumlahan, totalPengurangan]);


    if (loading) return <p>Loading...</p>;


  // USER INTERFACE
  return (
    <>
      <PageMeta
        title="Edit Payroll Pegawai"
        description="Perhitungan gaji pegawai berdasarkan kehadiran"
      />

      <PageHeader pageTitle="Edit Payroll Pegawai" />

      <ComponentCard>
        <div className="grid grid-cols-2 gap-6">
          <Input label="Pegawai" value={form.pegawai} disabled />
          <Select label="Bulan" value={form.bulan} options={bulanOptions} onChange={(e) =>
              setForm({ ...form, bulan: e.target.value })
            }
          />
          <Select label="Tahun" value={form.tahun} options={tahunOptions} onChange={(e) =>
              setForm({ ...form, tahun: Number(e.target.value) })
            }
          />
          <Input
            label="Nomor Gaji"
            value={form.nomor_gaji}
            disabled
          />
          <Input label="Jabatan" value={form.jabatan} disabled />
          <Input label="Nomor Rekening" value={form.rekening} disabled />
          <Input label="Tanggal Mulai" value={form.tanggal_mulai} disabled />
          <Input label="Tanggal Akhir" value={form.tanggal_akhir} disabled />
          
          <EditableBarValue title="Gaji Pokok" value={form.gaji_pokok} onChange={(val) =>
              setForm((prev) => ({ ...prev, gaji_pokok: val }))
            }
          />

          <EditableBarValue title="Uang Transport" value={form.uang_transport} onChange={(val) =>
            setForm((prev) => ({ ...prev, uang_transport: val }))
          }
          />
  
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <BarValueEdit title="Reimbursement" value={form.total_reimbursement} suffix="Total Reimbursement"
              onChange={(val) =>
                setForm((prev) => ({
                  ...prev,
                  total_reimbursement: val,
                }))
              }
            />
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <DualBarValueEdit
              title="Mangkir"
              count={form.mangkir_count}
              countSuffix="/ Kali"
              amount={form.mangkir}
              amountLabel="Uang Mangkir"
              onCountChange={(val) =>
                setForm((prev) => ({ ...prev, mangkir_count: val }))
              }
              onAmountChange={(val) =>
                setForm((prev) => ({ ...prev, mangkir: val }))
              }
            />
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <DualBarValueEdit
              title="Lembur"
              count={form.lembur_count}
              countSuffix="/ Jam"
              amount={form.lembur}
              amountLabel="Uang Lembur"
              onCountChange={(val) =>
                setForm((prev) => ({ ...prev, lembur_count: val }))
              }
              onAmountChange={(val) =>
                setForm((prev) => ({ ...prev, lembur: val }))
              }
            />
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <DualBarValueEdit
              title="Izin Masuk"
              count={form.izin_masuk_count}
              countSuffix="/ kali"
              amount={form.izin}
              amountLabel="Uang Izin"
              onCountChange={(val) =>
                setForm((prev) => ({ ...prev, izin_masuk_count: val }))
              }
              onAmountChange={(val) =>
                setForm((prev) => ({ ...prev, izin: val }))
              }
            />
          </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col space-y-4">
            <BarValueEdit
              title="Bonus Pegawai"
              value={form.bonus_pribadi}
              suffix="Bonus Pribadi"
              onChange={(val) =>
                setForm((prev) => ({ ...prev, bonus_pribadi: val }))
              }
            />

            <BarValueEdit
              value={form.bonus_team}
              suffix="Bonus Team"
              onChange={(val) =>
                setForm((prev) => ({ ...prev, bonus_team: val }))
              }
            />

            <BarValueEdit
              value={form.bonus_jackpot}
              suffix="Bonus Jackpot"
              onChange={(val) =>
                setForm((prev) => ({ ...prev, bonus_jackpot: val }))
              }
            />
          </div>
        </div>



        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <DualBarValueEdit
            title="Terlambat"
            count={form.terlambat_count}
            countSuffix="/ kali"
            amount={form.terlambat}
            amountLabel="Uang Terlambat"
            onCountChange={(val) =>
              setForm((prev) => ({ ...prev, terlambat_count: val }))
            }
            onAmountChange={(val) =>
              setForm((prev) => ({ ...prev, terlambat: val }))
            }
          />
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <DualBarValueEdit
            title="100% Kehadiran"
            count={form.kehadiran_100_count}
            countSuffix="/ Kali"
            amount={form.kehadiran}
            amountLabel="Uang 100% Kehadiran"
            onCountChange={(val) =>
              setForm((prev) => ({ ...prev, kehadiran_100_count: val }))
            }
            onAmountChange={(val) =>
              setForm((prev) => ({ ...prev, kehadiran: val }))
            }
          />
        </div>


        
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <DualBarValueEditableBottom
            title="Kasbon"
            topValue={form.saldo_kasbon}
            topLabel="Total Kasbon"
            bottomValue={form.saldo_kasbon_count}
            bottomLabel="Bayar Kasbon"
            onBottomChange={(val) => {
              setForm((prev) => ({
                ...prev,
                saldo_kasbon_count: val,
              }));
            }}
          />
        </div>
        
         <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col space-y-4">
            <BarValueEdit
              title="Tunjangan BPJS dan Pajak"
              value={form.tunjangan_bpjs_kesehatan}
              suffix="BPJS Kesehatan"
              onChange={(val) =>
                setForm((prev) => ({ ...prev, tunjangan_bpjs_kesehatan: val }))
              }
            />

            <BarValueEdit
              value={form.tunjangan_bpjs_ketenagakerjaan}
              suffix="BPJS Ketenagakerjaan"
              onChange={(val) =>
                setForm((prev) => ({ ...prev, tunjangan_bpjs_ketenagakerjaan: val }))
              }
            />

            <BarValueEdit
              value={form.tunjangan_pajak}
              suffix="Tunjangan Pajak"
              onChange={(val) =>
                setForm((prev) => ({ ...prev, tunjangan_pajak: val }))
              }
            />
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col space-y-4">
            <BarValueEdit
              title="Potongan BPJS"
              value={form.potongan_bpjs_kesehatan}
              suffix="Potongan BPJS Kesehatan"
              onChange={(val) =>
                setForm((prev) => ({ ...prev, potongan_bpjs_kesehatan: val }))
              }
            />

            <BarValueEdit
              value={form.potongan_bpjs_ketenagakerjaan}
              suffix="Potongan BPJS Ketenagakerjaan"
              onChange={(val) =>
                setForm((prev) => ({ ...prev, potongan_bpjs_ketenagakerjaan: val }))
              }
            />

          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <DualBarValueEdit
            title="Tunjangan Hari Raya"
            count={form.thr_count}
            countSuffix="/ kali"
            amount={form.thr}
            amountLabel="Uang THR"
            onCountChange={(val) =>
              setForm((prev) => ({ ...prev, thr_count: val }))
            }
            onAmountChange={(val) =>
              setForm((prev) => ({ ...prev, thr: val }))
            }
          />
        </div>



          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">Loss</label>

            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={form.loss ? formatRupiah(form.loss) : ""}
              onChange={(e) => {
                const parsed = parseRupiah(e.target.value);
                setForm((prev) => ({
                  ...prev,
                  loss: parsed,
                }));
              }}
              className="rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

            {/* ACTION BUTTON */}
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleSimpanPayroll}
                className="rounded-xl bg-blue-500 px-5 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                Update Payroll
              </button>
            </div>
          </div>

        {/* SUMMARY BOX */}
        <div className="col-span-2 grid grid-cols-2 gap-6 mt-4">
          {/* TOTAL PENJUMLAHAN */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm text-center">
            <p className="text-sm font-semibold text-green-600">
              TOTAL PENJUMLAHAN
            </p>
            <p className="mt-2 text-xl font-bold text-gray-800">
              Rp {formatRupiah(totalPenjumlahan)}
            </p>
          </div>

          {/* TOTAL PENGURANGAN */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm text-center">
            <p className="text-sm font-semibold text-red-600">
              TOTAL PENGURANGAN
            </p>
            <p className="mt-2 text-xl font-bold text-gray-800">
              Rp {formatRupiah(totalPengurangan)}
            </p>
          </div>

          {/* GRAND TOTAL */}
          <div className="col-span-2 rounded-2xl border bg-white p-8 shadow-sm text-center">
            <p className="text-base font-semibold text-blue-600">
              GRAND TOTAL
            </p>
            <p className="mt-3 text-2xl font-extrabold text-gray-900">
              Rp {formatRupiah(grandTotalGaji)}
            </p>
          </div>
        </div>
      </div>
      </ComponentCard>
    </>
  );
}
