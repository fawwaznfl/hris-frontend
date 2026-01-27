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

// Interface Role
interface Role {
  id: number;
  nama: string;
  guard_name?: string;
  created_at?: string;
  company_id?: number;
}

export default function RolePage() {
  const { searchTerm } = useSearch();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string | number>("all");
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const dashboardType = localStorage.getItem("dashboard_type");


  const navigate = useNavigate();

  // GET ROLES
  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("token");
      const dashboardType = localStorage.getItem("dashboard_type");
      const userCompanyId = localStorage.getItem("company_id");

      const params: any = {};

      // superadmin boleh filter
      if (dashboardType === "superadmin") {
        if (selectedCompany !== "all") {
          params.company_id = selectedCompany;
        }
      }

      // admin tidak perlu set apa² → backend otomatis filter

      const res = await api.get("/roles", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setRoles(res.data.data);
    } catch (err) {
      console.error("Error fetching roles:", err);
    } finally {
      setLoading(false);
    }
  };


  // GET COMPANIES
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

  useEffect(() => {
    fetchRoles();
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (dashboardType === "superadmin") {
      fetchRoles();
    }
  }, [selectedCompany]);


  // DELETE
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Role yang dihapus tidak bisa dikembalikan!",
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
        await api.delete(`/roles/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setRoles(roles.filter((r) => r.id !== id));

        Swal.fire("Terhapus!", "Role berhasil dihapus.", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Gagal", "Terjadi kesalahan saat menghapus role.", "error");
      }
    }
  };

  // EDIT
  const handleEdit = (role: Role) => {
    navigate(`/edit-role/${role.id}`);
  };

  // COLUMNS DATATABLE
  const columns: Column<Role>[] = [
    {
      header: "No",
      accessor: "id",
      cell: (_, index) => index + 1,
      width: "60px",
    },
    { header: "Nama Role", accessor: "nama" },
    {
      header: "Guard",
      accessor: "guard_name",
      cell: () => "web",
    },
    {
      header: "Actions",
      cell: (row: Role) => (
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

  // FILTERING
  const filteredRoles = roles
    .filter((r) =>
      r.nama.toLowerCase().includes(localSearch.toLowerCase())
    )
    .filter((r) =>
      selectedCompany === "all" ? true : r.company_id === selectedCompany
    );

  return (
    <>
      <PageMeta title="Role" description="Role" />
      <PageHeader
        pageTitle="Role"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <button
            onClick={() => navigate("/add-role")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-xl"
          >
            + Tambah
          </button>
        }
      />

      <div className="space-y-5 sm:space-y-6">
        <ComponentCard className="dark:bg-gray-800 dark:border-gray-700">

          {/* FILTER SECTION */}
          <div className="w-full bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border border-gray-300 dark:border-gray-700 mb-4">
            <div className="flex flex-wrap gap-6 items-end">

              {/* Search Nama Role */}
              <div className="flex flex-col w-72">
                <label className="text-sm font-medium mb-1 text-gray-900 dark:text-white">
                  Cari Role
                </label>
                <input
                  type="text"
                  placeholder="Cari role..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="border px-3 py-2 rounded-lg w-72 bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              {/* Filter Company - hanya superadmin */}
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
                dark:[&_table]:bg-gray-900 dark:[&_table]:text-gray-100
                dark:[&_thead]:bg-gray-800 dark:[&_th]:bg-gray-800 dark:[&_th]:text-gray-100"
            >
              <DataTable columns={columns} data={filteredRoles} disableSearch />
            </div>
          )}

        </ComponentCard>
      </div>
    </>
  );
}
