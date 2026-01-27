import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Calendar, PlusCircle, MinusCircle } from "lucide-react";
import api from "../../../api/axios";
import BottomNav from "../../../components/common/BottomNav";
import axios from "axios";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type TabType = "info" | "cuti" | "plus" | "minus";

export default function MyProfilePegawai() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("info");

  const [pegawai, setPegawai] = useState<any>(null);
  const [cuti, setCuti] = useState<any[]>([]);
  const [gajiPlus, setGajiPlus] = useState<any[]>([]);
  const [gajiMinus, setGajiMinus] = useState<any[]>([]);

  const [tanggalLahir, setTanggalLahir] = useState<Date | null>(null);
  const [initialTanggalLahir, setInitialTanggalLahir] = useState<Date | null>(null);

  const [alamat, setAlamat] = useState("");
  const [initialAlamat, setInitialAlamat] = useState("");

  const [namaRekening, setNamaRekening] = useState("");
  const [initialNamaRekening, setInitialNamaRekening] = useState("");

  const [gender, setGender] = useState("");
  const [initialGender, setInitialGender] = useState("");

  const [statusNikah, setStatusNikah] = useState("");
  const [initialStatusNikah, setInitialStatusNikah] = useState("");

  const [noKtp, setNoKtp] = useState("");
  const [initialNoKtp, setInitialNoKtp] = useState("");

  const [noKk, setNoKk] = useState("");
  const [initialNoKk, setInitialNoKk] = useState("");

  const [nobpjs, setNobpjs] = useState("");
  const [initialNobpjs, setInitialNobpjs] = useState("");

  const [nobpjsketenaga, setNobpjsketenaga] = useState("");
  const [initialNobpjsketenaga, setInitialNobpjsketenaga] = useState("");

  const [nonpwp, setNonpwp] = useState("");
  const [initialNonpwp, setInitialNonpwp] = useState("");

  const [nosim, setNosim] = useState("");
  const [initialNosim, setInitialNosim] = useState("");

  const [nopkwt, setNopkwt] = useState("");
  const [initialNopkwt, setInitialNopkwt] = useState("");

  const [nokontrak, setNokontrak] = useState("");
  const [initialNokontrak, setInitialNokontrak] = useState("");

  const [norekening, setNorekening] = useState("");
  const [initialNorekening, setInitialNorekening] = useState("");

  const [telepon, setTelepon] = useState("");
  const [loading, setLoading] = useState(true);
  const [initialTelepon, setInitialTelepon] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [cutiSummary, setCutiSummary] = useState<any>(null);

  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const formatTanggalID = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatRupiah = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) return "-";

    const number = typeof value === "string"
      ? Number(value)
      : value;

    if (isNaN(number)) return "-";

    return (
      number.toLocaleString("id-ID", {
        minimumFractionDigits: 0,
      }) + " / bulan"
    );
  };



  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFotoFile(file);
    setPreviewFoto(URL.createObjectURL(file));
  };

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile");
      const data = res.data.data;

      setPegawai(data);
      setTelepon(data.telepon || "");
      setAlamat(data.alamat || "");
      setInitialAlamat(data.alamat || "");
      setGender(data.gender || "");
      setInitialGender(data.gender || "");
      setStatusNikah(data.status_nikah || "");
      setInitialStatusNikah(data.status_nikah || "");
      setNoKtp(data.ktp || "");
      setInitialNoKtp(data.ktp || "");
      setNoKk(data.kartu_keluarga || "");
      setInitialNoKk(data.kartu_keluarga || "");
      setNobpjs(data.bpjs_kesehatan || "");
      setInitialNobpjs(data.bpjs_kesehatan || "");
      setNobpjsketenaga(data.bpjs_ketenagakerjaan || "");
      setInitialNobpjsketenaga(data.bpjs_ketenagakerjaan || "");
      setNonpwp(data.npwp || "");
      setInitialNonpwp(data.npwp || "");
      setNosim(data.sim || "");
      setInitialNosim(data.sim || "");
      setNopkwt(data.no_pkwt || "");
      setInitialNopkwt(data.no_pkwt || "");
      setNokontrak(data.no_kontrak || "");
      setInitialNokontrak(data.no_kontrak || "");
      setNorekening(data.rekening || "");
      setInitialNorekening(data.no_rekening || "");
      setNamaRekening(data.nama_rekening || "");
      setInitialNamaRekening(data.nama_rekening || "");

      const tgl = data.tgl_lahir
        ? new Date(data.tgl_lahir)
        : null;

      setTanggalLahir(tgl);
      setInitialTanggalLahir(tgl);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const InfoField = ({
    label,
    value,
    type = "text",
  }: {
    label: string;
    value?: string;
    type?: string;
  }) => (
    <div className="space-y-1">
      <label className="text-sm text-gray-500">{label}</label>
      <input
        type={type}
        value={value || "-"}
        disabled
        className="
          w-full rounded-xl border border-gray-200
          bg-gray-50 px-4 py-3
          text-gray-800 text-sm
          cursor-not-allowed
        "
      />
    </div>
  );

  const uploadApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      Accept: "application/json",
    },
  });

  const fetchCutiSummary = async () => {
    const res = await api.get(`/cuti/summary/${user.id}`);
    setCutiSummary(res.data.data);
  };

  useEffect(() => {
    fetchCutiSummary();
  }, []);


  const handleSaveAll = async () => {
    try {
      setSaving(true);

      const payload: {
        telepon?: string;
        tgl_lahir?: string;
        alamat?: string;
        gender?: string;
        status_nikah?: string;
        ktp?: string;
        kartu_keluarga?: string;
        bpjs_kesehatan?: string;
        bpjs_ketenagakerjaan?: string;
        npwp?: string;
        sim?: string
        no_pkwt?: string
        no_kontrak?: string
        rekening?: string
        nama_rekening?: string;
      } = {};

      // 📞 Telepon
      if (telepon !== initialTelepon) {
        payload.telepon = telepon;
      }

      // Tanggal lahir
      if (
        tanggalLahir &&
        (!initialTanggalLahir ||
          tanggalLahir.getTime() !== initialTanggalLahir.getTime())
      ) {
        payload.tgl_lahir = formatDate(tanggalLahir);
      }

      // Alamat
      if (alamat !== initialAlamat) {
        payload.alamat = alamat;
      }

      // Alamat
      if (namaRekening !== initialNamaRekening) {
        payload.nama_rekening = namaRekening;
      }

      // Gender
      if (gender !== initialGender) {
        payload.gender = gender;
      }

      // Status nikah
      if (statusNikah !== initialStatusNikah) {
        payload.status_nikah = statusNikah;
      }

      // KTP
      if (noKtp !== initialNoKtp) {
        payload.ktp = noKtp;
      }

      // Kartu Keluarga
      if (noKk !== initialNoKk) {
        payload.kartu_keluarga = noKk;
      }

      // BPJS Kesehatan
      if (nobpjs !== initialNobpjs) {
        payload.bpjs_kesehatan = nobpjs;
      }

      // BPJS ketenagakerjaan
      if (nobpjsketenaga !== initialNobpjsketenaga) {
        payload.bpjs_ketenagakerjaan = nobpjsketenaga;
      }

      // BPJS ketenagakerjaan
      if (nonpwp !== initialNonpwp) {
        payload.npwp = nonpwp;
      }

      // SIM
      if (nosim !== initialNosim) {
        payload.sim = nosim;
      }

      // SIM
      if (nopkwt !== initialNopkwt) {
        payload.no_pkwt = nopkwt;
      }

      // Nomor Kontrak
      if (nokontrak !== initialNokontrak) {
        payload.no_kontrak = nokontrak;
      }

      // Nomor Kontrak
      if (norekening !== initialNorekening) {
        payload.rekening = norekening;
      }


      // Kirim payload
      if (Object.keys(payload).length > 0) {
        await api.post("/profile/update", payload);
      }

      // Upload foto
      if (fotoFile) {
        const formData = new FormData();
        formData.append("foto_karyawan", fotoFile);

        await api.post("/profile/update-foto", formData, {
          headers: { "Content-Type": undefined },
        });
      }

      await fetchProfile();

      Swal.fire({
        icon: "success",
        title: "Berhasil 🎉",
        text: "Perubahan berhasil disimpan",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal menyimpan perubahan",
      });
    } finally {
      setSaving(false);
    }
  };

  // USER INTERFACE
  return (
    <div className="sticky top-0 z-20 bg-gray-50">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 rounded-b-3xl shadow">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft />
          </button>
          <h1 className="text-lg font-semibold text-center flex-1">
            My Profile
          </h1>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white mt-3 mx-4 rounded-2xl shadow-sm">
        <div className="flex text-sm font-medium">
          {[
            { label: "Informasi", value: "info" },
            { label: "Cuti", value: "cuti" },
            { label: "+ Gaji", value: "plus" },
            { label: "- Gaji", value: "minus" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as TabType)}
              className={`flex-1 py-3 text-center relative transition
                ${activeTab === tab.value ? "text-indigo-600" : "text-gray-400"}`}
            >
              {tab.label}
              {activeTab === tab.value && (
                <span className="absolute bottom-0 left-6 right-6 h-[3px] bg-indigo-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 pt-4 pb-24 space-y-4 overflow-y-auto"
        style={{
          height: "calc(100vh - 200px)",
        }}
      >

        {loading ? (
          <div className="text-center text-gray-400 text-sm mt-10">
            Memuat data...
          </div>
        ) : (
          <>
            {/* TAB INFO */}
            {activeTab === "info" && (
              <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <img
                  src={
                    previewFoto
                      ? previewFoto
                      : pegawai?.foto_karyawan
                      ? `${BASE_URL}/storage/${pegawai.foto_karyawan}`
                      : undefined
                  }
                  className="w-14 h-14 rounded-xl object-cover bg-indigo-100"
                />

                {!previewFoto && !pegawai?.foto_karyawan && (
                  <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <User className="text-indigo-600" />
                  </div>
                )}

                  <div>
                    <p className="font-bold text-gray-900">
                      {pegawai?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {pegawai?.divisi?.nama || "-"}
                    </p>
                  </div>
                </div>
                <hr />

              <InfoField label="Nama Pegawai" value={pegawai?.name} />

              <div className="space-y-2 pt-2">
              <label className="text-sm text-gray-500">Foto Profile</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFotoChange}
                className="block w-full text-sm
                  file:mr-4 file:rounded-lg
                  file:border-0
                  file:bg-indigo-50
                  file:px-4 file:py-2
                  file:text-indigo-600
                  hover:file:bg-indigo-100
                "
              />
            </div>

            <InfoField label="Email" value={pegawai?.email} />

            <div className="space-y-1">
            <label className="text-sm text-gray-500">No Telepon</label>
            <input
              type="tel"
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="
                w-full rounded-xl border border-gray-200
                bg-white px-4 py-3
                text-gray-800 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
            />
          </div>

            <InfoField label="username" value={pegawai?.username} />
            <InfoField label="Lokasi Kantor" value={pegawai?.lokasi?.nama_lokasi} />

          <div className="space-y-1">
            <label className="text-sm text-gray-500">Tanggal Lahir</label>

            <DatePicker
              selected={tanggalLahir}
              onChange={(date) => setTanggalLahir(date)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Pilih tanggal lahir"
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              maxDate={new Date()} // tidak bisa pilih masa depan
              className="
                w-full rounded-xl border border-gray-200
                bg-white px-4 py-3
                text-gray-800 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-500">Alamat</label>
            <textarea
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              rows={3}
              placeholder="Masukkan alamat lengkap"
              className="
                w-full rounded-xl border border-gray-200
                bg-white px-4 py-3
                text-gray-800 text-sm
                resize-none
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
            />
          </div>

          <InfoField label="Tanggal Masuk Perusahaan" value={formatTanggalID(pegawai?.tgl_join)}/>
          <InfoField label="Masa Kerja" />

          <div className="space-y-1">
            <label className="text-sm text-gray-500">Jenis Kelamin</label>

            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="
                w-full rounded-xl border border-gray-200
                bg-white px-4 py-3
                text-gray-800 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
            >
              <option value="">Pilih jenis kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <InfoField label="Level User" value={pegawai?.dashboard_type} />

          <div className="space-y-1">
            <label className="text-sm text-gray-500">Status Nikah</label>
            <select
              value={statusNikah}
              onChange={(e) => setStatusNikah(e.target.value)}
              className="
                w-full rounded-xl border border-gray-200
                bg-white px-4 py-3
                text-gray-800 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
            >
              <option value="">Pilih Status Nikah</option>
              <option value="TK/0">TK/0</option>
              <option value="TK/1">TK/1</option>
              <option value="TK/2">TK/2</option>
              <option value="TK/3">TK/3</option>
              <option value="K0">K0</option>
              <option value="K1">K1</option>
              <option value="K2">K2</option>
              <option value="K3">K3</option>
            </select>
          </div>

            <InfoField label="Divisi" value={pegawai?.divisi?.nama} />
          
          <div className="space-y-1">
            <label className="text-sm text-gray-500">Nomor KTP</label>
            <input
              type="text"
              inputMode="numeric"
              value={noKtp}
              onChange={(e) => {
                // hanya angka, max 16 digit
                const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                setNoKtp(val);
              }}
              placeholder="16 digit No KTP"
              className="
                w-full rounded-xl border border-gray-200
                bg-white px-4 py-3
                text-gray-800 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
            />
            <p className="text-xs text-gray-400">
              {noKtp.length}/16 digit
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-500">Nomor Kartu Keluarga</label>
            <input
              type="text"
              inputMode="numeric"
              value={noKk}
              onChange={(e) => {
                // hanya angka, max 16 digit
                const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                setNoKk(val);
              }}
              placeholder="16 digit No Kartu Keluarga"
              className="
                w-full rounded-xl border border-gray-200
                bg-white px-4 py-3
                text-gray-800 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
            />
            <p className="text-xs text-gray-400">
              {noKk.length}/16 digit
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-500">Nomor BPJS Kesehatan</label>
            <input
              type="text"
              inputMode="numeric"
              value={nobpjs}
              onChange={(e) => {
                // hanya angka, max 16 digit
                const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                setNobpjs(val);
              }}
              placeholder="16 digit No Kartu Keluarga"
              className="
                w-full rounded-xl border border-gray-200
                bg-white px-4 py-3
                text-gray-800 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
            />
            <p className="text-xs text-gray-400">
              {nobpjs.length}/16 digit
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-500">Nomor BPJS Ketenagakerjaan</label>
            <input
              type="text"
              inputMode="numeric"
              value={nobpjsketenaga}
              onChange={(e) => {
                // hanya angka, max 16 digit
                const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                setNobpjsketenaga(val);
              }}
              placeholder="16 digit No Kartu Keluarga"
              className="
                w-full rounded-xl border border-gray-200
                bg-white px-4 py-3
                text-gray-800 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
            />
            <p className="text-xs text-gray-400">
              {nobpjsketenaga.length}/16 digit
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-500">Nomor NPWP</label>
            <input
              type="text"
              inputMode="numeric"
              value={nonpwp}
              onChange={(e) => {
                // hanya angka, max 16 digit
                const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                setNonpwp(val);
              }}
              placeholder="16 digit No Kartu Keluarga"
              className="
                w-full rounded-xl border border-gray-200
                bg-white px-4 py-3
                text-gray-800 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
            />
            <p className="text-xs text-gray-400">
              {nonpwp.length}/16 digit
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-500">Nomor SIM</label>
            <input
              type="text"
              inputMode="numeric"
              value={nosim}
              onChange={(e) => {
                // hanya angka, max 16 digit
                const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                setNosim(val);
              }}
              placeholder="16 digit No Kartu Keluarga"
              className="
                w-full rounded-xl border border-gray-200
                bg-white px-4 py-3
                text-gray-800 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
            />
            <p className="text-xs text-gray-400">
              {nosim.length}/16 digit
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-500">Nomor PKWT</label>
            <input
              type="text"
              inputMode="numeric"
              value={nopkwt}
              onChange={(e) => {
                // hanya angka, max 16 digit
                const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                setNopkwt(val);
              }}
              placeholder="16 digit No Kartu Keluarga"
              className="
                w-full rounded-xl border border-gray-200
                bg-white px-4 py-3
                text-gray-800 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
            />
            <p className="text-xs text-gray-400">
              {nopkwt.length}/16 digit
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-500">Nomor Kontrak</label>
            <input
              type="text"
              inputMode="numeric"
              value={nokontrak}
              onChange={(e) => {
                // hanya angka, max 16 digit
                const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                setNokontrak(val);
              }}
              placeholder="16 digit No Kartu Keluarga"
              className="
                w-full rounded-xl border border-gray-200
                bg-white px-4 py-3
                text-gray-800 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
            />
            <p className="text-xs text-gray-400">
              {nokontrak.length}/16 digit
            </p>
          </div>

          <InfoField label="Tanggal Mulai PKWT" value={pegawai?.tanggal_mulai_pwkt} />
          <InfoField label="Tanggal Berakhir PKWT" value={pegawai?.tanggal_berakhir_pwkt} />

          <div className="space-y-1">
            <label className="text-sm text-gray-500">Nomor Rekening</label>
            <input
              type="text"
              inputMode="numeric"
              value={norekening}
              onChange={(e) => {
                // hanya angka, max 16 digit
                const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                setNorekening(val);
              }}
              placeholder="16 digit No Kartu Keluarga"
              className="
                w-full rounded-xl border border-gray-200
                bg-white px-4 py-3
                text-gray-800 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
            />
            <p className="text-xs text-gray-400">
              {norekening.length}/16 digit
            </p>
          </div>

          <input
            type="text"
            value={namaRekening}
            onChange={(e) => setNamaRekening(e.target.value)}
            placeholder="Masukkan nama rekening"
            className="
              w-full rounded-xl border border-gray-200
              bg-white px-4 py-3
              text-gray-800 text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            "
          />



          <button
            onClick={handleSaveAll}
            disabled={
              saving ||
              (!fotoFile && telepon === initialTelepon && tanggalLahir === initialTanggalLahir && alamat === initialAlamat
                && gender === initialGender && statusNikah === initialStatusNikah && noKtp === initialNoKtp && nobpjs === initialNobpjs
                && nobpjsketenaga === initialNobpjsketenaga && nonpwp === initialNonpwp && nosim === initialNopkwt && nopkwt === initialNopkwt
                && nokontrak === initialNokontrak && norekening === initialNorekening
              )
            }
            className="
              w-full mt-4 rounded-xl py-3
              bg-indigo-600 text-white text-sm font-medium
              disabled:bg-gray-300
            "
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>

          </div>

          
            )}

            {/* TAB CUTI */}
            {activeTab === "cuti" && (
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
              <h2 className="font-semibold text-gray-800">
                Cuti & Izin
              </h2>

              <InfoField
                label="Cuti"
                value={String(cutiSummary?.cuti ?? 0)}
              />

              <InfoField
                label="Izin Masuk"
                value={String(cutiSummary?.izin_masuk ?? 0)}
              />

              <InfoField
                label="Izin Telat"
                value={String(cutiSummary?.izin_telat ?? 0)}
              />

              <InfoField
                label="Izin Pulang Cepat"
                value={String(cutiSummary?.izin_pulang_cepat ?? 0)}
              />

              <InfoField
                label="Sakit"
                value={String(cutiSummary?.sakit ?? 0)}
              />
            </div>
          )}


            {/* TAB + GAJI */}
            {activeTab === "plus" && (
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
              <h2 className="font-semibold text-gray-800">
                Penjumlahan Gaji
              </h2>

              <InfoField label="Gaji Pokok" value={formatRupiah(pegawai?.gaji_pokok)} />
              <InfoField label="Makan & Transport" value={formatRupiah(pegawai?.makan_transport)} />
              <InfoField label="Lembur" value={formatRupiah(pegawai?.lembur)} />
              <InfoField label="100% Kehadiran" value={formatRupiah(pegawai?.kehadiran)} />
              <InfoField label="THR" value={formatRupiah(pegawai?.thr)} />

            
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
              <h2 className="font-semibold text-gray-800">
                Bonus Bulan Berjalan
              </h2>
              <InfoField label="Bonus Pribadi" value={formatRupiah(pegawai?.bonus_pribadi)} />
              <InfoField label="Bonus Team" value={formatRupiah(pegawai?.bonus_team)} />
              <InfoField label="Bonus Jackpot" value={formatRupiah(pegawai?.bonus_jackpot)} />

            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
              <h2 className="font-semibold text-gray-800">
                Tunjangan BPJS & PAJAK
              </h2>
              <InfoField label="Tunjangan BPJS Kesehatan" value={formatRupiah(pegawai?.tunjangan_bpjs_kesehatan)}/>
              <InfoField label="Tunjangan BPJS Ketenagakerjaan" value={formatRupiah(pegawai?.tunjangan_bpjs_ketenagakerjaan)} />
              <InfoField label="Tunjangan Pajak" value={formatRupiah(pegawai?.tunjangan_pajak)} />
            </div>
            </div>
          )}

            {/* TAB - GAJI */}
            {activeTab === "minus" && (
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
              <h2 className="font-semibold text-gray-800">
                Pengurangan BPJS
              </h2>
              <InfoField label="Potongan BPJS Kesehatan" value={formatRupiah(pegawai?.potongan_bpjs_kesehatan)}/>
              <InfoField label="Potongan BPJS Ketenagakerjaan" value={formatRupiah(pegawai?.potongan_bpjs_ketenagakerjaan)}/>

            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
              <h2 className="font-semibold text-gray-800">
                Pengurangan Gaji
              </h2>

              <InfoField label="Izin" value={formatRupiah(pegawai?.izin)}/>
              <InfoField label="Terlambat" value={formatRupiah(pegawai?.terlambat)}/>
              <InfoField label="Mangkir" value={formatRupiah(pegawai?.mangkir)}/>
              <InfoField label="Saldo Kasbon" value={formatRupiah(pegawai?.saldo_kasbon)}/>
            
            </div>
            </div>
          )}

          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

/* COMPONENT KECIL  */

const InfoRow = ({ label, value }: any) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-900">
      {value || "-"}
    </span>
  </div>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="text-center text-gray-400 mt-10 text-sm">
    {text}
  </div>
);
