import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import { DataTable, Column } from "../../components/common/DataTable";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Pencil, Trash2 } from "lucide-react";

interface Lokasi {
  id: number;
  company_id: number;
  nama_lokasi: string;
  lat_kantor: string;
  long_kantor: string;
  radius: number;
  keterangan: string;
  status: string;
  company_name?: string;
}

interface Company {
  id: number;
  name: string;
}

export default function LokasiPage() {
  const [lokasis, setLokasis] = useState<Lokasi[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<number | "all">("all");
  const [localSearch, setLocalSearch] = useState("");
  const dashboardType = localStorage.getItem("dashboard_type");
  const userCompanyId = localStorage.getItem("user_company_id");
  const navigate = useNavigate();

  // Fetch Companies
  const fetchCompanies = async () => {
    const token = localStorage.getItem("token");
    const res = await api.get("/companies", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCompanies(res.data.data);
  };

  // Fetch Lokasi
  const fetchLokasis = async () => {
    try {
      const token = localStorage.getItem("token");

      // SUPERADMIN → ambil semua data
      if (dashboardType === "superadmin") {
        const res = await api.get("/lokasis", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLokasis(res.data.data);
      }

      else {
        const res = await api.get(`/lokasis?company_id=${userCompanyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLokasis(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching lokasi:", err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchLokasis();
    
    if (localStorage.getItem("dashboard_type") === "superadmin") {
      fetchCompanies();
    }
  }, []);

  useEffect(() => {
    if (companies.length === 0) return;

    setLokasis((prev) =>
      prev.map((l) => ({
        ...l,
        company_name: companies.find((c) => c.id === l.company_id)?.name || "-",
      }))
    );
  }, [companies]);

  // DELETE
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Hapus Lokasi?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
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
        await api.delete(`/lokasis/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setLokasis(lokasis.filter((l) => l.id !== id));

        Swal.fire("Terhapus!", "Lokasi berhasil dihapus.", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Gagal", "Terjadi kesalahan saat menghapus lokasi.", "error");
      }
    }
  };

  // EDIT
  const handleEdit = (lokasi: Lokasi) => {
    navigate(`/edit-lokasi/${lokasi.id}`);
  };

  // Columns untuk tabel
  const columns: Column<Lokasi>[] = [
    {
      header: "No",
      accessor: "id",
      cell: (_, index) => index + 1,
      width: "60px",
    },
    { header: "Nama Lokasi", accessor: "nama_lokasi" },
    { header: "Latitude", accessor: "lat_kantor" },
    { header: "Longitude", accessor: "long_kantor" },
    { header: "Radius (m)", accessor: "radius" },
    {
        header: "Status",
        accessor: "status",
        cell: (row) => (
            <span
            className={`px-3 py-1 rounded-full text-white text-sm ${
                row.status === "active"
                ? "bg-green-600"
                : row.status === "inactive"
                ? "bg-red-600"
                : "bg-gray-500"
            }`}
            >
            {row.status === "active" ? "Active" : row.status === "inactive" ? "Inactive" : row.status}
            </span>
        ),
        },
    { header: "Keterangan", accessor: "keterangan" },
    {
      header: "Perusahaan",
      accessor: "company_name",
      cell: (row) => row.company_name || "-",
    },
    {
      header: "Actions",
      width: "120px",
      cell: (row: Lokasi) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded flex items-center justify-center"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded flex items-center justify-center"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  // Filter + Search
  const filteredLokasis = lokasis
    .filter((l) =>
      l.nama_lokasi.toLowerCase().includes(localSearch.toLowerCase())
    )
    .filter((l) =>
      selectedCompany === "all" ? true : l.company_id === selectedCompany
    );


    // USER INTERFACE
  return (
    <>
      <PageMeta title="Lokasi" description="Daftar lokasi kantor" />

      <PageHeader
        pageTitle="Lokasi"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <div className="flex items-center gap-3">
          <button
          onClick={() => navigate("/lokasi/pending")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-2 rounded-xl"
        >
          ⏱️ Pending Location
        </button>
          <button
            onClick={() => navigate("/add-lokasi")}
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
              {/* Search */}
              <div className="flex flex-col w-72">
                <label className="text-sm font-medium mb-1 text-gray-900 dark:text-white">
                  Cari Lokasi
                </label>
                <input
                  type="text"
                  placeholder="Cari lokasi..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="border px-3 py-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Filter Company */}
              {dashboardType === "superadmin" && (
                <div className="flex flex-col w-72">
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

          {/* TABLE */}
          {loading ? (
            <p className="text-gray-700 dark:text-gray-300">Loading...</p>
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
              <DataTable columns={columns} data={filteredLokasis} disableSearch />
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
