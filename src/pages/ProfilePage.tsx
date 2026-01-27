import { useEffect, useState } from "react";
import PageMeta from "../components/common/PageMeta";
import PageHeader from "../PageHeader";
import ComponentCard from "../components/common/ComponentCard";
import api from "../api/axios";
import Swal from "sweetalert2";

interface ProfileData {
  id: number;
  name: string;
  username: string;
  email: string;
  telepon: string;
  foto_karyawan: string | null;
  tgl_lahir: string;
  tanggal_mulai_pwkt:string;
  tanggal_berakhir_pwkt:string;
  tunjangan_bpjs_kesehatan?: string;
  tunjangan_bpjs_ketenagakerjaan?: string;
  potongan_bpjs_ketenagakerjaan?: string;
  potongan_bpjs_kesehatan?: string;
  tunjangan_pajak?: string;
  terlambat?: string;
  gaji_pokok:string;
  makan_transport:string;
  lembur:string;
  kehadiran:string;
  rekening:string;
  izin_cuti:string;
  izin_lainnya:string;
  izin_pulang_cepat:string;
  izin_telat:string;
  nama_rekening:string;
  gender: string;
  tgl_join: string;
  status_nikah: string;
  alamat: string;
  company_name?: string;
  divisi_name?: string;
  status_pajak?: string;
  thr?: string;
  bonus_jackpot?: string;
  bonus_team?: string;
  bonus_pribadi?: string;
  ktp?: string;
  kartu_keluarga?: string;
  bpjs_kesehatan?: string;
  izin?: string;
  mangkir?: number;
  saldo_kasbon?: string;
  bpjs_ketenagakerjaan?: string;
  npwp?: string;
  sim?: string;
  no_pkwt?: string;
  no_kontrak?: string;
  lokasi_name?: string;
  role_name?: string;
  dashboard_type: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileData>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  // Fetch Profile
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Gunakan endpoint user/profile untuk halaman profile
      const res = await api.get("/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setProfile(res.data.data);
      setFormData(res.data.data);
      
      // Simpan user_id untuk penggunaan selanjutnya
      if (res.data.data?.id) {
        localStorage.setItem("user_id", res.data.data.id);
      }
      
      // Handle foto karyawan - sudah ada full URL dari backend
      if (res.data.data.foto_karyawan_url) {
        setPhotoPreview(res.data.data.foto_karyawan_url);
      } else if (res.data.data.foto_karyawan) {
        setPhotoPreview(`http://localhost:8000/storage/${res.data.data.foto_karyawan}`);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      Swal.fire("Error", "Gagal memuat data profil", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle Input Change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Photo Change
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Handle Update Profile
  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const formDataToSend = new FormData();
      
      // Append text fields
      Object.keys(formData).forEach((key) => {
        if (formData[key as keyof ProfileData] !== null && formData[key as keyof ProfileData] !== undefined) {
          formDataToSend.append(key, String(formData[key as keyof ProfileData]));
        }
      });

      // Append photo if changed
      if (photoFile) {
        formDataToSend.append("foto_karyawan", photoFile);
      }

      // Gunakan endpoint user/profile untuk update
      await api.post("/user/profile", formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire("Berhasil!", "Profil berhasil diperbarui", "success");
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      console.error("Error updating profile:", err);
      Swal.fire("Gagal", "Terjadi kesalahan saat memperbarui profil", "error");
    }
  };

  // Calculate Masa Kerja
  const calculateMasaKerja = (tglJoin: string) => {
    if (!tglJoin) return "-";
    
    const joinDate = new Date(tglJoin);
    const today = new Date();
    
    let years = today.getFullYear() - joinDate.getFullYear();
    let months = today.getMonth() - joinDate.getMonth();
    let days = today.getDate() - joinDate.getDate();
    
    if (days < 0) {
      months--;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    return `${years} Tahun, ${months} Bulan, ${days} Hari.`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-700 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-700 dark:text-gray-300">Data profil tidak ditemukan</p>
      </div>
    );
  }

  const formatRupiahPerBulan = (value?: number | string) => {
    if (value === null || value === undefined || value === "") return "-";
    return `Rp ${Number(value).toLocaleString("id-ID")} / Bulan`;
  };

  const formatRupiahPerJam = (value?: number | string) => {
    if (value === null || value === undefined || value === "") return "-";
    return `Rp ${Number(value).toLocaleString("id-ID")} / Jam`;
  };

  const formatRupiahPerHari = (value?: number | string) => {
    if (value === null || value === undefined || value === "") return "-";
    return `Rp ${Number(value).toLocaleString("id-ID")} / Hari`;
  };

  const formatRupiahPerTahun = (value?: number | string) => {
    if (value === null || value === undefined || value === "") return "-";
    return `Rp ${Number(value).toLocaleString("id-ID")} / Tahun`;
  };

  // USER INTERFACE
  return (
    <>
      <PageMeta title="My Profile" description="Profil Saya" />
      <PageHeader
        pageTitle="My Profile"
        titleClass="text-[32px] dark:text-white"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card - Profile Summary */}
        <ComponentCard className="dark:bg-gray-800 dark:border-gray-700">
          <div className="flex flex-col items-center">
            {/* Avatar */}
            <div className="w-48 h-48 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden mb-4">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 bg-white dark:bg-gray-400 rounded-full"></div>
              )}
            </div>

