import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import { DataTable, Column } from "../../components/common/DataTable";
import { useSearch } from "../../SearchContext";
import api from "../../api/axios";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { Edit, Trash } from "lucide-react";

// Interface Shift
interface Shift {
  id: number;
  nama: string;
  jam_masuk: string;
  jam_pulang: string;
  created_at?: string;
  company_id?: number;
}

export default function Shift() {
  const { searchTerm } = useSearch();
  const [shiftList, setShiftList] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [localSearch, setLocalSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string | number>("all");
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const dashboardType = localStorage.getItem("dashboard_type");



  // Get shifts
  const fetchShifts = async () => {
    try {
      const token = localStorage.getItem("token");
      const company_id = localStorage.getItem("company_id");
      const res = await api.get("/shifts", {
        headers: { Authorization: `Bearer ${token}` },
        params: { company_id },
      });

      setShiftList(res.data.data);
    } catch (err) {
      console.error("Error fetching shifts:", err);
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
    if (companies.length === 0) return;

    setShiftList((prev) =>
      prev.map((s) => ({
        ...s,
        company_name: companies.find((c) => c.id === s.company_id)?.name || "-",
      }))
    );
  }, [companies]);


  useEffect(() => {
  fetchShifts();

  if (localStorage.getItem("dashboard_type") === "superadmin") {
    fetchCompanies();
  }
}, []);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Shift yang dihapus tidak bisa dikembalikan!",
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
        await api.delete(`/shifts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setShiftList(shiftList.filter((s) => s.id !== id));

        Swal.fire("Terhapus!", "Shift berhasil dihapus.", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Gagal", "Terjadi kesalahan saat menghapus shift.", "error");
      }
    }
  };

  const handleEdit = (shift: Shift) => {
    navigate(`/edit-shift/${shift.id}`);
  };

  const columns: Column<Shift>[] = [
    {
      header: "No",
      accessor: "id",
      cell: (_, index) => index + 1,
      width: "60px",
    },
    { header: "Nama Shift", accessor: "nama" },
    {
      header: "Jam Masuk",
      accessor: "jam_masuk",
      cell: (row) => row.jam_masuk.substring(0, 5).replace(":", "."),
    },
    {
      header: "Jam Pulang",
      accessor: "jam_pulang",
      cell: (row) => row.jam_pulang.substring(0, 5).replace(":", "."),
    },
    {
      header: "Actions",
      cell: (row: Shift) => (
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
      width: "150px",
    },
  ];

  // Search
  const filteredShifts = shiftList
  .filter((s) =>
    s.nama.toLowerCase().includes(localSearch.toLowerCase())
  )
  .filter((s) =>
    selectedCompany === "all" ? true : s.company_id === selectedCompany
  );


  // USER INTERFACE
  return (
    <>
      <PageMeta title="Shift" description="Daftar Shift" />
      <PageHeader
        pageTitle="Shift"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/add-shift")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-xl"
            >
              + Tambah
            </button>
          </div>
        }
      />

      <div className="space-y-5 sm:space-y-6">
        <ComponentCard className="dark:bg-gray-800 dark:border-gray-700">
          {/* FILTER SECTION */}
          <div className="w-full bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border border-gray-300 dark:border-gray-700 mb-4">
            <div className="flex flex-wrap gap-6 items-end">
              {/* Search Divisi */}
              <div className="flex flex-col w-72">
                <label className="text-sm font-medium mb-1 text-gray-900 dark:text-white">
                  Cari Divisi
                </label>
                <input
                  type="text"
                  placeholder="Cari divisi..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="border px-3 py-2 rounded-lg w-72 bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Filter Company */}
              {dashboardType === "superadmin" && (
              <div className="flex flex-col">
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
              <DataTable
                columns={columns}
                data={filteredShifts}
                disableSearch
              />
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
