import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker";
import FileInput from "../../components/form/input/FileInput";
import TextArea from "../../components/form/input/TextArea";
import Swal from "sweetalert2";

export interface PegawaiInitialValues {
  // ===== DATA PRIBADI =====
  name?: string;
  fotoPreview?: string | null;
  email?: string;
  telepon?: string;
  username?: string;
  statuspajak?: string;
  lokasiId?: string | null;
  divisiId?: string | null;
  roleId?: string | null;
  dashboardType?: string;
  tglLahir?: string | null;
  tglJoin?: string | null;
  statusNikah?: string;
  gender?: string;
  alamat?: string;
  // ===== TUNJANGAN & POTONGAN =====
  tunjanganBpjsKesehatan?: string;
  tunjanganBpjsKetenagakerjaan?: string;
  potBpjsKesehatan?: string;
  potBpjsKetenagakerjaan?: string;
  tunjanganPajak?: string;
  // ===== PENJUMLAHAN GAJI =====
  gajiPokok?: string;
  makanTransport?: string;
  lembur?: string;
  kehadiran100?: string;
  thr?: string;
  bonusPribadi?: string;
  bonusTeam?: string;
  bonusJackpot?: string;
  // ===== CUTI & IZIN =====
  cuti?: number;
  izinMasuk?: number;
  izinTelat?: number;
  izinPulangCepat?: number;
  // ===== PENGURANGAN GAJI =====
  izin?: string;
  terlambat?: string;
  mangkir?: string;
  saldoKasbon?: string;
  // ===== DOKUMEN =====
  ktpNo?: string;
  kkNo?: string;
  ktpFile?: File | null;
  kkFile?: File | null;
  bpjsKesehatanNo?: string;
  bpjsKetenagakerjaanNo?: string;
  npwpNo?: string;
  simNo?: string;
  noPkwt?: string;
  noKontrak?: string;
  tanggalMulaiPkwt?: string | null;
  tanggalBerakhirPkwt?: string | null;
  masaBerlaku?: string | null;
  rekeningNo?: string;
  namaRekening?: string;
}

interface PegawaiFormProps {
  initialValues?: PegawaiInitialValues;
  formTitle?: string;
  onSubmit?: (data: PegawaiInitialValues & { fotoFile?: File | null }) => Promise<void>;
}

