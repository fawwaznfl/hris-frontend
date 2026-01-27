import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import { DataTable, Column } from "../../components/common/DataTable";
import { useSearch } from "../../SearchContext";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Edit, Trash } from "lucide-react";

// Interface Jenis Kinerja
interface JenisKinerja {
  id: number;
  nama: string;
  bobot_penilaian: number;
  detail?: string;
  company_id?: number;
}

export default function JenisKinerja() {
  const { searchTerm } = useSearch();
  const [list, setList] = useState<JenisKinerja[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [localSearch, setLocalSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string | number>("all");
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const dashboardType = localStorage.getItem("dashboard_type");

  // Fetch Jenis Kinerja
  const fetchKinerja = async () => {
    try {
      const token = localStorage.getItem("token");
      const company_id = localStorage.getItem("company_id");

      const res = await api.get("/jenis-kinerja", {
        headers: { Authorization: `Bearer ${token}` },
        params: { company_id },
      });

      setList(res.data.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Company
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
    fetchKinerja();
    fetchCompanies();
  }, []);

  // DELETE
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data tidak bisa dikembalikan!",
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
        await api.delete(`/jenis-kinerja/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setList(list.filter((item) => item.id !== id));

        Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Gagal", "Terjadi kesalahan saat menghapus.", "error");
      }
    }
  };

  // EDIT
  const handleEdit = (row: JenisKinerja) => {
    navigate(`/edit-jenis-kinerja/${row.id}`);
  };

  // Columns
  const columns: Column<JenisKinerja>[] = [
    {
      header: "No",
      accessor: "id",
      cell: (_, index) => index + 1,
      width: "60px",
    },
    { header: "Nama Jenis Kinerja", accessor: "nama" },
    {
      header: "Bobot Penilaian",
      accessor: "bobot_penilaian",
      cell: (row) => Number(row.bobot_penilaian),
    },
    { header: "Detail", accessor: "detail" },
    {
      header: "Actions",
      width: "150px",
      cell: (row: JenisKinerja) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            title="Edit"
          >
            <Edit size={18} />
          </button>

          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
            title="Hapus"
          >
            <Trash size={18} />
          </button>
        </div>
      ),
    },
  ];

  // Search + Company Filter
  const filteredData = list
    .filter((item) =>
      item.nama.toLowerCase().includes(localSearch.toLowerCase())
    )
    .filter((item) =>
      selectedCompany === "all"
        ? true
        : item.company_id === Number(selectedCompany)
    );

  return (
    <>
      <PageMeta title="Jenis Kinerja" description="Jenis Kinerja" />
      <PageHeader
        pageTitle="Jenis Kinerja"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <button
            onClick={() => navigate("/add-jenis-kinerja")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-xl"
          >
            + Tambah
          </button>
        }
      />

      <div className="space-y-5 sm:space-y-6">
        <ComponentCard className="dark:bg-gray-800 dark:border-gray-700">
          {/* FILTER */}
          <div className="w-full bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border border-gray-300 dark:border-gray-700 mb-4">
            <div className="flex flex-wrap gap-6 items-end">
              {/* Search */}
              <div className="flex flex-col w-72">
                <label className="text-sm font-medium mb-1 dark:text-white">
                  Cari Jenis Kinerja
                </label>
                <input
                  type="text"
                  placeholder="Cari..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="border px-3 py-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Filter Company */}
              {dashboardType === "superadmin" && (
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1 dark:text-white">
                    Company
                  </label>
                  <select
                    value={selectedCompany}
                    onChange={(e) =>
                      setSelectedCompany(
                        e.target.value === "all" ? "all" : Number(e.target.value)
                      )
                    }
                    className="border px-3 py-2 rounded-lg w-72 bg-white dark:bg-gray-700 dark:text-white"
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

          {/* TABLE */}
          {loading ? (
            <p className="dark:text-white">Loading...</p>
          ) : (
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
              <DataTable columns={columns} data={filteredData} disableSearch />
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
