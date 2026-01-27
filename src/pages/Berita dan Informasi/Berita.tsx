import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import { DataTable, Column } from "../../components/common/DataTable";
import { useSearch } from "../../SearchContext";
import api from "../../api/axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Edit, Trash } from "lucide-react";

interface Berita {
  id: number;
  tipe: string;
  judul: string;
  isi_konten: string;
  gambar?: string;
  company_id?: number;
  created_at?: string;
}

export default function BeritaPage() {
  const { searchTerm } = useSearch();
  const [beritaList, setBeritaList] = useState<Berita[]>([]);
  const [loading, setLoading] = useState(true);

  const dashboardType = localStorage.getItem("dashboard_type");
  const [localSearch, setLocalSearch] = useState("");
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | number>("all");

  const navigate = useNavigate();

  const getImageUrl = (path?: string) => {
    if (!path) return "/default-image.png";
    return `http://localhost:8000/storage/${path}`;
  };

  const fetchBerita = async () => {
    try {
      const token = localStorage.getItem("token");
      const companyId = localStorage.getItem("company_id");

      const params =
        dashboardType === "superadmin"
          ? {}
          : { company_id: companyId };

      const res = await api.get("/berita", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setBeritaList(res.data.data || []);
    } catch (err) {
      console.error("Error fetching berita:", err);
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
      setCompanies(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  useEffect(() => {
    fetchBerita();
    
    if (localStorage.getItem("dashboard_type") === "superadmin") {
      fetchCompanies();
    }
  }, []);

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Hapus Berita?",
      text: "Data ini tidak bisa dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/berita/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBeritaList((prev) => prev.filter((b) => b.id !== id));

      Swal.fire("Terhapus", "Berita berhasil dihapus", "success");
    } catch (err) {
      Swal.fire("Gagal", "Terjadi kesalahan saat menghapus.", "error");
    }
  };

  const handleEdit = (row: Berita) => {
    navigate(`/edit-berita/${row.id}`);
  };

  const columns: Column<Berita>[] = [
    {
      header: "No",
      accessor: "id",
      width: "60px",
      cell: (_, index) => index + 1,
    },
    {
      header: "Tipe",
      accessor: "tipe",
      width: "120px",
      cell: (row) => (
        <span className="px-2 py-1 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 dark:text-white">
          {row.tipe}
        </span>
      ),
    },
    {
      header: "Judul",
      accessor: "judul",
    },
    {
      header: "Isi Konten",
      accessor: "isi_konten",
      cell: (row) => (
        <p className="line-clamp-2 text-gray-700 dark:text-gray-300">
          {row.isi_konten}
        </p>
      ),
    },
    {
    header: "Gambar",
    accessor: "gambar",
    width: "120px",
    cell: (row) =>
        row.gambar ? (
        <img
            src={getImageUrl(row.gambar)}
            alt="gambar"
            className="w-16 h-16 object-cover rounded-lg border dark:border-gray-700"
        />
        ) : (
        <span className="text-gray-400">-</span>
        ),
    },
    {
      header: "Actions",
      width: "140px",
      cell: (row) => (
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

  const filteredList = beritaList
    .filter((b) =>
      b.judul.toLowerCase().includes(localSearch.toLowerCase())
    )
    .filter((b) =>
      selectedCompany === "all" ? true : Number(b.company_id) === Number(selectedCompany)
    );

    // USER INTERFACE
  return (
    <>
      <PageMeta title="Berita" description="Daftar Berita" />
      <PageHeader
        pageTitle="Berita"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <button
            onClick={() => navigate("/add-berita")}
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
                <label className="text-sm font-medium mb-1 text-gray-900 dark:text-white">
                  Cari Judul
                </label>
                <input
                  type="text"
                  placeholder="Cari judul berita..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="border px-3 py-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Company filter */}
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

          {/* TABLE */}
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
              <DataTable columns={columns} data={filteredList} disableSearch />
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