export default function PegawaiForm({
  initialValues,
  formTitle = "Tambah Pegawai",
  onSubmit,
}: PegawaiFormProps) {
  const navigate = useNavigate();

  // ===== STATE DATA PRIBADI =====
  const [name, setName] = useState(initialValues?.name ?? "");
  const [fotoPreview, setFotoPreview] = useState<string | null>(initialValues?.fotoPreview ?? null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [email, setEmail] = useState(initialValues?.email ?? "");
  const [telepon, setTelepon] = useState(initialValues?.telepon ?? "");
  const [username, setUsername] = useState(initialValues?.username ?? "");
  const [statuspajak, setPassword] = useState(""); // kosongkan saat edit
  const [lokasiId, setLokasiId] = useState<string | null>(
    initialValues?.lokasiId?.toString() ?? null
  );
  const [divisiId, setDivisiId] = useState<string | null>(
    initialValues?.divisiId?.toString() ?? null
  );
  const [roleId, setRoleId] = useState<string | null>(
    initialValues?.roleId?.toString() ?? null
  );
  const [dashboardType, setDashboardType] = useState(initialValues?.dashboardType ?? "pegawai");
  const [tglLahir, setTglLahir] = useState<string | null>(initialValues?.tglLahir ?? null);
  const [tglJoin, setTglJoin] = useState<string | null>(initialValues?.tglJoin ?? null);
  const [statusNikah, setStatusNikah] = useState(initialValues?.statusNikah ?? "single");
  const [gender, setGender] = useState(initialValues?.gender ?? "male");
  const [alamat, setAlamat] = useState(initialValues?.alamat ?? "");

  // ===== TUNJANGAN & POTONGAN =====
  const [tunjanganBpjsKesehatan, setTunjanganBpjsKesehatan] = useState(initialValues?.tunjanganBpjsKesehatan ?? "0.00");
  const [tunjanganBpjsKetenagakerjaan, setTunjanganBpjsKetenagakerjaan] = useState(initialValues?.tunjanganBpjsKetenagakerjaan ?? "0.00");
  const [potBpjsKesehatan, setPotBpjsKesehatan] = useState(initialValues?.potBpjsKesehatan ?? "0.00");
  const [potBpjsKetenagakerjaan, setPotBpjsKetenagakerjaan] = useState(initialValues?.potBpjsKetenagakerjaan ?? "0.00");
  const [tunjanganPajak, setTunjanganPajak] = useState(initialValues?.tunjanganPajak ?? "0.00");

  // ===== PENJUMLAHAN GAJI =====
  const [gajiPokok, setGajiPokok] = useState(initialValues?.gajiPokok ?? "0.00");
  const [makanTransport, setMakanTransport] = useState(initialValues?.makanTransport ?? "0.00");
  const [lembur, setLembur] = useState(initialValues?.lembur ?? "0.00");
  const [kehadiran100, setKehadiran100] = useState(initialValues?.kehadiran100 ?? "0.00");
  const [thr, setThr] = useState(initialValues?.thr ?? "0.00");
  const [bonusPribadi, setBonusPribadi] = useState(initialValues?.bonusPribadi ?? "0.00");
  const [bonusTeam, setBonusTeam] = useState(initialValues?.bonusTeam ?? "0.00");
  const [bonusJackpot, setBonusJackpot] = useState(initialValues?.bonusJackpot ?? "0.00");

  // ===== CUTI & IZIN =====
  const [cuti, setCuti] = useState(initialValues?.cuti ?? 0);
  const [izinMasuk, setIzinMasuk] = useState(initialValues?.izinMasuk ?? 0);
  const [izinTelat, setIzinTelat] = useState(initialValues?.izinTelat ?? 0);
  const [izinPulangCepat, setIzinPulangCepat] = useState(initialValues?.izinPulangCepat ?? 0);

  // ===== PENGURANGAN GAJI =====
  const [izin, setIzin] = useState(initialValues?.izin ?? "0.00");
  const [terlambat, setTerlambat] = useState(initialValues?.terlambat ?? "0.00");
  const [mangkir, setMangkir] = useState(initialValues?.mangkir ?? "0.00");
  const [saldoKasbon, setSaldoKasbon] = useState(initialValues?.saldoKasbon ?? "0.00");

  // ===== DOKUMEN =====
  const [ktpNo, setKtpNo] = useState(initialValues?.ktpNo ?? "");
  const [kkNo, setKkNo] = useState(initialValues?.kkNo ?? "");
  const [ktpFile, setKtpFile] = useState<File | null>(initialValues?.ktpFile ?? null);
  const [kkFile, setKkFile] = useState<File | null>(initialValues?.kkFile ?? null);
  const [bpjsKesehatanNo, setBpjsKesehatanNo] = useState(initialValues?.bpjsKesehatanNo ?? "");
  const [bpjsKetenagakerjaanNo, setBpjsKetenagakerjaanNo] = useState(initialValues?.bpjsKetenagakerjaanNo ?? "");
  const [npwpNo, setNpwpNo] = useState(initialValues?.npwpNo ?? "");
  const [simNo, setSimNo] = useState(initialValues?.simNo ?? "");
  const [noPkwt, setNoPkwt] = useState(initialValues?.noPkwt ?? "");
  const [noKontrak, setNoKontrak] = useState(initialValues?.noKontrak ?? "");
  const [tanggalMulaiPkwt, setTanggalMulaiPkwt] = useState<string | null>(initialValues?.tanggalMulaiPkwt ?? null);
  const [tanggalBerakhirPkwt, setTanggalBerakhirPkwt] = useState<string | null>(initialValues?.tanggalBerakhirPkwt ?? null);
  const [masaBerlaku, setMasaBerlaku] = useState<string | null>(initialValues?.masaBerlaku ?? null);
  const [rekeningNo, setRekeningNo] = useState(initialValues?.rekeningNo ?? "");
  const [namaRekening, setNamaRekening] = useState(initialValues?.namaRekening ?? "");

  // ===== OPTIONS DUMMY =====
  const lokasiOptions = [
    { value: "1", label: "Jakarta" },
    { value: "2", label: "Bandung" },
  ];
  const divisiOptions = [
    { value: "1", label: "IT" },
    { value: "2", label: "HR" },
  ];
  const roleOptions = [
    { value: "1", label: "Admin" },
    { value: "2", label: "Pegawai" },
  ];

  // ===== FUNCTIONS =====
  const handleFotoChange = (payload: any) => {
    const f = payload?.target?.files?.[0] ?? null;
    if (!f) return;
    const previewUrl = URL.createObjectURL(f);
    setFotoPreview(previewUrl);
    setFotoFile(f);
  };

  const extractFile = (payload: any): File | null => {
    if (!payload) return null;
    if (payload instanceof File) return payload;
    if (payload?.target?.files) return payload.target.files[0] ?? null;
    if (payload?.file instanceof File) return payload.file;
    return null;
  };

  const handleSubmit = async () => {
    if (!onSubmit) {
      Swal.fire("Info", "UI demo, belum tersambung backend", "info");
      return;
    }

    await onSubmit({
      name,
      fotoFile,
      email,
      telepon,
      username,
      statuspajak,
      lokasiId,
      divisiId,
      roleId,
      dashboardType,
      tglLahir,
      tglJoin,
      statusNikah,
      gender,
      alamat,
      tunjanganBpjsKesehatan,
      tunjanganBpjsKetenagakerjaan,
      potBpjsKesehatan,
      potBpjsKetenagakerjaan,
      tunjanganPajak,
      gajiPokok,
      makanTransport,
      lembur,
      kehadiran100,
      thr,
      bonusPribadi,
      bonusTeam,
      bonusJackpot,
      cuti,
      izinMasuk,
      izinTelat,
      izinPulangCepat,
      izin,
      terlambat,
      mangkir,
      saldoKasbon,
      ktpNo,
      kkNo,
      ktpFile,
      kkFile,
      bpjsKesehatanNo,
      bpjsKetenagakerjaanNo,
      npwpNo,
      simNo,
      noPkwt,
      noKontrak,
      tanggalMulaiPkwt,
      tanggalBerakhirPkwt,
      masaBerlaku,
      rekeningNo,
      namaRekening,
    });
  };

  return (
    <>
      <PageMeta title={formTitle} description={formTitle} />
      <PageHeader
        pageTitle={formTitle}
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <button
            onClick={() => navigate("/pegawai")}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-5 py-2 rounded-xl"
          >
            ⬅ Back
          </button>
        }
      />

      <div className="space-y-6 mt-4">
       {/* ===== Data Pribadi ===== */}
        <ComponentCard title="Data Pribadi">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label>Nama Pegawai *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Foto Pegawai</Label>
              <FileInput onChange={handleFotoChange} />
              {fotoPreview && <img src={fotoPreview} className="w-24 h-24 object-cover mt-2 border rounded-lg" />}
            </div>
            <div>
              <Label>Email *</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Telepon *</Label>
              <Input value={telepon} onChange={(e) => setTelepon(e.target.value)} />
            </div>
            <div>
              <Label>Username *</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
              <Label>Status Pajak</Label>
              <Input type="" value={statuspajak} onChange={(e) => setPassword(e.target.value)} placeholder="Kosongkan jika tidak diubah" />
            </div>
            <div>
              <Label>Lokasi Kantor</Label>
              <Select options={lokasiOptions} onChange={setLokasiId} defaultValue={lokasiId ?? undefined} />
            </div>
            <div>
              <Label>Divisi</Label>
              <Select options={divisiOptions} onChange={setDivisiId} defaultValue={divisiId ?? undefined} />
            </div>
            <div>
              <Label>Role</Label>
              <Select options={roleOptions} onChange={setRoleId} defaultValue={roleId ?? undefined} />
            </div>
            <div>
              <Label>Dashboard</Label>
              <Select
                options={[
                  { value: "superadmin", label: "Superadmin" },
                  { value: "admin", label: "Admin" },
                  { value: "pegawai", label: "Pegawai" },
                ]}
                onChange={setDashboardType}
                defaultValue={dashboardType}
              />
            </div>
            <div>
              <Label>Gender</Label>
              <Select
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ]}
                onChange={setGender}
                defaultValue={gender}
              />
            </div>
            <div>
              <Label>Status Pernikahan</Label>
              <Select
                options={[
                  { value: "single", label: "Single" },
                  { value: "married", label: "Married" },
                ]}
                onChange={setStatusNikah}
                defaultValue={statusNikah}
              />
            </div>
            <div>
              <Label>Tanggal Lahir</Label>
              <DatePicker
                id="tgl_lahir"
                selected={tglLahir ? new Date(tglLahir) : undefined}
                onChange={(value: string) => setTglLahir(value)}
              />
            </div>
            <div>
              <Label>Tanggal Join</Label>
              <DatePicker
                id="tgl_join"
                selected={tglJoin ? new Date(tglJoin) : undefined}
                onChange={(value: string) => setTglJoin(value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Alamat</Label>
              <TextArea rows={3} value={alamat} onChange={setAlamat} />
            </div>
          </div>
        </ComponentCard>

        {/* ================== DOKUMEN & KONTRAK ================== */}
        <ComponentCard title="Dokumen & Kontrak">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label>Nomor KTP</Label>
              <Input value={ktpNo} onChange={(e) => setKtpNo(e.target.value)} placeholder="Nomor KTP" />
            </div>
            <div>
              <Label>Upload KTP</Label>
              <FileInput onChange={(payload: any) => setKtpFile(extractFile(payload))} />
            </div>
            <div>
              <Label>Nomor KK</Label>
              <Input value={kkNo} onChange={(e) => setKkNo(e.target.value)} placeholder="Nomor KK" />
            </div>
            <div>
              <Label>Upload KK</Label>
              <FileInput onChange={(payload: any) => setKkFile(extractFile(payload))} />
            </div>
            <div>
              <Label>BPJS Kesehatan</Label>
              <Input value={bpjsKesehatanNo} onChange={(e) => setBpjsKesehatanNo(e.target.value)} />
            </div>
            <div>
              <Label>BPJS Ketenagakerjaan</Label>
              <Input value={bpjsKetenagakerjaanNo} onChange={(e) => setBpjsKetenagakerjaanNo(e.target.value)} />
            </div>
            <div>
              <Label>NPWP</Label>
              <Input value={npwpNo} onChange={(e) => setNpwpNo(e.target.value)} />
            </div>
            <div>
              <Label>SIM</Label>
              <Input value={simNo} onChange={(e) => setSimNo(e.target.value)} />
            </div>
            <div>
              <Label>Nomor PKWT</Label>
              <Input value={noPkwt} onChange={(e) => setNoPkwt(e.target.value)} />
            </div>
            <div>
              <Label>Nomor Kontrak</Label>
              <Input value={noKontrak} onChange={(e) => setNoKontrak(e.target.value)} />
            </div>
            <div>
              <Label>Tanggal Mulai PKWT</Label>
              <DatePicker
                id="tanggal_mulai_pkwt"
                selected={tanggalMulaiPkwt ? new Date(tanggalMulaiPkwt) : undefined}
                onChange={(value: string) => setTanggalMulaiPkwt(value)}
              />

            </div>
            <div>
              <Label>Tanggal Berakhir PKWT</Label>
              <DatePicker 
                id="tanggal_berakhir_pkwt" 
                placeholder="Pilih tanggal" 
                onChange={(value: string) => setTanggalBerakhirPkwt(value)} 
              />
            </div>
            <div>
              <Label>Nomor Rekening</Label>
              <Input value={rekeningNo} onChange={(e) => setRekeningNo(e.target.value)} />
            </div>
            <div>
              <Label>Nama Rekening</Label>
              <Input value={namaRekening} onChange={(e) => setNamaRekening(e.target.value)} />
            </div>
            <div>
              <Label>Masa Berlaku</Label>
              <DatePicker 
                id="masa_berlaku" 
                placeholder="Pilih tanggal" 
                onChange={(value: string) => setMasaBerlaku(value)} 
              />
            </div>
          </div>
        </ComponentCard>

        {/* ================== CUTI & IZIN ================== */}
        <ComponentCard title="Komponen Cuti & Izin">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <Label>Cuti</Label>
              <Input type="number" value={String(cuti)} onChange={(e) => setCuti(Number(e.target.value))} />
            </div>
            <div>
              <Label>Izin Masuk</Label>
              <Input type="number" value={String(izinMasuk)} onChange={(e) => setIzinMasuk(Number(e.target.value))} />
            </div>
            <div>
              <Label>Izin Telat</Label>
              <Input type="number" value={String(izinTelat)} onChange={(e) => setIzinTelat(Number(e.target.value))} />
            </div>
            <div>
              <Label>Izin Pulang Cepat</Label>
              <Input type="number" value={String(izinPulangCepat)} onChange={(e) => setIzinPulangCepat(Number(e.target.value))} />
            </div>
          </div>
        </ComponentCard>

        {/* ================== PENJUMLAHAN GAJI ================== */}
        <ComponentCard title="Komponen Penjumlahan Gaji">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label>Gaji Pokok</Label>
              <Input value={gajiPokok} onChange={(e) => setGajiPokok(e.target.value)} />
            </div>
            <div>
              <Label>Makan & Transport</Label>
              <Input value={makanTransport} onChange={(e) => setMakanTransport(e.target.value)} />
            </div>
            <div>
              <Label>Lembur</Label>
              <Input value={lembur} onChange={(e) => setLembur(e.target.value)} />
            </div>
            <div>
              <Label>100% Kehadiran</Label>
              <Input value={kehadiran100} onChange={(e) => setKehadiran100(e.target.value)} />
            </div>
            <div>
              <Label>THR</Label>
              <Input value={thr} onChange={(e) => setThr(e.target.value)} />
            </div>
            <div>
              <Label>Bonus Pribadi</Label>
              <Input value={bonusPribadi} onChange={(e) => setBonusPribadi(e.target.value)} />
            </div>
            <div>
              <Label>Bonus Team</Label>
              <Input value={bonusTeam} onChange={(e) => setBonusTeam(e.target.value)} />
            </div>
            <div>
              <Label>Bonus Jackpot</Label>
              <Input value={bonusJackpot} onChange={(e) => setBonusJackpot(e.target.value)} />
            </div>
          </div>
        </ComponentCard>

        {/* ================== PENGURANGAN GAJI ================== */}
        <ComponentCard title="Komponen Pengurangan Gaji">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <Label>Izin (Rp)</Label>
              <Input value={izin} onChange={(e) => setIzin(e.target.value)} />
            </div>
            <div>
              <Label>Terlambat (Rp)</Label>
              <Input value={terlambat} onChange={(e) => setTerlambat(e.target.value)} />
            </div>
            <div>
              <Label>Mangkir (Rp)</Label>
              <Input value={mangkir} onChange={(e) => setMangkir(e.target.value)} />
            </div>
            <div>
              <Label>Saldo Kasbon (Rp)</Label>
              <Input value={saldoKasbon} onChange={(e) => setSaldoKasbon(e.target.value)} />
            </div>
          </div>
        </ComponentCard>

        {/* ================== TUNJANGAN & POTONGAN ================== */}
        <ComponentCard title="Tunjangan & Potongan Pajak / BPJS">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label>Tunjangan BPJS Kesehatan</Label>
              <Input value={tunjanganBpjsKesehatan} onChange={(e) => setTunjanganBpjsKesehatan(e.target.value)} />
            </div>
            <div>
              <Label>Tunjangan BPJS Ketenagakerjaan</Label>
              <Input value={tunjanganBpjsKetenagakerjaan} onChange={(e) => setTunjanganBpjsKetenagakerjaan(e.target.value)} />
            </div>
            <div>
              <Label>Potongan BPJS Kesehatan</Label>
              <Input value={potBpjsKesehatan} onChange={(e) => setPotBpjsKesehatan(e.target.value)} />
            </div>
            <div>
              <Label>Potongan BPJS Ketenagakerjaan</Label>
              <Input value={potBpjsKetenagakerjaan} onChange={(e) => setPotBpjsKetenagakerjaan(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Tunjangan Pajak (Gross Up)</Label>
              <Input value={tunjanganPajak} onChange={(e) => setTunjanganPajak(e.target.value)} />
            </div>
          </div>
        </ComponentCard>

        {/* ===== Submit ===== */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700"
          >
            Simpan Pegawai
          </button>
        </div>
      </div>
    </>
  );
}
