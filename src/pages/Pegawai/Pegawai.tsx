import { useEffect, useState, ChangeEvent } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import { DataTable, Column } from "../../components/common/DataTable";
import { useSearch } from "../../SearchContext";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Edit, Trash, CheckCircle, XCircle, Clock, Briefcase, FileSignature, ScanFace} from "lucide-react";


interface Pegawai {
  id: number;
  name: string;
  username: string;
  email: string;
  telepon: string;
  foto_karyawan: string | null;
  divisi_id: number | null;
  divisi?: { nama: string } | null;
  lokasi_id: number | null;
  lokasi?: { nama_lokasi: string } | null;
  role_id: number | null;
  role?: { nama: string } | null;
  dashboard_type: string;
  status: string | null;
  company_id: number | null;
}

interface Company {
  id: number;
  name: string;
}

export default function Pegawais() {
  const { searchTerm } = useSearch();
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [filteredPegawai, setFilteredPegawai] = useState<Pegawai[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [localSearch, setLocalSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const dashboardType = localStorage.getItem("dashboard_type");
  const navigate = useNavigate();

  // Fetch companies
  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(res.data.data || []);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setCompanies([]);
    }
  };

  // Fetch pegawai
  const fetchPegawai = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/pegawais", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPegawaiList(res.data || []);
      setFilteredPegawai(res.data || []);
    } catch (err) {
      console.error("Error fetching pegawai:", err);
      setPegawaiList([]);
      setFilteredPegawai([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dashboardType === "superadmin") {
      fetchCompanies();
    }
    fetchPegawai();
  }, [dashboardType]);

  // Filter pegawai by company
  useEffect(() => {
    let filtered = pegawaiList;

    // filter by search text
    if (localSearch.trim() !== "") {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(localSearch.toLowerCase())
      );
    }

    // filter by selected company
    if (selectedCompany !== null) {
      filtered = filtered.filter((p) => p.company_id === selectedCompany);
    }

    setFilteredPegawai(filtered);
  }, [localSearch, selectedCompany, pegawaiList]);

  // DELETE
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Pegawai yang dihapus tidak bisa dikembalikan!",
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
        await api.delete(`/pegawais/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPegawaiList(pegawaiList.filter((p) => p.id !== id));
        Swal.fire("Terhapus!", "Pegawai berhasil dihapus.", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Gagal", "Terjadi kesalahan saat menghapus pegawai.", "error");
      }
    }
  };

  // EDIT
  const handleEdit = (pegawai: Pegawai) => {
    navigate(`/edit-pegawai/${pegawai.id}`);
  };

  // EXPORT CSV
  const handleExport = () => {
    if (filteredPegawai.length === 0) return;

    const headers = ["No", "Nama", "Username", "Email", "Telepon", "Divisi", "Lokasi", "Role", "Dashboard", "Status", "Company"];
    const rows = filteredPegawai.map((p, index) => [
      index + 1,
      p.name,
      p.username,
      p.email,
      p.telepon,
      p.divisi_id ?? "-",
      p.lokasi_id ?? "-",
      p.role_id ?? "-",
      p.dashboard_type,
      p.status ?? "-",
      companies.find((c) => c.id === p.company_id)?.name ?? "-",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((item) => `"${item}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "pegawai.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: Column<Pegawai>[] = [
    { header: "No", accessor: "id", cell: (_, index) => index + 1, width: "60px" },
    { header: "Nama", accessor: "name" },
    {
      header: "Foto",
      accessor: "foto_karyawan",
      cell: (row) => (
        <div className="flex flex-col items-center justify-center p-2">
          <div className="w-24 h-24 rounded-full overflow-hidden border">
            <img
            src={row.foto_karyawan ?? "/default-user.png"}
            className="w-full h-full object-cover"
          />
          </div>
        </div>
      ),
    },
    { header: "Username", accessor: "username" },
    {
      header: "Lokasi",
      accessor: "lokasi",
      cell: (row) => row.lokasi?.nama_lokasi ?? "-",
    },
    {
      header: "Divisi",
      accessor: "divisi",
      cell: (row) => row.divisi?.nama ?? "-",
    },

    {
      header: "Role",
      accessor: "role",
      cell: (row) => row.role?.nama ?? "-",
    },
    { header: "Dashboard", accessor: "dashboard_type" },
    {
      header: "Actions",
      cell: (row: Pegawai) => (
        <div className="flex gap-2">

          {/* INPUT SHIFT */}
          <button
            onClick={() => navigate(`/input-shift/${row.id}`)}
            className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
            title="Input Shift"
          >
            <Clock size={18} />
          </button>

          {/* DINAS LUAR */}
          <button
            onClick={() => navigate(`/input-dinas-luar/${row.id}`)}
            className="p-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white"
            title="Dinas Luar"
          >
            <Briefcase size={18} />
          </button>

          {/* KONTRAK KERJA */}
          <button
            onClick={() => navigate(`/kontrak-kerja/${row.id}`)}
            className="p-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white"
            title="Kontrak Kerja"
          >
            <FileSignature size={18} />
          </button>

          {/* EDIT */}
          <button
            onClick={() => handleEdit(row)}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            title="Edit"
          >
            <Edit size={18} />
          </button>

          {/* FACE RECOGNITION */}
          <button
            onClick={() => navigate(`/face-recognition/${row.id}`)}
            className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white"
            title="Face Recognition"
          >
            <ScanFace size={18} />
          </button>


          {/* DELETE */}
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
            title="Hapus"
          >
            <Trash size={18} />
          </button>
        </div>
      ),
      width: "240px",
    }
  ];

  return (
    <>
      <PageMeta title="Pegawai" description="Daftar Pegawai" />
      <PageHeader
        pageTitle="Daftar Pegawai"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2 rounded-xl flex items-center gap-2"
            >
              📄 Export
            </button>
          </div>
        }
      />

      <div className="!mt-0 !pt-0 !space-y-3">
        <ComponentCard className="dark:bg-gray-800 dark:border-gray-700 !pt-0 !pb-0 !mt-0 !border-t-0">
          <div className="w-full bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border border-gray-300 dark:border-gray-700 mb-4">
            <div className="flex flex-wrap gap-6 items-end">
              {/* Search Divisi */}
              <div className="flex flex-col w-72">
                <label className="text-sm font-medium mb-1 text-gray-900 dark:text-white">
                  Cari Pegawai
                </label>
                <input
                  type="text"
                  placeholder="Cari Pegawai..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="border px-3 py-2 rounded-lg w-72 bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              {dashboardType === "superadmin" && (
              <div className="flex flex-col w-64">
                <label className="text-sm font-medium mb-1 text-gray-900 dark:text-white">
                  Company
                </label>
                <select
                  value={selectedCompany ?? ""}
                  onChange={(e) =>
                    setSelectedCompany(e.target.value ? Number(e.target.value) : null)
                  }
                  className="border px-3 py-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
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
                data={filteredPegawai}
                disableSearch
              />
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
