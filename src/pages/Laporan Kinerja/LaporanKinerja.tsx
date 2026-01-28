import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import { DataTable, Column } from "../../components/common/DataTable";
import { useSearch } from "../../SearchContext";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Pencil, Trash2 } from "lucide-react";

interface Kinerja {
  id: number;
  tanggal: string;
  jenis_kinerja: string;
  bobot_penilaian: string;
  penilaian_berjalan: string;

  pegawai?: {
    id: number;
    name: string;
    company_id: number;
  };
}

export default function LaporanKinerja() {
  const { searchTerm } = useSearch();
  const [records, setRecords] = useState<Kinerja[]>([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [pegawaiSearch, setPegawaiSearch] = useState("");
  const dashboardType = localStorage.getItem("dashboard_type");

  // DATE FILTERS
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const navigate = useNavigate();

  // FETCH COMPANIES
  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(res.data.data);
    } catch {
      setCompanies([]);
    }
  };

  // FETCH LAPORAN KINERJA
  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/laporan-kinerja", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRecords(res.data.data);
    } catch (e) {
      console.error("Error fetching laporan kinerja:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchRecords();
  }, []);

  // EXPORT EXCEL
  const exportExcel = () => {
    const excelData = records.map((t) => ({
      Tanggal: t.tanggal,
      "Nama Pegawai": t.pegawai?.name || "-",
      jenis_kinerja: t.jenis_kinerja,
      bobot_penilaian: t.bobot_penilaian,
      penilaian_berjalan: t.penilaian_berjalan,
    }));

    const sheet = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Laporan Kinerja");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
      `Laporan_Kinerja_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // ACTION: DELETE
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Hapus data ini?",
      text: "Data tidak dapat dikembalikan setelah dihapus!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/laporan-kinerja/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRecords(records.filter((r) => r.id !== id));
      Swal.fire("Terhapus!", "Data telah dihapus.", "success");
    } catch {
      Swal.fire("Gagal", "Tidak dapat menghapus data.", "error");
    }
  };

  // ACTION: EDIT
  const handleEdit = (row: Kinerja) => {
    navigate(`/edit-laporan-kinerja/${row.id}`);
  };

  // COLUMNS TABLE
  const columns: Column<Kinerja>[] = [
    {
      header: "No",
      accessor: "id",
      width: "60px",
      cell: (_, i) => i + 1,
    },
    {
      header: "Nama Pegawai",
      accessor: "pegawai",
      cell: (row) => row.pegawai?.name || "-",
    },
    {
      header: "Tanggal",
      accessor: "tanggal",
      cell: (row) =>
        new Date(row.tanggal).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
    },
    {
      header: "Jenis Kinerja",
      accessor: "jenis_kinerja",
    },
    {
      header: "Bobot Penilaian",
      accessor: "bobot_penilaian",
    },
    {
      header: "Penilaian Berjalan",
      accessor: "penilaian_berjalan",
      cell: (row) => {
        const colors: any = {
          selesai: "#a3d88d",
          proses: "#c7defe",
          pending: "#ffecb1",
        };

        return (
          <span
            style={{
              backgroundColor: colors[row.penilaian_berjalan] || "#ccc",
              padding: "6px 12px",
              borderRadius: "8px",
              fontWeight: 500,
              textTransform: "capitalize",
            }}
          >
            {row.penilaian_berjalan}
          </span>
        );
      },
    },
  ];

  // FILTERS
  const filteredData = records.filter((r) => {
    const name = (r.pegawai?.name ?? "").toLowerCase();
    const nameMatch = name.includes(pegawaiSearch.toLowerCase());

    const tgl = new Date(r.tanggal);
    const tglMatch =
      (!startDate || tgl >= startDate) &&
      (!endDate || tgl <= endDate);

    const companyMatch =
      !selectedCompany || String(r.pegawai?.company_id) === selectedCompany;

    return nameMatch && tglMatch && companyMatch;
  });

  const CustomInput = ({ value, onClick }: any) => (
    <button
      onClick={onClick}
      className="border px-3 py-2 rounded-lg w-40 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
    >
      {value || "Pilih tanggal"}
    </button>
  );

  return (
    <>
      <PageMeta title="Laporan Kinerja" description="Data Laporan Kinerja Pegawai" />

      <PageHeader
        pageTitle="Laporan Kinerja"
        titleClass="text-[32px] dark:text-white"
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
        <ComponentCard className="dark:bg-gray-800 dark:border-gray-700 p-0">
          {loading ? (
            <p className="text-gray-700 dark:text-gray-200">Loading...</p>
          ) : (
            <div className="datatable-no-search">
              <div className="w-full bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border border-gray-300 dark:border-gray-700 mb-4">
                <div className="flex flex-wrap justify-between gap-6 items-center">
                  <div className="flex flex-wrap gap-4">

                    {/* CARI PEGAWAI */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium mb-1 dark:text-white">Cari Pegawai</label>
                      <input
                        type="text"
                        value={pegawaiSearch}
                        onChange={(e) => setPegawaiSearch(e.target.value)}
                        placeholder="Cari nama pegawai..."
                        className="border px-3 py-2 rounded-lg w-72 bg-white dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    {/* COMPANY */}
                    {dashboardType === "superadmin" && (
                      <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1 dark:text-white">Company</label>
                        <select
                          value={selectedCompany}
                          onChange={(e) => setSelectedCompany(e.target.value)}
                          className="border px-3 py-2 rounded-lg w-72 bg-white dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Semua Company</option>
                          {companies.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* RIGHT AREA */}
                  <div className="flex flex-wrap gap-4 items-end">
                    {/* TGL MULAI */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium mb-1 dark:text-white">Tanggal Mulai</label>
                      <DatePicker
                        selected={startDate}
                        onChange={setStartDate}
                        dateFormat="yyyy-MM-dd"
                        customInput={<CustomInput />}
                      />
                    </div>

                    {/* TGL AKHIR */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium mb-1 dark:text-white">Tanggal Akhir</label>
                      <DatePicker
                        selected={endDate}
                        onChange={setEndDate}
                        dateFormat="yyyy-MM-dd"
                        customInput={<CustomInput />}
                      />
                    </div>

                    {/* RESET */}
                    <button
                      onClick={() => {
                        setPegawaiSearch("");
                        setSelectedCompany("");
                        setStartDate(null);
                        setEndDate(null);
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg h-[42px]"
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
                <DataTable columns={columns} data={filteredData} disableSearch />
              </div>
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
