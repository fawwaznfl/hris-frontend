import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import { DataTable, Column } from "../../components/common/DataTable";
import api from "../../api/axios";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";

// Interface Laporan Kerja
interface LaporanKerja {
  id: number;
  pegawai_id: number;
  tanggal_laporan: string;
  pegawai?: {
    id: number;
    name: string;
  };
  tanggal: string;
  informasi_umum: string;
  pekerjaan_yang_dilaksanakan: string;
  pekerjaan_belum_selesai: string;
  jam_mulai: string;
  jam_selesai: string;
  catatan: string;
  company_id?: number;
}

export default function LaporanKerjaPage() {
  const dashboardType = localStorage.getItem("dashboard_type");
  const [data, setData] = useState<LaporanKerja[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string | number>("all");
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);

  const navigate = useNavigate();

  // GET DATA
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const company_id = localStorage.getItem("company_id");

      const res = await api.get("/laporan-kerja", {
        headers: { Authorization: `Bearer ${token}` },
        params:
          dashboardType === "superadmin"
            ? {} 
            : { company_id }, 
      });

      setData(res.data.data);
    } catch (err) {
      console.error("Error fetching laporan kerja:", err);
    } finally {
      setLoading(false);
    }
  };


  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCompanies(res.data.data);
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  useEffect(() => {
    fetchData();

    if (dashboardType === "superadmin") {
      fetchCompanies();
    }
  }, []);


  // DELETE
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data ini tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/laporan-kerja/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setData(data.filter((d) => d.id !== id));
      Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", "Terjadi kesalahan saat menghapus data.", "error");
    }
  };

  // EDIT
  const handleEdit = (row: LaporanKerja) => {
    navigate(`/edit-laporan-kerja/${row.id}`);
  };

  // COLUMNS
  const columns: Column<LaporanKerja>[] = [
    {
      header: "No",
      accessor: "id",
      width: "60px",
      cell: (_, index) => index + 1,
    },
    {
      header: "Nama Pegawai",
      accessor: "pegawai",
      cell: (row) => row.pegawai?.name || "-",
    },
    {
      header: "Tanggal",
      accessor: "tanggal_laporan",
    },
    {
      header: "Informasi umum",
      accessor: "informasi_umum",
    },
    {
      header: "Pekerjaan Yang Dilaksanakan",
      accessor: "pekerjaan_yang_dilaksanakan",
    },
    {
      header: "Pekerjaan Belum Selesai",
      accessor: "pekerjaan_belum_selesai",
    },
    {
      header: "Catatan",
      accessor: "catatan",
      cell: (row) => row.catatan || "-",
    },
  ];

  // FILTERING
  const filteredData = data
    .filter((d) =>
      d.pegawai?.name.toLowerCase().includes(localSearch.toLowerCase())
    )
    .filter((d) =>
      dashboardType === "superadmin"
        ? selectedCompany === "all"
          ? true
          : d.company_id === selectedCompany
        : true
    );

  // USER INTERFACE
  return (
    <>
      <PageMeta title="Laporan Kerja" description="Daftar Laporan Kerja Pegawai" />

      <PageHeader
        pageTitle="Laporan Kerja Pegawai"
        titleClass="text-[32px] dark:text-white"
      />

      <div className="space-y-5 sm:space-y-6">
        <ComponentCard className="dark:bg-gray-800 dark:border-gray-700">
          {/* FILTER */}
          <div className="w-full bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border border-gray-300 dark:border-gray-700 mb-4">
            <div className="flex flex-wrap gap-6 items-end">

              {/* Search */}
              <div className="flex flex-col w-72">
                <label className="text-sm font-medium mb-1 text-gray-900 dark:text-white">
                  Cari Pegawai
                </label>
                <input
                  type="text"
                  placeholder="Cari nama pegawai..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="border px-3 py-2 rounded-lg w-72 bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* FILTER COMPANY (HANYA SUPERADMIN) */}
              {dashboardType === "superadmin" && (
                <div className="flex flex-col w-72">
                  <label className="text-sm font-medium mb-1 text-gray-900 dark:text-white">
                    Company
                  </label>
                  <select
                    value={selectedCompany}
                    onChange={(e) =>
                      setSelectedCompany(
                        e.target.value === "all" ? "all" : Number(e.target.value)
                      )
                    }
                    className="border px-3 py-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">Semua Company</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* TABEL */}
          {loading ? (
            <p className="text-gray-700 dark:text-gray-300">Loading...</p>
          ) : (
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
          )}
        </ComponentCard>
      </div>
    </>
  );
}
