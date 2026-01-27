import React from "react";
import {
  AbsensiIcon,
  CompanyIcon,
  ContractIcon,
  CutiIcon,
  DivisionIcon,
  DokumenPegawaiIcon,
  GridIcon,
  InformationIcon,
  InventoryIcon,
  KeuanganIcon,
  LaporanIcon,
  LocationIcon,
  OvertimeIcon,
  PenugasanIcon,
  PeopleMinusIcon,
  RapatIcon,
  RekapDataIcon,
  RoleIcon,
  ShiftIcon,
  UserAddIcon,
  UserCircleIcon,
  VisitIcon,
} from "../icons";

export type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// Base menu per role
export const getSidebarMenu = (role: "admin" | "superadmin"): NavItem[] => {
  const baseMenu: NavItem[] = [
    { icon: <GridIcon />, name: "Dashboard", path: "/dashboard" },
    { icon: <UserAddIcon />, name: "Pegawai", path: "/pegawai" },
    { icon: <ShiftIcon />, name: "Request Shift", path: "/shift-request-approval" },
    { icon: <RoleIcon />, name: "Role", path: "/role" },
    { icon: <ContractIcon />, name: "Kontrak", path: "/kontrak" },
    { icon: <PeopleMinusIcon />, name: "Pegawai Keluar", path: "/pegawai-keluar" },
    { icon: <DivisionIcon />, name: "Divisi", path: "/divisi" },
    { icon: <ShiftIcon />, name: "Shift", path: "/shift" },
    { icon: <LocationIcon />, name: "Lokasi", path: "/lokasi" },
    { icon: <RekapDataIcon />, name: "Rekap Data", path: "/rekap-data" },
    { icon: <CutiIcon />, name: "Cuti", path: "/cuti" },
    {
      name: "Absensi",
      icon: <AbsensiIcon />,
      subItems: [
        { name: "Absen", path: "/pegawai/dashboard" },
        { name: "Data Absen", path: "/data-absen" },
        { name: "Absen Dinas Luar", path: "/dinas-luar" },
        { name: "Data Dinas Luar", path: "/data-dinas-luar" },
      ],
    },
    {
      name: "OverTime",
      icon: <OvertimeIcon />,
      subItems: [
        { name: "Lembur", path: "/lembur" },
        { name: "Data Lembur", path: "/data-lembur" },
      ],
    },
    { icon: <VisitIcon />, name: "Kunjungan", path: "/kunjungan" },
    { icon: <PenugasanIcon />, name: "Penugasan", path: "/penugasan" },
    { icon: <RapatIcon />, name: "Rapat", path: "/rapat" },
    { icon: <LaporanIcon />, name: "Laporan Kerja", path: "/laporan-kerja" },
    { icon: <InventoryIcon />, name: "Inventory", path: "/inventory" },
    {
      name: "Keuangan",
      icon: <KeuanganIcon />,
      subItems: [
        { name: "Payroll", path: "/payroll" },
        { name: "Kasbon", path: "/kasbon" },
        { name: "Reimbursement", path: "/reimbursement" },
        { name: "Kategori Reimbursement", path: "/kategori-reimbursement" },
      ],
    },
    { icon: <DokumenPegawaiIcon />, name: "Dokumen Pegawai", path: "/dokumen-pegawai" },
    { icon: <InformationIcon />, name: "Informasi dan Berita", path: "/berita" },
    { icon: <UserCircleIcon />, name: "User Profile", path: "/profile" },
  ];

  // Tambah menu Company hanya untuk superadmin
  if (role === "superadmin") {
    baseMenu.splice(1, 0, { icon: <CompanyIcon />, name: "Company", path: "/company" });
  }

  return baseMenu;
};

// Others menu
export const othersMenu: NavItem[] = [
  
];
