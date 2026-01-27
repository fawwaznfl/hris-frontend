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
import { Pencil, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Penugasan {
  id: number;
  nomor_penugasan: string;
  judul_pekerjaan: string;
  rincian_pekerjaan: string;
  status: string;
  created_at: string;

  pegawai?: {
    id: number;
    name: string;
    company_id?: number;
  };
}

export default function Penugasan() {
  const { searchTerm } = useSearch();
  const [assignments, setAssignments] = useState<Penugasan[]>([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const dashboardType = localStorage.getItem("dashboard_type");
  const [pegawaiSearch, setPegawaiSearch] = useState("");

  // DATE FILTER
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

  // FETCH ASSIGNMENTS
  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/penugasan", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignments(res.data.data);
    } catch (err) {
      console.error("Error fetching penugasan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
    
    if (localStorage.getItem("dashboard_type") === "superadmin") {
      fetchCompanies();
    }
  }, []);

  // EXPORT EXCEL
  const exportExcel = () => {
    const excelData = assignments.map((t) => ({
      "Nomor Penugasan": t.nomor_penugasan,
      Tanggal: t.created_at,
      "Nama Pegawai": t.pegawai?.name || "-",
      "Judul Pekerjaan": t.judul_pekerjaan,
      "Rincian Pekerjaan": t.rincian_pekerjaan,
      Status: t.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Penugasan");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(file, `Data_Penugasan_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // DELETE
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Tugas yang dihapus tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await api.delete(`/penugasan/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAssignments(assignments.filter((t) => t.id !== id));

        Swal.fire("Terhapus!", "Tugas berhasil dihapus.", "success");
      } catch {
        Swal.fire("Gagal", "Terjadi kesalahan saat menghapus tugas.", "error");
      }
    }
  };

  const handleEdit = (row: Penugasan) => {
    navigate(`/edit-penugasan/${row.id}`);
  };

  // TABLE COLUMNS
  const columns: Column<Penugasan>[] = [
    {
      header: "No",
      accessor: "id",
      width: "60px",
      cell: (_, idx) => idx + 1,
    },
    { header: "Nomor Penugasan", accessor: "nomor_penugasan" },
    {
    header: "Tanggal",
    accessor: "created_at",
    cell: (row) => new Date(row.created_at).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }),
    },
    {
      header: "Nama Pegawai",
      accessor: "pegawai",
      cell: (row) => row.pegawai?.name || "-",
    },
    { header: "Judul Pekerjaan", accessor: "judul_pekerjaan" },
    { header: "Rincian Pekerjaan", accessor: "rincian_pekerjaan" },

    {
      header: "Status",
      accessor: "status",
      cell: (row) => {
  const colors: Record<string, string> = {
    finish: "#a3d88d",
    process: "#c7defe",
    pending: "#ffecb1",
  };

  const textColor = "#000";

  return (
    <span
      style={{
        backgroundColor: colors[row.status] || "#ccc",
        color: textColor,
        padding: "6px 12px",
        borderRadius: "8px",
        fontWeight: 500,
        textTransform: "capitalize",
      }}
    >
      {row.status}
    </span>
  );
},
},
    {
      header: "Actions",
      width: "150px",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
            title="Edit"
          >
            <Pencil size={16} />
          </button>

          <button
            onClick={() => handleDelete(row.id)}
            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
            title="Hapus"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  // FINAL FILTER
  const filteredAssignments = assignments.filter((t) => {
    const name = (t.pegawai?.name ?? "").toLowerCase();
    const pegawaiMatch = name.includes(pegawaiSearch.toLowerCase());

    const tanggal = new Date(t.created_at);
    const dateMatch =
      (!startDate || tanggal >= startDate) &&
      (!endDate || tanggal <= endDate);

    const companyMatch =
      !selectedCompany || String(t.pegawai?.company_id) === selectedCompany;

    return pegawaiMatch && dateMatch && companyMatch;
  });

  // CUSTOM DATE INPUT
  const CustomInput = ({ value, onClick }: any) => (
    <button
      onClick={onClick}
      className="border px-3 py-2 rounded-lg w-40 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 hover:border-blue-500 transition-all"
    >
      {value || "Pilih tanggal"}
    </button>
  );

  // USER INTERFACE
  return (
    <>
      <PageMeta title="Penugasan" description="Daftar Penugasan" />
      <PageHeader
        pageTitle="Penugasan"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <div className="flex gap-2">
            <button
              onClick={exportExcel}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2 rounded-xl"
            >
              📄 Export
            </button>

            <button
              onClick={() => navigate("/add-penugasan")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-xl"
            >
              + Tambah
            </button>
          </div>
        }
      />

      <div className="space-y-5 mt-4">
        <ComponentCard className="dark:bg-gray-800 dark:border-gray-700 p-0">
          {loading ? (
            <p className="text-gray-700 dark:text-gray-300">Loading...</p>
          ) : (
            <div className="datatable-no-search">
              {/* FILTER */}
              <div className="w-full bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border border-gray-300 dark:border-gray-700 mb-4">
                <div className="flex flex-wrap justify-between gap-6 items-center">
                  {/* LEFT */}
                  <div className="flex flex-wrap gap-4">
                    {/* SEARCH PEGAWAI */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium mb-1 dark:text-white">
                        Cari Pegawai
                      </label>

                      <div className="border px-3 py-2 rounded-lg w-72 h-[39px] bg-white dark:bg-gray-700 dark:text-white flex items-center">
                        <input
                          type="text"
                          placeholder="Cari nama pegawai..."
                          value={pegawaiSearch}
                          onChange={(e) => setPegawaiSearch(e.target.value)}
                          className="w-full bg-transparent focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* COMPANY */}
                    {dashboardType === "superadmin" && (
                      <div className="flex flex-col">
                        <label className="text-gray-700 dark:text-gray-200">Company</label>
                        <select
                          value={selectedCompany}
                          onChange={(e) => setSelectedCompany(e.target.value)}
                          className="px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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

                  {/* RIGHT */}
                  <div className="flex flex-wrap gap-4 items-end">
                    {/* TGL MULAI */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium mb-1 dark:text-white">
                        Tanggal Mulai
                      </label>
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        dateFormat="yyyy-MM-dd"
                        customInput={<CustomInput />}
                      />
                    </div>

                    {/* TGL AKHIR */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium mb-1 dark:text-white">
                        Tanggal Akhir
                      </label>
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
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
              overflow-x-auto
              [&_tr:hover]:bg-white [&_tr:hover]:text-gray-900
              dark:[&_tr:hover]:bg-gray-800 dark:[&_tr:hover]:text-gray-100
              [&_input]:bg-white [&_input]:text-gray-900 [&_input::placeholder]:text-gray-400
              dark:[&_input]:bg-gray-800 dark:[&_input]:text-gray-100 dark:[&_input::placeholder]:text-gray-400
              dark:[&_table]:bg-gray-900 dark:[&_table]:text-gray-100
              dark:[&_thead]:bg-gray-800
              dark:[&_th]:bg-gray-800 dark:[&_th]:text-gray-100
              dark:[&_tr]:border-gray-700 dark:[&_td]:border-gray-700
              [&_tr]:transition-colors
            "
            >
                <DataTable
                  columns={columns}
                  data={filteredAssignments}
                  disableSearch
                />
              </div>
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
