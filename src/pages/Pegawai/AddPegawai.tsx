import { useEffect, useState } from "react";
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
import api from "../../api/axios";
import Swal from "sweetalert2";


type LookupOption = { id: number; name: string };

export default function AddPegawai() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // basic info
  const [name, setName] = useState("");
  const [fotoKaryawan, setFotoKaryawan] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [telepon, setTelepon] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);


  // lookup selects
  const [lokasiId, setLokasiId] = useState<number | null>(null);
  const [divisiId, setDivisiId] = useState<number | null>(null);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [dashboardType, setDashboardType] = useState<string>("pegawai");

  // dates & personal
  const [tglLahir, setTglLahir] = useState<string | null>(null);
  const [tglJoin, setTglJoin] = useState<string | null>(null);
  const [statusNikah, setStatusNikah] = useState<string>("single");
  const [gender, setGender] = useState<string>("male");
  const [alamat, setAlamat] = useState("");

  // documents (numbers + files)
  const [ktpNo, setKtpNo] = useState("");
  const [kkNo, setKkNo] = useState("");
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [kkFile, setKkFile] = useState<File | null>(null);
  const [bpjsKesehatanNo, setBpjsKesehatanNo] = useState("");
  const [bpjsKetenagakerjaanNo, setBpjsKetenagakerjaanNo] = useState("");
  const [npwpNo, setNpwpNo] = useState("");
  const [simNo, setSimNo] = useState("");
  const [noPkwt, setNoPkwt] = useState("");
  const [noKontrak, setNoKontrak] = useState("");
  const [tanggalMulaiPkwt, setTanggalMulaiPkwt] = useState<string | null>(null);
  const [tanggalBerakhirPkwt, setTanggalBerakhirPkwt] = useState<string | null>(null);
  const [masaBerlaku, setMasaBerlaku] = useState<string | null>(null);
  const [rekeningNo, setRekeningNo] = useState("");
  const [namaRekening, setNamaRekening] = useState("");

  // cuti & izin
  const [cuti, setCuti] = useState<number>(0);
  const [izinMasuk, setIzinMasuk] = useState<number>(0);
  const [izinTelat, setIzinTelat] = useState<number>(0);
  const [izinPulangCepat, setIzinPulangCepat] = useState<number>(0);

  // gaji (penjumlahan)
  const [gajiPokok, setGajiPokok] = useState<string>("0.00");
  const [makanTransport, setMakanTransport] = useState<string>("0.00");
  const [lembur, setLembur] = useState<string>("0.00");
  const [kehadiran100, setKehadiran100] = useState<string>("0.00");
  const [thr, setThr] = useState<string>("0.00");
  const [bonusPribadi, setBonusPribadi] = useState<string>("0.00");
  const [bonusTeam, setBonusTeam] = useState<string>("0.00");
  const [bonusJackpot, setBonusJackpot] = useState<string>("0.00");

  // pengurangan gaji
  const [izin, setIzin] = useState<string>("0.00");
  const [terlambat, setTerlambat] = useState<string>("0.00");
  const [mangkir, setMangkir] = useState<string>("0.00");
  const [saldoKasbon, setSaldoKasbon] = useState<string>("0.00");

  // tunjangan & potongan
  const [tunjanganBpjsKesehatan, setTunjanganBpjsKesehatan] = useState<string>("0.00");
  const [tunjanganBpjsKetenagakerjaan, setTunjanganBpjsKetenagakerjaan] = useState<string>("0.00");
  const [potBpjsKesehatan, setPotBpjsKesehatan] = useState<string>("0.00");
  const [potBpjsKetenagakerjaan, setPotBpjsKetenagakerjaan] = useState<string>("0.00");
  const [tunjanganPajak, setTunjanganPajak] = useState<string>("0.00");

  // lookup lists
  const [lokasiOptions, setLokasiOptions] = useState<LookupOption[]>([]);
  const [divisiOptions, setDivisiOptions] = useState<LookupOption[]>([]);
  const [roleOptions, setRoleOptions] = useState<LookupOption[]>([]);

  // validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // fetch lookup lists but safe (catch errors)
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const fetchLookups = async () => {
      try {
        const [lokRes, divRes, roleRes] = await Promise.all([
          api.get("/lokasis", { headers }).catch(() => ({ data: [] })),
          api.get("/divisis", { headers }).catch(() => ({ data: [] })),
          api.get("/roles", { headers }).catch(() => ({ data: [] })),
        ]);
        // adapt to either {data: {data: []}} or raw array
        setLokasiOptions(lokRes.data?.data ?? lokRes.data ?? []);
        setDivisiOptions(divRes.data?.data ?? divRes.data ?? []);
        setRoleOptions(roleRes.data?.data ?? roleRes.data ?? []);
      } catch (e) {
        console.error("Lookup fetch error", e);
      }
    };
    fetchLookups();
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Nama wajib diisi";
    if (!username.trim()) e.username = "Username wajib diisi";
    if (!password.trim()) e.password = "Password wajib diisi";
    if (!email.trim()) e.email = "Email wajib diisi";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Format email tidak valid";
    if (!telepon.trim()) e.telepon = "Nomor telepon wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // helper: ekstrak File dari File | ChangeEvent<HTMLInputElement> | null
  const extractFile = (payload: any): File | null => {
    if (!payload) return null;
    // if component passes File directly
    if (payload instanceof File) return payload;
    // if component passes event
    if (payload?.target?.files) return payload.target.files[0] ?? null;
    // some custom FileInput might pass { file: File }
    if (payload?.file instanceof File) return payload.file;
    return null;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) {
      Swal.fire("Periksa input", "Silakan lengkapi field yang wajib.", "warning");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const fd = new FormData();
      // basic
      fd.append("name", name);
      if (fotoKaryawan) fd.append("foto_karyawan", fotoKaryawan);
      fd.append("email", email);
      fd.append("telepon", telepon);
      fd.append("username", username);
      fd.append("password", password);
      if (lokasiId) fd.append("lokasi_id", String(lokasiId));
      if (divisiId) fd.append("divisi_id", String(divisiId));
      if (roleId) fd.append("role_id", String(roleId));
      fd.append("dashboard_type", dashboardType);
      if (tglLahir) fd.append("tgl_lahir", tglLahir);
      if (tglJoin) fd.append("tgl_join", tglJoin);
      fd.append("gender", gender);
      fd.append("status_nikah", statusNikah);
      if (alamat) fd.append("alamat", alamat);

      // documents
      if (ktpNo) fd.append("ktp_no", ktpNo);
      if (kkNo) fd.append("kk_no", kkNo);
      if (ktpFile) fd.append("ktp", ktpFile);
      if (kkFile) fd.append("kartu_keluarga", kkFile);
      if (bpjsKesehatanNo) fd.append("bpjs_kesehatan", bpjsKesehatanNo);
      if (bpjsKetenagakerjaanNo) fd.append("bpjs_ketenagakerjaan", bpjsKetenagakerjaanNo);
      if (npwpNo) fd.append("npwp", npwpNo);
      if (simNo) fd.append("sim", simNo);
      if (noPkwt) fd.append("no_pkwt", noPkwt);
      if (noKontrak) fd.append("no_kontrak", noKontrak);
      if (tanggalMulaiPkwt) fd.append("tanggal_mulai_pkwt", tanggalMulaiPkwt);
      if (tanggalBerakhirPkwt) fd.append("tanggal_berakhir_pkwt", tanggalBerakhirPkwt);
      if (masaBerlaku) fd.append("masa_berlaku", masaBerlaku);
      if (rekeningNo) fd.append("rekening", rekeningNo);
      if (namaRekening) fd.append("nama_rekening", namaRekening);

      // cuti & izin
      fd.append("izin_cuti", String(cuti));
      fd.append("izin_masuk", String(izinMasuk));
      fd.append("izin_telat", String(izinTelat));
      fd.append("izin_pulang_cepat", String(izinPulangCepat));

      // gaji penjumlahan
      fd.append("gaji_pokok", gajiPokok);
      fd.append("makan_transport", makanTransport);
      fd.append("lembur", lembur);
      fd.append("kehadiran", kehadiran100);
      fd.append("thr", thr);
      fd.append("bonus_pribadi", bonusPribadi);
      fd.append("bonus_team", bonusTeam);
      fd.append("bonus_jackpot", bonusJackpot);

      // pengurangan gaji
      fd.append("izin", izin);
      fd.append("terlambat", terlambat);
      fd.append("mangkir", mangkir);
      fd.append("saldo_kasbon", saldoKasbon);

      // tunjangan & potongan
      fd.append("tunjangan_bpjs_kesehatan", tunjanganBpjsKesehatan);
      fd.append("tunjangan_bpjs_ketenagakerjaan", tunjanganBpjsKetenagakerjaan);
      fd.append("pot_bpjs_kesehatan", potBpjsKesehatan);
      fd.append("pot_bpjs_ketenagakerjaan", potBpjsKetenagakerjaan);
      fd.append("tunjangan_pajak", tunjanganPajak);

      // submit
      await api.post("/pegawais", fd, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      });

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Pegawai berhasil ditambahkan",
        confirmButtonColor: "#3085d6",
      });

      navigate("/pegawai");
    } catch (err: any) {
      console.error("Submit pegawai error:", err);
      const msg = err?.response?.data?.message ?? "Terjadi kesalahan saat menyimpan data.";
      Swal.fire({ icon: "error", title: "Gagal", text: String(msg), confirmButtonColor: "#d33" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Add-Pegawai" description="Add Pegawai" />
      <PageHeader
        pageTitle="Tambah Pegawai"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <button onClick={() => navigate("/pegawai")} className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-5 py-2 rounded-xl">
            ⬅ Back
          </button>
        }
      />

      <div className="space-y-6 mt-4">
        {/* DATA PRIBADI */}
        <ComponentCard title="Data Pribadi">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label>Nama pegawai *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label>Foto pegawai</Label>
              {/* FileInput bisa memberikan event atau File; kita ekstrak dengan extractFile */}
              <FileInput
                onChange={(payload: any) => {
                  const f = extractFile(payload);

                  if (!f) return;

                  // Validasi tipe file
                const allowedTypes = ["image/jpeg", "image/png"];
                if (!allowedTypes.includes(f.type)) {
                    Swal.fire({
                    icon: "error",
                    title: "Format tidak didukung",
                    text: "File harus JPG atau PNG!",
                    });
                    return;
                }

                //  Validasi ukuran max 3MB
                const maxSize = 2 * 1024 * 1024;
                if (f.size > maxSize) {
                    Swal.fire({
                    icon: "error",
                    title: "File terlalu besar",
                    text: "Ukuran file maksimal 3MB!",
                    });
                    return;
                }

                  setFotoKaryawan(f);

                  // Preview
                  const previewUrl = URL.createObjectURL(f);
                  setFotoPreview(previewUrl);
                }}
              />

              {fotoPreview && (
                <img
                 src={fotoPreview}
                 alt="Preview Foto"
                 className="w-24 h-24 object-cover rounded-lg mt-2 border"
            />
              )}

              <p className="text-sm text-gray-500 mt-1">JPEG/PNG, max 3MB</p>
            </div>

            <div>
              <Label>Email *</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@domain.com" />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label>Nomor Handphone *</Label>
              <Input value={telepon} onChange={(e) => setTelepon(e.target.value)} placeholder="08xxxxxxxxxx" />
              {errors.telepon && <p className="text-sm text-red-500 mt-1">{errors.telepon}</p>}
            </div>

            <div>
              <Label>Username *</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
              {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
            </div>

            <div>
              <Label>Password *</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
            </div>

            <div>
              <Label>Lokasi Kantor</Label>
              <Select
                options={lokasiOptions.map((l) => ({ value: String(l.id), label: l.name }))}
                placeholder="Pilih lokasi"
                onChange={(val: string) => setLokasiId(val ? Number(val) : null)}
              />
            </div>

            <div>
              <Label>Tanggal Lahir</Label>
              <DatePicker id="tgl_lahir" placeholder="Pilih tanggal" onChange={(_: Date[], d: string) => setTglLahir(d)} />
            </div>

            <div>
              <Label>Tanggal Masuk Perusahaan</Label>
              <DatePicker id="tgl_join" placeholder="Pilih tanggal" onChange={(_: Date[], d: string) => setTglJoin(d)} />
            </div>

            <div>
              <Label>Role</Label>
              <Select
                options={roleOptions.map((r) => ({ value: String(r.id), label: r.name }))}
                placeholder="Pilih role"
                onChange={(val: string) => setRoleId(val ? Number(val) : null)}
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
                placeholder="Pilih gender"
                onChange={(val: string) => setGender(val)}
              />
            </div>

            <div>
              <Label>Dashboard</Label>
              <Select
                options={[
                  { value: "superadmin", label: "Superadmin" },
                  { value: "admin", label: "Admin" },
                  { value: "pegawai", label: "Pegawai" },
                ]}
                placeholder="Pilih dashboard"
                onChange={(val: string) => setDashboardType(val)}
                defaultValue={dashboardType}
              />
            </div>

            <div>
              <Label>Status Pernikahan</Label>
              <Select
                options={[
                  { value: "single", label: "Single" },
                  { value: "married", label: "Married" },
                ]}
                placeholder="Pilih status"
                onChange={(val: string) => setStatusNikah(val)}
              />
            </div>

            <div className="md:col-span-2">
              <Label>Alamat</Label>
              <TextArea rows={3} value={alamat} onChange={(v) => setAlamat(v)} />
            </div>
          </div>
        </ComponentCard>

        {/* DOKUMEN */}
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
              <Label>Nomor Kartu Keluarga</Label>
              <Input value={kkNo} onChange={(e) => setKkNo(e.target.value)} placeholder="Nomor KK" />
            </div>
            <div>
              <Label>Upload Kartu Keluarga</Label>
              <FileInput onChange={(payload: any) => setKkFile(extractFile(payload))} />
            </div>

            <div>
              <Label>Nomor BPJS Kesehatan</Label>
              <Input value={bpjsKesehatanNo} onChange={(e) => setBpjsKesehatanNo(e.target.value)} />
            </div>
            <div>
              <Label>Nomor BPJS Ketenagakerjaan</Label>
              <Input value={bpjsKetenagakerjaanNo} onChange={(e) => setBpjsKetenagakerjaanNo(e.target.value)} />
            </div>

            <div>
              <Label>Nomor NPWP</Label>
              <Input value={npwpNo} onChange={(e) => setNpwpNo(e.target.value)} />
            </div>
            <div>
              <Label>Nomor SIM</Label>
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
              <DatePicker id="tanggal_mulai_pkwt" placeholder="Pilih tanggal" onChange={(_: Date[], d: string) => setTanggalMulaiPkwt(d)} />
            </div>
            <div>
              <Label>Tanggal Berakhir PKWT</Label>
              <DatePicker id="tanggal_berakhir_pkwt" placeholder="Pilih tanggal" onChange={(_: Date[], d: string) => setTanggalBerakhirPkwt(d)} />
            </div>

            <div>
              <Label>Nomor Rekening</Label>
              <Input value={rekeningNo} onChange={(e) => setRekeningNo(e.target.value)} />
            </div>
            <div>
              <Label>Nama Pemilik Rekening</Label>
              <Input value={namaRekening} onChange={(e) => setNamaRekening(e.target.value)} />
            </div>

            <div>
              <Label>Masa Berlaku</Label>
              <DatePicker id="masa_berlaku" placeholder="Pilih tanggal" onChange={(_: Date[], d: string) => setMasaBerlaku(d)} />
            </div>
          </div>
        </ComponentCard>

        {/* CUTI & IZIN */}
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

        {/* PENJUMLAHAN GAJI */}
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

        {/* PENGURANGAN GAJI */}
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

        {/* TUNJANGAN & POTONGAN */}
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

        {/* SUBMIT */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-2 rounded-xl text-white ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "Menyimpan..." : "Simpan Pegawai"}
          </button>
        </div>
      </div>
    </>
  );
}
