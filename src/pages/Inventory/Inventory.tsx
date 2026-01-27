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

interface Inventory {
  id: number;
  kode_barang: string;
  nama_barang: string;
  stok: number;
  satuan: string;
  keterangan?: string;

  lokasi?: {
    id: number;
    nama_lokasi: string;
  };

  divisi?: {
    id: number;
    nama: string;
  };

  jabatan?: {
    id: number;
    nama_jabatan: string;
  };

  company_id?: number;
}

export default function InventoryPage() {
  const { searchTerm } = useSearch();
  const [list, setList] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [localSearch, setLocalSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string | number>("all");
  const dashboardType = localStorage.getItem("dashboard_type");
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);

  // Fetch inventory
  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("token");
      const company_id = localStorage.getItem("company_id");

      const res = await api.get("/inventory", {
        headers: { Authorization: `Bearer ${token}` },
        params: { company_id },
      });

      setList(res.data.data);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch companies
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
    fetchInventory();
    
    if (localStorage.getItem("dashboard_type") === "superadmin") {
      fetchCompanies();
    }
  }, []);

  // DELETE
  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Hapus data?",
      text: "Data tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem("token");

        await api.delete(`/inventory/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setList(list.filter((item) => item.id !== id));

        Swal.fire("Dihapus", "Data berhasil dihapus", "success");
      } catch (err) {
        Swal.fire("Gagal", "Terjadi kesalahan", "error");
      }
    }
  };

  // EDIT
  const handleEdit = (row: Inventory) => {
    navigate(`/edit-inventory/${row.id}`);
  };

  // Columns
  const columns: Column<Inventory>[] = [
    {
      header: "No",
      accessor: "id",
      cell: (_, index) => index + 1,
      width: "60px",
    },
    { header: "Kode Barang", accessor: "kode_barang" },
    { header: "Nama Barang", accessor: "nama_barang" },
    { header: "Stok", accessor: "stok" },
    { header: "Satuan", accessor: "satuan" },
    { header: "Keterangan", accessor: "keterangan" },
    {
      header: "Lokasi",
      accessor: "lokasi",
      cell: (row) => row.lokasi?.nama_lokasi || "-",
    },
    {
      header: "Divisi",
      accessor: "divisi",
      cell: (row) =>
        `${row.divisi?.nama || "-"}`,
    },
    {
      header: "Action",
      width: "150px",
      cell: (row: Inventory) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Edit size={18} />
          </button>

          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash size={18} />
          </button>
        </div>
      ),
    },
  ];

  // Filter + Search
  const filteredData = list
    .filter((item) =>
      item.nama_barang.toLowerCase().includes(localSearch.toLowerCase()) ||
      item.kode_barang.toLowerCase().includes(localSearch.toLowerCase())
    )
    .filter((item) =>
      selectedCompany === "all"
        ? true
        : item.company_id === Number(selectedCompany)
    );

  return (
    <>
      <PageMeta title="Inventory" description="Data Inventory" />

      <PageHeader
        pageTitle="Inventory"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <button
            onClick={() => navigate("/add-inventory")}
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
                  Cari Barang
                </label>
                <input
                  type="text"
                  placeholder="Cari kode / nama..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="border px-3 py-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Filter Company */}
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
          </div>

          {/* TABLE */}
          {loading ? (
            <p className="dark:text-white">Loading...</p>
          ) : (
            <div
                className="
                  overflow-x-auto [&_tr:hover]:bg-gray-100 [&_tr:hover]:text-gray-900
                  dark:[&_tr:hover]:bg-gray-700 dark:[&_tr:hover]:text-gray-50
                  dark:[&_table]:bg-gray-900 dark:[&_table]:text-gray-300 [&_th]:bg-gray-200 [&_th]:text-gray-800
                  dark:[&_th]:bg-gray-800 dark:[&_th]:text-gray-300 [&_td]:text-gray-800
                  dark:[&_td]:text-gray-200"
              >
              <DataTable columns={columns} data={filteredData} disableSearch />
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}