            {/* Name & Division */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {profile.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {profile.divisi_name || "-"}
            </p>

            {/* Info */}
            <div className="w-full space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900 dark:text-white">Email</span>
                <span className="text-gray-700 dark:text-gray-300">{profile.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900 dark:text-white">Username</span>
                <span className="text-gray-700 dark:text-gray-300">{profile.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900 dark:text-white">Telepon</span>
                <span className="text-gray-700 dark:text-gray-300">{profile.telepon || "-"}</span>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Right Card - Detail Form */}
        <ComponentCard className="dark:bg-gray-800 dark:border-gray-700 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-xl"
            >
              {isEditing ? "Cancel" : "Settings"}
            </button>
            
            {isEditing && (
              <button
                onClick={handleUpdateProfile}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2 rounded-xl"
              >
                Simpan Perubahan
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nama Pegawai */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Nama Pegawai
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full border px-3 py-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
              />
            </div>

            {/* Foto Pegawai */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Foto Pegawai
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={!isEditing}
                className="w-full border px-3 py-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full border px-3 py-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
              />
            </div>

            {/* Nomor Handphone */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Nomor Handphone
              </label>
              <input
                type="text"
                name="telepon"
                value={formData.telepon || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full border px-3 py-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full border px-3 py-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
              />
            </div>

            {/* Lokasi Kantor */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Lokasi Kantor
              </label>
              <input
                type="text"
                value={profile.lokasi_name || "-"}
                disabled
                className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
              />
            </div>

            {/* Tanggal Lahir */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Tanggal Lahir
              </label>
              <input
                type="date"
                name="tgl_lahir"
                value={formData.tgl_lahir ? new Date(formData.tgl_lahir).toISOString().split('T')[0] : ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full border px-3 py-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
              />
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Alamat
              </label>
              <textarea
                name="alamat"
                value={formData.alamat || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={1}
                className="w-full border px-3 py-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
              />
            </div>

            {/* Tanggal Masuk Perusahaan */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Tanggal Masuk Perusahaan
              </label>
              <input
                type="date"
                name="tgl_join"
                value={formData.tgl_join ? new Date(formData.tgl_join).toISOString().split('T')[0] : ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full border px-3 py-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
              />
            </div>

            {/* Masa Kerja */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Masa Kerja
              </label>
              <input
                type="text"
                value={calculateMasaKerja(profile.tgl_join)}
                disabled
                className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full border px-3 py-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
              >
                <option value="">Pilih Gender</option>
                <option value="Laki-laki">Laki-Laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            {/* Level User */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Level User
              </label>
              <input
                type="text"
                value={profile.dashboard_type || "-"}
                disabled
                className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
              />
            </div>

            {/* Status Pernikahan */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Status Pernikahan
              </label>
              <select
                name="status_nikah"
                value={formData.status_nikah || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full border px-3 py-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
              >
                <option value="">Pilih Status</option>
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

            {/* Divisi */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Divisi
              </label>
              <input
                type="text"
                value={profile.divisi_name || "-"}
                disabled
                className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
              />
            </div>

            {/* Status Pajak */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Status Pajak
              </label>
              <input
                type="text"
                value={profile.status_pajak || "-"}
                disabled
                className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
              />
            </div>

            {/* KTP */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Nomor KTP
              </label>
              <input
                type="text"
                value={profile.ktp || "-"}
                disabled
                className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
              />
            </div>

            {/* Kartu keluarga */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Nomor Kartu Keluarga
              </label>
              <input
                type="text"
                value={profile.kartu_keluarga || "-"}
                disabled
                className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
              />
            </div>

            {/* BPJS KESEHATAN */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Nomor BPJS Kesehatan
              </label>
              <input
                type="text"
                value={profile.bpjs_kesehatan || "-"}
                disabled
                className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
              />
            </div>

            {/* BPJS KETENAGAKERJAAN */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Nomor BPJS Ketenagakerjaan
              </label>
              <input
                type="text"
                value={profile.bpjs_ketenagakerjaan || "-"}
                disabled
                className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
              />
            </div>

            {/* NPWP */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Nomor NPWP
              </label>
              <input
                type="text"
                value={profile.npwp || "-"}
                disabled
                className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
              />
            </div>

            {/* SIM */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Nomor SIM
              </label>
              <input
                type="text"
                value={profile.sim || "-"}
                disabled
                className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
              />
            </div>

            {/* NO PKWT */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Nomor PKWT
              </label>
              <input
                type="text"
                value={profile.no_pkwt || "-"}
                disabled
                className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
              />
            </div>

            {/* NO KONTRAK */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Nomor Kontrak
              </label>
              <input
                type="text"
                value={profile.no_kontrak || "-"}
                disabled
                className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
              />
            </div>

            {/* Tanggal Mulai PKWT */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Tanggal Mulai PKWT
              </label>
              <input
                type="date"
                name="tanggal_mulai_pwkt"
                value={formData.tanggal_mulai_pwkt ? new Date(formData.tanggal_mulai_pwkt).toISOString().split('T')[0] : ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full border px-3 py-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
              />
            </div>

            {/* Tanggal Berakhir PKWT */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Tanggal Mulai PKWT
              </label>
              <input
                type="date"
                name="tanggal_berakhir_pwkt"
                value={formData.tanggal_berakhir_pwkt ? new Date(formData.tanggal_berakhir_pwkt).toISOString().split('T')[0] : ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full border px-3 py-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
              />
            </div>

            {/* REKENING */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Nomor Rekening
              </label>
              <input
                type="text"
                value={profile.rekening || "-"}
                disabled
                className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
              />
            </div>

            {/* NAMA REKENING */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Nomor Nama
              </label>
              <input
                type="text"
                value={profile.nama_rekening || "-"}
                disabled
                className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
              />
            </div>

            {/* ================= CUTI ================= */}
            <ComponentCard
                title="Cuti & Izin"
                titleClass="text-xl font-bold text-blue-600"
                className="lg:col-span-2"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                      Cuti
                    </label>
                    <input
                      type="text"
                      value={profile.izin_cuti || "-"}
                      disabled
                      className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                      Izin Masuk
                    </label>
                    <input
                      type="text"
                      value={profile.izin_lainnya || "-"}
                      disabled
                      className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                      Izin Telat
                    </label>
                    <input
                      type="text"
                      value={profile.izin_telat || "-"}
                      disabled
                      className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                      Izin Pulang Cepat
                    </label>
                    <input
                      type="text"
                      value={profile.izin_pulang_cepat || "-"}
                      disabled
                      className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                </div>
              </ComponentCard>
          
          {/* ================= Penjumlahan GAJI ================= */}
            <ComponentCard
                title="Penjumlahan Gaji"
                titleClass="text-xl font-bold text-blue-600"
                className="lg:col-span-2"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                      Gaji Pokok
                    </label>
                    <input
                      type="text"
                      value={formatRupiahPerBulan(profile.gaji_pokok)}
                      disabled
                      className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                      Makan & Transport
                    </label>
                    <input
                      type="text"
                      value={formatRupiahPerBulan(profile.makan_transport)}
                      disabled
                      className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                      lembur
                    </label>
                    <input
                      type="text"
                      value={formatRupiahPerJam(profile.lembur)}
                      disabled
                      className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                      100% Kehadiran
                    </label>
                    <input
                      type="text"
                      value={formatRupiahPerBulan(profile.kehadiran)}
                      disabled
                      className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                      THR
                    </label>
                    <input
                      type="text"
                      value={formatRupiahPerBulan(profile.thr)}
                      disabled
                      className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                      Bonus Pribadi
                    </label>
                    <input
                      type="text"
                      value={formatRupiahPerBulan(profile.bonus_pribadi)}
                      disabled
                      className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                      Bonus Team
                    </label>
                    <input
                      type="text"
                      value={formatRupiahPerBulan(profile.bonus_team)}
                      disabled
                      className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                      Bonus Jackpot
                    </label>
                    <input
                      type="text"
                      value={formatRupiahPerBulan(profile.bonus_jackpot)}
                      disabled
                      className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                </div>
              </ComponentCard>


          {/* ================= Pengurangan Gaji ================= */}
            <ComponentCard
                title="Pengurangan Gaji"
                titleClass="text-xl font-bold text-blue-600"
                className="lg:col-span-2"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                      Izin
                    </label>
                    <input
                      type="text"
                      value={formatRupiahPerHari(profile.izin)}
                      disabled
                      className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                      Terlambat
                    </label>
                    <input
                      type="text"
                      value={formatRupiahPerHari(profile.terlambat)}
                      disabled
                      className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                      Mangkir
                    </label>
                    <input
                      type="text"
                      value={formatRupiahPerHari(profile.mangkir)}
                      disabled
                      className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                      Saldo Kasbon
                    </label>
                    <input
                      type="text"
                      value={formatRupiahPerTahun(profile.saldo_kasbon)}
                      disabled
                      className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                </div>
              </ComponentCard>

          {/* ================= Tunjangan dan pajak ================= */}
            <ComponentCard
                title="Tunjangan & Potongan Pajak / BPJS"
                titleClass="text-xl font-bold text-blue-600"
                className="lg:col-span-2"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                      Tunjangan BPJS Kesehatan
                    </label>
                    <input
                      type="text"
                      value={profile.tunjangan_bpjs_kesehatan || "-"}
                      disabled
                      className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                      Tunjangan BPJS Ketenagakerjaan
                    </label>
                    <input
                      type="text"
                      value={profile.tunjangan_bpjs_ketenagakerjaan || "-"}
                      disabled
                      className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                      Potongan BPJS Kesehatan
                    </label>
                    <input
                      type="text"
                      value={profile.potongan_bpjs_kesehatan || "-"}
                      disabled
                      className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                      Potongan BPJS Ketenagakerjaan
                    </label>
                    <input
                      type="text"
                      value={profile.potongan_bpjs_ketenagakerjaan || "-"}
                      disabled
                      className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                      Tunjangan Pajak (Gross Up)
                    </label>
                    <input
                      type="text"
                      value={profile.tunjangan_pajak || "-"}
                      disabled
                      className="w-full border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                </div>
              </ComponentCard>


          </div>
        </ComponentCard>
      </div>
    </>
  );
}