import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import NotFound from "./pages/OtherPage/NotFound";
import Home from "./pages/Dashboard/Home";
import UserProfiles from "./pages/ProfilePage";
import Calendar from "./pages/Calendar";
import Blank from "./pages/Blank";
import BasicTables from "./pages/Tables/BasicTables";
import Alerts from "./pages/UiElements/Alerts";
import Avatars from "./pages/UiElements/Avatars";
import Badges from "./pages/UiElements/Badges";
import Buttons from "./pages/UiElements/Buttons";
import Images from "./pages/UiElements/Images";
import Videos from "./pages/UiElements/Videos";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import AppLayout from "./layout/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { ScrollToTop } from "./components/common/ScrollToTop";
import PublicRoute from "./components/PublicRoute";
import Company from "./pages/Company/Company";
import AddCompany from "./pages/Company/AddCompany";
import Pegawai from "./pages/Pegawai/Pegawai";
import AddPegawai from "./pages/Pegawai/AddPegawai";
import EditCompany from "./pages/Company/EditCompany";
import Role from "./pages/Role/Role";
import AddRole from "./pages/Role/AddRole";
import Kontrak from "./pages/Kontrak/kontrak";
import DivisiPage from "./pages/Divisi/divisi";
import AddKontrak from "./pages/Kontrak/AddKontrak";
import EditKontrak from "./pages/Kontrak/EditKontrak";
import EditRole from "./pages/Role/EditRole";
import EditPegawai from "./pages/Pegawai/EditPegawai";
import PegawaiForm from "./components/Pegawai/PegawaiForm";
import PegawaiKeluar from "./pages/PegawaiKeluar/PegawaiKeluar";
import AddPegawaiKeluar from "./pages/PegawaiKeluar/AddPegawaiKeluar";
import AddDivisi from "./pages/Divisi/AddDivisi";
import EditDivisi from "./pages/Divisi/EditDivisi";
import Shift from "./pages/Shift/Shift";
import AddShift from "./pages/Shift/AddShift";
import EditShift from "./pages/Shift/EditShift";
import LokasiPage from "./pages/Lokasi/Lokasi";
import AddLokasi from "./pages/Lokasi/AddLokasi";
import EditLokasi from "./pages/Lokasi/EditLokasi";
import "./styles/datepicker.css";
import CutiPage from "./pages/Cuti/Cuti";
import AddCuti from "./pages/Cuti/AddCuti";
import Penugasan from "./pages/Penugasan/Penugasan";
import AddPenugasan from "./pages/Penugasan/AddPenugasan";
import EditPenugasan from "./pages/Penugasan/EditPenugasan";
import Rapat from "./pages/Rapat/Rapat";
import AddRapat from "./pages/Rapat/AddRapat";
import EditRapat from "./pages/Rapat/EditRapat";
import JenisKinerja from "./pages/JenisKinerja/JenisKinerja";
import AddJenisKinerja from "./pages/JenisKinerja/AddJenisKinerja";
import EditJenisKinerja from "./pages/JenisKinerja/EditJenisKinerja";
import InventoryPage from "./pages/Inventory/Inventory";
import LaporanKinerja from "./pages/Laporan Kinerja/LaporanKinerja";
import AddInventory from "./pages/Inventory/AddInventory";
import EditInventory from "./pages/Inventory/EditInventory";
import KinerjaPegawaiPage from "./pages/Kinerja Pegawai/KinerjaPegawai";
import LaporanKerjaPage from "./pages/Laporan Kerja/LaporanKerja";
import DataAbsen from "./pages/Absensi/DataAbsen";
import DataDinasLuar from "./pages/DinasLuar/DataDinasLuar";
import KategoriReimbursement from "./pages/Reimbursement/KategoriReimbursement";
import AddKategoriReimbursement from "./pages/Reimbursement/AddKategoriReimbursement";
import EditKasbon from "./pages/Kasbon/EditKasbon";
import EditKategoriReimbursement from "./pages/Reimbursement/EditKategoriReimbursement";
import BeritaPage from "./pages/Berita dan Informasi/Berita";
import AddBerita from "./pages/Berita dan Informasi/AddBerita";
import EditBerita from "./pages/Berita dan Informasi/EditBerita";
import Reimbursements from "./pages/Reimbursements/Reimbursements";
import AddReimbursement from "./pages/Reimbursements/AddReimbursement";
import AddShiftMapping from "./pages/Mapping Shift dan dinas luar/AddShiftMapping";
import PegawaiShiftPage from "./pages/User Interface/Absen/PegawaiShiftPage";
import JadwalShiftPegawai from "./pages/User Interface/Jadwal Shift/JadwalShiftPegawai";
import PegawaiHome from "./pages/User Interface/Home/PegawaiHome";
import DataLembur from "./pages/Lembur/DataLembur";
import AddReimbursementPegawai from "./pages/User Interface/Reimbursement/AddReimbursementPegawai";
import ReimbursementPegawai from "./pages/User Interface/Reimbursement/ReimbursementPegawai";
import EditReimbursementPegawai from "./pages/User Interface/Reimbursement/EditReimbursementPegawai";
import KasbonPegawai from "./pages/User Interface/Kasbon/KasbonPegawai";
import Kasbon from "./pages/Kasbon/Kasbon";
import AddKasbonPegawai from "./pages/User Interface/Kasbon/AddKasbonPegawai";
import AddKasbon from "./pages/Kasbon/AddKasbon";
import EditKasbonPegawai from "./pages/User Interface/Kasbon/EditKasbonPegawai";
import CutiPegawai from "./pages/User Interface/Cuti/CutiPegawai";
import AddCutiPegawai from "./pages/User Interface/Cuti/AddCutiPegawai";
import EditCutiPegawai from "./pages/User Interface/Cuti/EditCutiPegawai";
import AddDinasLuarMapping from "./pages/Mapping Shift dan dinas luar/AddDinasLuarMapping";
import JadwalDinasLuarMappingPegawai from "./pages/User Interface/Jadwal Dinas Luar Mapping/JadwalDinasLuarMappingPegawai";
import DinasLuarPegawaiPage from "./pages/User Interface/Absen/DinasLuarPegawaiPage";
import LemburPegawaiPage from "./pages/User Interface/Absen/LemburPegawaiPage";
import HistoryAbsenPegawaiPage from "./pages/User Interface/History/HistoryAbsenPegawai";
import HistoryDinasPegawai from "./pages/User Interface/History/HistoryDinasPegawai";
import HistoryLemburPegawai from "./pages/User Interface/History/HistoryLemburPegawai";
import AllMenuPegawai from "./pages/User Interface/Home/AllMenuPegawai";
import Dokumen from "./pages/Dokumen Pegawai/Dokumen";
import AddDokumen from "./pages/Dokumen Pegawai/AddDokumen";
import EditDokumen from "./pages/Dokumen Pegawai/EditDokumen";
import DokumenPegawai from "./pages/User Interface/Dokumen Pegawai/DokumenPegawai";
import AddDokumenPegawai from "./pages/User Interface/Dokumen Pegawai/AddDokumenPegawai";
import EditDokumenPegawai from "./pages/User Interface/Dokumen Pegawai/EditDokumenPegawai";
import BeritaDetail from "./pages/User Interface/Berita dan Informasi/BeritaDetail";
import BeritaList from "./pages/User Interface/Home/BeritaList";
import AddKunjungan from "./pages/Kunjungan/AddKunjungan";
import KunjunganPage from "./pages/Kunjungan/Kunjungan";
import VisitOutKunjungan from "./pages/Kunjungan/VisitOutKunjungan";
import KunjunganPegawai from "./pages/User Interface/Kunjungan/KujunganPegawai";
import AddVisitInPegawai from "./pages/User Interface/Kunjungan/AddVisitInPegawai";
import VisitOutPegawai from "./pages/User Interface/Kunjungan/VisitOutPegawai";
import PenugasanPegawai from "./pages/User Interface/Penugasan/PenugasanPegawai";
import DetailPenugasan from "./pages/User Interface/Penugasan/DetailPenugasan";
import RapatPegawai from "./pages/User Interface/Rapat/RapatPegawai";
import RapatPegawaiDetail from "./pages/User Interface/Rapat/RapatPegawaiDetail";
import InventoryPegawai from "./pages/User Interface/Inventory/InventoryPegawai";
import AddInventoryPegawai from "./pages/User Interface/Inventory/AddInventoryPegawai";
import ChangePasswordPegawai from "./pages/User Interface/ChangePassword/ChangePasswordPegawai";
import MyProfilePegawai from "./pages/User Interface/Profile/MyProfilePegawai";
import RekapData from "./pages/RekapSummary/RekapSummary";
import LaporanKinerjaPegawai from "./pages/User Interface/Laporan Kinerja/LaporanKinerjaPegawai";
import LaporanKerjaPegawai from "./pages/User Interface/Laporan Kerja/LaporanKerjaPegawai";
import AddLaporanKerjaPegawai from "./pages/User Interface/Laporan Kerja/AddLaporanKerjaPegawai";
import LaporanKerjaDetailPegawai from "./pages/User Interface/Laporan Kerja/LaporanKerjaDetailPegawai";
import EditLaporanKerjaPegawai from "./pages/User Interface/Laporan Kerja/EditLaporanKerjaPegawai";
import ShiftRequestApproval from "./pages/Shift/ShiftRequestApproval";
import FaceEnroll from "./pages/User Interface/Face Recognition/FaceEnroll";
import Payroll from "./pages/Payroll/Payroll";
import HitungGajiPegawai from "./pages/RekapSummary/HitungGajiPegawai";
import EditPayrollPegawai from "./pages/Payroll/EditPayrollPegawai";
import KontrakPegawai from "./pages/Kontrak/KontrakPegawai";
import PenggajianPegawai from "./pages/User Interface/Payroll/PenggajianPegawai";
import Notification from "./pages/Notification/Notification";
import NotificationPegawai from "./pages/User Interface/Notifications/NotificationPegawai";
import FaceRecognition from "./pages/Absensi/FaceRecognition";
import FaceRecognitionRegisterPegawai from "./pages/User Interface/Face Recognition/FaceRecognitionRegisterPegawai";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Auth Pages */}
        <Route path="/" element={<PublicRoute><SignIn /> </PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword/></PublicRoute>} />

      {/* ROUTING UNTUK PEGAWAI */}
        <Route
          path="/home-pegawai"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <PegawaiHome />
              </ProtectedRoute>
          }
        />
        <Route
          path="/shift-mapping/self/:pegawai_id"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <JadwalShiftPegawai />
              </ProtectedRoute>
          }
        />   
        <Route
          path="/add-kunjungan-pegawai"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <AddVisitInPegawai />
              </ProtectedRoute>
          }
        />   

        <Route
          path="/notification"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <NotificationPegawai />
              </ProtectedRoute>
          }
        />   

        <Route
          path="/kunjungan-pegawai/visit-out/:id"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <VisitOutPegawai />
              </ProtectedRoute>
          }
        />
        <Route
          path="/penugasan/:id"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <DetailPenugasan />
              </ProtectedRoute>
          }
        />
        <Route
          path="/penugasan-pegawai"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <PenugasanPegawai />
              </ProtectedRoute>
          }
        />           
        <Route
          path="/dinas-luar/self/:pegawai_id"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <JadwalDinasLuarMappingPegawai />
              </ProtectedRoute>
          }
        />  
        
        <Route
          path="/change-password-pegawai"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <ChangePasswordPegawai />
              </ProtectedRoute>
          }
        />

         <Route
          path="/my-profile-pegawai/:id"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <MyProfilePegawai />
              </ProtectedRoute>
          }
        />    

        <Route
          path="/face-recog-regis/:id"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <FaceRecognitionRegisterPegawai />
              </ProtectedRoute>
          }
        />    

        <Route
          path="/absensi/pegawai/:pegawai_id"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <PegawaiShiftPage />
              </ProtectedRoute>
          }
        />
        <Route
          path="/absensi-lembur/pegawai/:pegawai_id"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <LemburPegawaiPage />
              </ProtectedRoute>
          }
        />
        <Route
          path="/absensi-dinas-luar/pegawai/:pegawai_id"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <DinasLuarPegawaiPage />
              </ProtectedRoute>
          }
        />
        <Route
          path="/dokumen/:pegawai_id"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <DokumenPegawai/>
              </ProtectedRoute>
          }
        />

        <Route
          path="/reimbursement-pegawai"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <ReimbursementPegawai/>
              </ProtectedRoute>
          }
        />

         <Route
          path="/payroll-pegawai"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <PenggajianPegawai/>
              </ProtectedRoute>
          }
        />

        <Route
          path="/add-reimbursement-pegawai"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <AddReimbursementPegawai/>
              </ProtectedRoute>
          }
        />

        <Route
          path="/edit-reimbursement-pegawai/:id"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <EditReimbursementPegawai/>
              </ProtectedRoute>
          }
        />

        <Route
          path="/edit-dokumen-pegawai/:id"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <EditDokumenPegawai/>
              </ProtectedRoute>
          }
        />

        <Route
          path="/berita/pegawai"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <BeritaList/>
              </ProtectedRoute>
          }
        />

        <Route
          path="/berita/:id"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <BeritaDetail/>
              </ProtectedRoute>
          }
        />

        <Route
          path="/kasbon-pegawai"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <KasbonPegawai/>
              </ProtectedRoute>
          }
        />

        <Route
          path="/laporan-kinerja-pegawai"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <LaporanKinerjaPegawai/>
              </ProtectedRoute>
          }
        />

         <Route
          path="/laporan-kerja-pegawai"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <LaporanKerjaPegawai/>
              </ProtectedRoute>
          }
        />

        <Route
          path="/add-laporan-kerja-pegawai"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <AddLaporanKerjaPegawai/>
              </ProtectedRoute>
          }
        />

        <Route
          path="/laporan-kerja/:id"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <LaporanKerjaDetailPegawai/>
              </ProtectedRoute>
          }
        />

        <Route
          path="/edit-laporan-kerja/:id"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <EditLaporanKerjaPegawai/>
              </ProtectedRoute>
          }
        />

        <Route
          path="/add-kasbon-pegawai"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <AddKasbonPegawai/>
              </ProtectedRoute>
          }
        />

        <Route
          path="/history-absen/:id"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <HistoryAbsenPegawaiPage/>
              </ProtectedRoute>
          }
        />

        <Route
          path="/history-lembur/:id"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <HistoryLemburPegawai/>
              </ProtectedRoute>
          }
        />

        <Route
          path="/history-dinas/:id"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <HistoryDinasPegawai/>
              </ProtectedRoute>
          }
        />

        <Route
          path="/pegawai/rapat/:id"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <RapatPegawaiDetail/>
              </ProtectedRoute>
          }
        />

        <Route
          path="/inventory-pegawai"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <InventoryPegawai/>
              </ProtectedRoute>
          }
        />

        <Route
          path="/add-inventory-pegawai"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <AddInventoryPegawai/>
              </ProtectedRoute>
          }
        />

        <Route
          path="/other"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <AllMenuPegawai/>
              </ProtectedRoute>
          }
        />

        <Route
          path="/edit-kasbon-pegawai/:id"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <EditKasbonPegawai/>
              </ProtectedRoute>
          }
        />

        <Route
          path="/cuti-izin"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <CutiPegawai/>
              </ProtectedRoute>
          }
        />

        <Route
          path="/rapat-pegawai"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <RapatPegawai/>
              </ProtectedRoute>
          }
        />

        <Route
          path="/add-cuti-pegawai"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <AddCutiPegawai/>
              </ProtectedRoute>
          }
        />

        <Route
          path="/add-dokumen-pegawai"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <AddDokumenPegawai/>
              </ProtectedRoute>
          }
        />
        <Route
          path="/kunjungan-pegawai"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <KunjunganPegawai/>
              </ProtectedRoute>
          }
        />

        <Route
          path="/edit-cuti-pegawai/:id"
          element={
              <ProtectedRoute allowedRoles={["pegawai"]}>
                <EditCutiPegawai/>
              </ProtectedRoute>
          }
        />

        {/* Protected Dashboard */}
        <Route element={<ProtectedRoute allowedRoles={["admin","superadmin"]}><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/blank" element={<Blank />} />
          <Route path="/basic-tables" element={<BasicTables />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/badge" element={<Badges />} />
          <Route path="/buttons" element={<Buttons />} />
          <Route path="/images" element={<Images />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/line-chart" element={<LineChart />} />
          <Route path="/bar-chart" element={<BarChart />} />
          <Route path="/company" element={<Company />} />
          <Route path="/add-company" element={<AddCompany />} />
          <Route path="/pegawai" element={<Pegawai />} />
          

          <Route path="/shift-request-approval" element={<ShiftRequestApproval />} />

          <Route path="/add-pegawai" element={<AddPegawai />} />
          <Route path="/edit-pegawai/:id" element={<EditPegawai />} />
          <Route path="/edit-company/:id" element={<EditCompany />} />
          <Route path="/role" element={<Role />} />
          <Route path="/edit-role/:id" element={<EditRole />} />
          <Route path="/add-role" element={<AddRole />} />
          <Route path="/kontrak" element={<Kontrak />} />
          <Route path="/add-kontrak" element={<AddKontrak />} />
          <Route path="/edit-kontrak/:id" element={<EditKontrak />} />
          <Route path="/pegawai-keluar" element={<PegawaiKeluar />} />
          <Route path="/add-pegawai-keluar" element={<AddPegawaiKeluar />} />
          <Route path="/divisi" element={<DivisiPage />} />
          <Route path="/add-divisi" element={<AddDivisi />} />
          <Route path="/edit-divisi/:id" element={<EditDivisi />} />
          <Route path="/shift" element={<Shift />} />
          <Route path="/rekap-data" element={<RekapData />} />
          <Route path="/add-shift" element={<AddShift />} />
          <Route path="/edit-shift/:id" element={<EditShift />} />
          <Route path="/lokasi" element={<LokasiPage />} />
          <Route path="/add-lokasi" element={<AddLokasi />} />
          <Route path="/edit-lokasi/:id" element={<EditLokasi />} />
          <Route path="/cuti" element={<CutiPage />} />
          <Route path="/add-cuti" element={<AddCuti />} />
          <Route path="/penugasan" element={<Penugasan />} />
          <Route path="/add-penugasan" element={<AddPenugasan />} />
          <Route path="/edit-penugasan/:id" element={<EditPenugasan />} />
          <Route path="/rapat" element={<Rapat />} />
          <Route path="/add-rapat" element={<AddRapat />} />
          <Route path="/edit-rapat/:id" element={<EditRapat />} />
          <Route path="/jenis-kinerja" element={<JenisKinerja />} />
          <Route path="/add-jenis-kinerja" element={<AddJenisKinerja />} />
          <Route path="/edit-jenis-kinerja/:id" element={<EditJenisKinerja />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/add-inventory" element={<AddInventory />} />
          <Route path="/laporan-kinerja" element={<LaporanKinerja />} />
          <Route path="/edit-inventory/:id" element={<EditInventory />} />
          <Route path="/kinerja-pegawai" element={<KinerjaPegawaiPage />} />
          <Route path="/laporan-kerja" element={<LaporanKerjaPage />} />
          <Route path="/dokumen-pegawai" element={<Dokumen />} />
          <Route path="/add-dokumen-pegawai" element={<AddDokumen />} />
          <Route path="/edit-dokumen-pegawai/:id" element={<EditDokumen/>} />
          <Route path="/data-absen" element={<DataAbsen />} />
          <Route path="/kasbon" element={<Kasbon />} />
          <Route path="/add-kasbon" element={<AddKasbon />} />
          <Route path="/edit-kasbon/:id" element={<EditKasbon/>} />
          <Route path="/data-dinas-luar" element={<DataDinasLuar />} />
          <Route path="/kategori-reimbursement" element={<KategoriReimbursement />} />
          <Route path="/add-kategori-reimbursement" element={<AddKategoriReimbursement />} />
          <Route path="/edit-kategori-reimbursement/:id" element={<EditKategoriReimbursement/>} />
          <Route path="/berita" element={<BeritaPage />} />
          <Route path="/add-berita" element={<AddBerita />} />
          <Route path="/edit-berita/:id" element={<EditBerita/>} />
          <Route path="/reimbursement" element={<Reimbursements />} />
          <Route path="/add-reimbursement" element={<AddReimbursement />} />
          <Route path="/input-shift/:id" element={<AddShiftMapping/>} />
          <Route path="/input-dinas-luar/:id" element={<AddDinasLuarMapping/>} />
          <Route path="/lembur" element={<LemburPegawaiPage/>} />
          <Route path="/kunjungan" element={<KunjunganPage/>} />
          <Route path="/add-kunjungan" element={<AddKunjungan/>} />
          <Route path="/kunjungan/:id/visit-out" element={<VisitOutKunjungan/>} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/payroll/edit/:payrollId" element={<EditPayrollPegawai />} />
          <Route path="/kontrak-kerja/:pegawaiId" element={<KontrakPegawai />} />
          <Route path="/notifications" element={<Notification />} />
          <Route path="/face-recognition/:id" element={<FaceRecognition />} />



          <Route path="/hitung-gaji/:pegawaiId" element={<HitungGajiPegawai />} />

          <Route path="/data-lembur" element={<DataLembur />} />
          {/* User Interface */}
          <Route path="/pegawai/dashboard" element={<PegawaiShiftPage />} />
          <Route path="/dinas-luar" element={<DinasLuarPegawaiPage />} />
          <Route path="/shift-mapping/pegawai/:id" element={<JadwalShiftPegawai />} />
          <Route path="/face-recognition" element={<FaceEnroll />} />

          {/* contoh */}
          <Route path="/contoh" element={<PegawaiForm />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
