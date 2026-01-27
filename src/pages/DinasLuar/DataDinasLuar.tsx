import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import { DataTable, Column } from "../../components/common/DataTable";
import { useSearch } from "../../SearchContext";
import api from "../../api/axios";
import { useNavigate } from "react-router";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import { Pencil, Trash2, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import React from "react";
import { Briefcase, CheckCircle, XCircle, Calendar, AlertTriangle, Coffee } from "lucide-react";


interface DinasLuar {
  id: number;
  pegawai_id: number;
  company_id?: number;
  shift_id?: number;

  tanggal: string;
  jam_masuk?: string;
  jam_pulang?: string;

  foto_masuk?: string;   
  foto_pulang?: string;

  lokasi_masuk?: string;
  lokasi_pulang?: string;

  telat?: number;
  pulang_cepat?: number;
  status?: string;

  keterangan?: string;

  pegawai?: {
    id: number;
    name: string;
    company_id?: number;
  };

  shift?: {
    id: number;
    nama: string;
  };
}

export default function DataDinasLuar() {
  const { searchTerm } = useSearch();
  const [absens, setAbsens] = useState<DinasLuar[]>([]);
  const [loading, setLoading] = useState(true);
  const dashboardType = localStorage.getItem("dashboard_type");
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";


  const [pegawaiSearch, setPegawaiSearch] = useState("");

  const exportExcel = () => {
    const excelData = absens.map((a) => ({
      "Nama Pegawai": a.pegawai?.name || "-",
      Tanggal: a.tanggal,
      "Jam Masuk": a.jam_masuk || "-",
      "Jam Pulang": a.jam_pulang || "-",
      Keterangan: a.keterangan || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Absen");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `Data_Dinas Luar_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const navigate = useNavigate();

  const CustomInput = ({ value, onClick }: any) => (
    <button
      onClick={onClick}
      className="border px-3 py-2 rounded-lg w-40 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 hover:border-blue-500 transition-all focus:outline-none"
    >
      {value || "Pilih tanggal"}
    </button>
  );

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCompanies(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  const fetchAbsens = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/dinas-luar", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAbsens(res.data.data);
    } catch (err) {
      console.error("Error fetching absen:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsens();
    
    if (localStorage.getItem("dashboard_type") === "superadmin") {
      fetchCompanies();
    }
  }, []);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Hapus Absen?",
      text: "Data absen ini tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await api.delete(`/dinas-luar/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAbsens(absens.filter((a) => a.id !== id));

        Swal.fire("Terhapus!", "Data absen berhasil dihapus.", "success");
      } catch (error) {
        Swal.fire("Gagal", "Terjadi kesalahan saat menghapus data.", "error");
      }
    }
  };

  const handleEdit = (row: DinasLuar) => {
    navigate(`/edit-absen/${row.id}`);
  };

  const columns: Column<DinasLuar>[] = [
      { header: "No", accessor: "id", cell: (_, index) => index + 1 },
      { header: "Nama Pegawai", accessor: "pegawai", cell: (row) => row.pegawai?.name || "-" },
      { header: "Shift", cell: (r) => r.shift?.nama || "-"},
      { header: "Tanggal", accessor: "tanggal" },
      { header: "Jam Masuk", accessor: "jam_masuk", cell: (r) => r.jam_masuk || "-" },
      {
        header: "Foto Masuk",
        cell: (r) => {
          if (!r.foto_masuk) return "-";
  
          const foto =
            r.foto_masuk.startsWith("http")
              ? r.foto_masuk
              : `${BASE_URL}/storage/${r.foto_masuk}`;
  
          return (
            <img
              src={foto}
              alt="Foto Masuk"
              className="w-14 h-14 object-cover rounded-full cursor-pointer border shadow-sm"
              onClick={() => window.open(foto, "_blank")}
            />
          );
        },
      },
      { header: "Telat", accessor: "telat", cell: (r) => r.telat || "-" },
      { header: "Lokasi Masuk", cell: (r) => r.lokasi_masuk || "-" },
      { header: "Jam Pulang", accessor: "jam_pulang", cell: (r) => r.jam_pulang || "-" },
      {
        header: "Foto Pulang",
        cell: (r) => {
          if (!r.foto_pulang) return "-";
  
          const foto =
            r.foto_pulang.startsWith("http")
              ? r.foto_pulang
              : `${BASE_URL}/storage/${r.foto_pulang}`;
  
          return (
            <img
              src={foto}
              alt="Foto Pulang"
              className="w-14 h-14 object-cover rounded-full cursor-pointer border shadow-sm"
              onClick={() => window.open(foto, "_blank")}
            />
          );
        },
      },
      { header: "Pulang Cepat", accessor: "pulang_cepat", cell: (r) => r.pulang_cepat || "-" },
      {
        header: "Status",
        cell: (row) => <StatusBadge status={row.status} />,
      },
      { header: "Keterangan", accessor: "keterangan", cell: (r) => r.keterangan || "-" },
      {
        header: "Actions",
        cell: (row) => (
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(row)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
            >
              <Pencil size={16} />
            </button>
  
            <button
              onClick={() => handleDelete(row.id)}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ];

  const filteredAbsens = absens.filter((a) => {
    const name = (a.pegawai?.name ?? "").toLowerCase();
    const pegawaiMatch = name.includes(pegawaiSearch.toLowerCase());

    const tanggal = new Date(a.tanggal);
    const dateMatch =
      (!startDate || tanggal >= startDate) &&
      (!endDate || tanggal <= endDate);

    const companyMatch =
      !selectedCompany ||
      String(a.pegawai?.company_id) === selectedCompany;

    return pegawaiMatch && dateMatch && companyMatch;
  });

  const StatusBadge = ({ status }: { status?: string }) => {
    if (!status) return <span>-</span>;

    const map: Record<
      string,
      {
        text: string;
        className: string;
        icon: React.ReactNode;
      }
    > = {
      hadir: {
        text: "Hadir",
        className: "bg-green-100 text-green-700 border-green-300",
        icon: <CheckCircle size={14} />,
      },
      sakit: {
        text: "Sakit",
        className: "bg-yellow-100 text-yellow-700 border-yellow-300",
        icon: <AlertTriangle size={14} />,
      },
      izin: {
        text: "Izin",
        className: "bg-blue-100 text-blue-700 border-blue-300",
        icon: <Calendar size={14} />,
      },
      cuti: {
        text: "Cuti",
        className: "bg-purple-100 text-purple-700 border-purple-300",
        icon: <Coffee size={14} />,
      },
      dinas_luar: {
        text: "Dinas Luar",
        className: "bg-cyan-100 text-cyan-700 border-cyan-300",
        icon: <Briefcase size={14} />,
      },
      libur: {
        text: "Libur",
        className: "bg-gray-200 text-gray-700 border-gray-300",
        icon: <Calendar size={14} />,
      },
      alpha: {
        text: "Alpha",
        className: "bg-red-100 text-red-700 border-red-300",
        icon: <XCircle size={14} />,
      },
    };

    const item = map[status];

    return (
      <span
        className={`
          inline-flex items-center gap-1.5
          px-3 py-1
          text-xs font-semibold
          rounded-full border
          whitespace-nowrap
          ${item?.className ?? "bg-gray-100 text-gray-600 border-gray-300"}
        `}
      >
        {item?.icon}
        {item?.text ?? status}
      </span>
    );
  };

  // USER INTERFACE
  return (
    <>
      <PageMeta title="Absen" description="Data Absen Pegawai" />
      <PageHeader
        pageTitle="Data Dinas Luar"
        rightContent={
          <div className="flex gap-2">
            <button
              onClick={exportExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl"
            >
              📄 Export
            </button>
          </div>
        }
      />

      <div className="space-y-5 mt-4">
        <ComponentCard className="p-0">
          {loading ? (
            <p className="text-gray-700 dark:text-gray-300">Loading...</p>
          ) : (
            <div className="datatable-no-search">
              {/* ----------- FILTER ----------- */}
              <div className="w-full bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border dark:border-gray-700 mb-4">
                <div className="flex flex-wrap justify-between gap-6 items-center">
                  
                  {/* LEFT FILTER */}
                  <div className="flex flex-wrap gap-4">
                    
                    {/* Search Pegawai */}
                    <div className="flex flex-col">
                      <label className="text-gray-700 dark:text-gray-200">Cari Pegawai</label>
                      <input
                        type="text"
                        className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Cari nama pegawai..."
                        value={pegawaiSearch}
                        onChange={(e) => setPegawaiSearch(e.target.value)}
                      />
                    </div>

                    {/* Company */}
                    {dashboardType === "superadmin" && (
                    <div className="flex flex-col">
                      <label className="text-gray-700 dark:text-gray-200">Company</label>
                      <select
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                        className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Semua Company</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  </div>

                  {/* RIGHT FILTER */}
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex flex-col">
                      <label className="text-gray-700 dark:text-gray-200">Tanggal Mulai</label>
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        dateFormat="yyyy-MM-dd"
                        customInput={<CustomInput />}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-gray-700 dark:text-gray-200">Tanggal Akhir</label>
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        dateFormat="yyyy-MM-dd"
                        customInput={<CustomInput />}
                      />
                    </div>

                    <button
                      onClick={() => {
                        setPegawaiSearch("");
                        setSelectedCompany("");
                        setStartDate(null);
                        setEndDate(null);
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* TABLE */}
              <div
              className="
                overflow-x-auto [&_tr:hover]:bg-white [&_tr:hover]:text-gray-900
                dark:[&_tr:hover]:bg-gray-800 dark:[&_tr:hover]:text-gray-100
                [&_input]:bg-white [&_input]:text-gray-900 [&_input::placeholder]:text-gray-400
                dark:[&_input]:bg-gray-800 dark:[&_input]:text-gray-100 dark:[&_input::placeholder]:text-gray-400
                dark:[&_table]:bg-gray-900 dark:[&_table]:text-gray-100 dark:[&_thead]:bg-gray-800
                dark:[&_th]:bg-gray-800 dark:[&_th]:text-gray-100 dark:[&_tr]:border-gray-700
                dark:[&_td]:border-gray-700 [&_tr]:transition-colors"
            >
                <DataTable columns={columns} data={filteredAbsens} disableSearch />
              </div>
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
