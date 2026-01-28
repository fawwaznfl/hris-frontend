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
import { Download, Eye } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Pencil, Trash2 } from "lucide-react";

interface Kontrak {
  id: number;
  jenis_kontrak: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  keterangan?: string;
  file_kontrak?: string;
  pegawai?: {
    id: number;
    name: string;
     company_id?: number;
  };
}

export default function Kontrak() {
  const { searchTerm } = useSearch();
  const [kontraks, setKontraks] = useState<Kontrak[]>([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [pegawaiSearch, setPegawaiSearch] = useState("");
  const dashboardType = localStorage.getItem("dashboard_type");

  const exportExcel = () => {
  // Format data biar rapi di Excel
  const excelData = kontraks.map((k) => ({
    "Nama Pegawai": k.pegawai?.name || "-",
    "Jenis Kontrak": k.jenis_kontrak,
    "Tanggal Mulai": k.tanggal_mulai,
    "Tanggal Selesai": k.tanggal_selesai,
    "Keterangan": k.keterangan || "-",
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Kontrak");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const file = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(file, `Data_Kontrak_${new Date().toISOString().split("T")[0]}.xlsx`);
};

  // FIX DatePicker state
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const navigate = useNavigate();

  // Custom Input For Datepicker
  const CustomInput = ({ value, onClick }: any) => (
    <button
      onClick={onClick}
      className="
      border px-3 py-2 rounded-lg w-40 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 hover:border-blue-500 transition-all focus:outline-none"
    >
      {value || "Pilih tanggal"}
    </button>
  );

  const fetchCompanies = async () => {
    if (dashboardType !== "superadmin") {
      setCompanies([]); // kosongkan (admin tidak butuh)
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(res.data.data) ? res.data.data : [];
      setCompanies(data);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setCompanies([]);
    }
  };

  const fetchKontraks = async () => {
    try {
      const token = localStorage.getItem("token");
      const userCompany = localStorage.getItem("company_id");

      const res = await api.get("/kontrak", {
        headers: { Authorization: `Bearer ${token}` },
        params: dashboardType === "admin" ? { company_id: userCompany } : {},
      });

      setKontraks(res.data.data);
    } catch (err) {
      console.error("Error fetching kontraks:", err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (dashboardType === "superadmin") {
      fetchCompanies();
    }
    fetchKontraks();
  }, []);


  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Kontrak yang dihapus tidak bisa dikembalikan!",
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
        await api.delete(`/kontrak/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setKontraks(kontraks.filter((k) => k.id !== id));
        Swal.fire("Terhapus!", "Kontrak berhasil dihapus.", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Gagal", "Terjadi kesalahan saat menghapus kontrak.", "error");
      }
    }
  };

  const handleEdit = (kontrak: Kontrak) => {
    navigate(`/edit-kontrak/${kontrak.id}`);
  };

  const columns: Column<Kontrak>[] = [
    { header: "No", accessor: "id", cell: (_, index) => index + 1, width: "60px" },
    { header: "Nama Pegawai", accessor: "pegawai", cell: (row) => row.pegawai?.name || "-" },
    { header: "Jenis Kontrak", accessor: "jenis_kontrak" },
    { header: "Tanggal Mulai", accessor: "tanggal_mulai" },
    { header: "Tanggal Selesai", accessor: "tanggal_selesai" },
    { header: "Keterangan", accessor: "keterangan", cell: (row) => row.keterangan || "-" },

    {
      header: "File",
      accessor: "file_kontrak",
      cell: (row) =>
        row.file_kontrak ? (
          <div className="flex gap-2">
            <button
              onClick={() => window.open(`${row.file_kontrak}`, "_blank")}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded flex items-center justify-center"
            >
              <Eye size={16} />
            </button>

            <button
              onClick={() => {
                const link = document.createElement("a");
                link.href = `${row.file_kontrak}`;
                link.download = `Kontrak-${row.pegawai?.name ?? row.id}.pdf`;
                document.body.appendChild(link);
                link.click();
                link.remove();
              }}
              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded flex items-center justify-center"
            >
              <Download size={16} />
            </button>
          </div>
        ) : (
          "-"
        ),
    },

    {
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg flex items-center justify-center"
            title="Edit"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg flex items-center justify-center"
            title="Hapus"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      width: "150px",
    },
  ];

  // FILTER NAME + DATE
  const filteredKontraks = kontraks.filter((k) => {
    const name = (k.pegawai?.name ?? "").toLowerCase();
    
    const pegawaiMatch = name.includes(pegawaiSearch.toLowerCase());
    const nameMatch = (k.pegawai?.name ?? "")

    const mulai = new Date(k.tanggal_mulai);
    const selesai = new Date(k.tanggal_selesai);

    const dateMatch =
        (!startDate || selesai >= startDate) &&
        (!endDate || mulai <= endDate);

    const companyMatch =
      !selectedCompany || String(k.pegawai?.company_id) === selectedCompany;

      return pegawaiMatch && nameMatch && dateMatch && companyMatch;
    });

  return (
    <>
      <PageMeta title="Kontrak" description="Daftar Kontrak" />
      <PageHeader
        pageTitle="Kontrak"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={exportExcel}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2 rounded-xl">
                📄 Export
            </button>
            <button
              onClick={() => navigate("/add-kontrak")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-xl"
            >
              + Tambah
            </button>
          </div>
        }
      />

      <div className="space-y-5 sm:space-y-6 mt-4">
        <ComponentCard className="dark:bg-gray-800 dark:border-gray-700 p-0" >
          {loading ? (
            <p className="text-gray-700 dark:text-gray-300">Loading...</p>
          ) : (
            <div className="datatable-no-search">
              {/* =============================
                  FILTER SECTION (Rounded Box)
              ============================== */}
              <div className="w-full bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border border-gray-300 dark:border-gray-700 mb-4">
                <div className="flex flex-wrap justify-between gap-6 items-center">
                  {/* === KIRI: SEARCH PEGAWAI + COMPANY === */}
                  <div className="flex flex-wrap gap-4">

                    {/* SEARCH PEGAWAI */}
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                        Cari Pegawai
                      </label>

                      <div className="border px-3 py-2 rounded-lg w-72 h-[39px] bg-white dark:bg-gray-700 dark:text-white flex items-center">
                      <input
                        type="text"
                        placeholder="Cari nama pegawai..."
                        value={pegawaiSearch}
                        onChange={(e) => setPegawaiSearch(e.target.value)}
                        className="w-full bg-transparent focus:outline-none text-gray-900 dark:text-white"
                      />
                    </div>
                    </div>
                    {/* COMPANY - hanya muncul untuk superadmin */}
                    {dashboardType === "superadmin" && (
                      <div className="flex flex-col">
                        <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                          Company
                        </label>
                        <select
                          className="border px-3 py-2 rounded-lg w-72 bg-white dark:bg-gray-700 dark:text-white"
                          value={selectedCompany}
                          onChange={(e) => setSelectedCompany(e.target.value)}
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

                  {/* === KANAN: TANGGAL === */}
                  <div className="flex flex-wrap gap-4 items-end">

                    <div className="flex flex-col">
                      <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                        Tanggal Mulai
                      </label>
                      <DatePicker
                        selected={startDate}
                        onChange={(date: Date | null) => setStartDate(date)}
                        dateFormat="yyyy-MM-dd"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        customInput={<CustomInput />}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                        Tanggal Akhir
                      </label>
                      <DatePicker
                        selected={endDate}
                        onChange={(date: Date | null) => setEndDate(date)}
                        dateFormat="yyyy-MM-dd"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
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
                <DataTable columns={columns} data={filteredKontraks} disableSearch />
              </div>
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}

