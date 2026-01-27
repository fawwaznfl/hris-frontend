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

interface KategoriReimbursement {
  id: number;
  company_id: number;
  nama: string;
  jumlah: number;
  company?: { name: string };
}

export default function KategoriReimbursement() {
  const { searchTerm } = useSearch();
  const [kategoriList, setKategoriList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState("");
  const dashboardType = localStorage.getItem("dashboard_type"); 
  const [selectedCompany, setSelectedCompany] = useState<string | number>("all");
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const navigate = useNavigate();

  // Fetch kategori
  const fetchKategori = async () => {
    try {
      const token = localStorage.getItem("token");
      const company_id = localStorage.getItem("company_id");
      let params: any = {};

      if (dashboardType !== "superadmin") {
        params.company_id = company_id;
      } else {
        if (selectedCompany !== "all") {
          params.company_id = selectedCompany;
        }
      }

      const res = await api.get("/kategori-reimbursement", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setKategoriList(res.data?.data ?? res.data ?? []);
    } catch (err) {
      console.error("Error fetching kategori:", err);
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
    fetchKategori();
    
    if (localStorage.getItem("dashboard_type") === "superadmin") {
      fetchCompanies();
    }
  }, []);

  useEffect(() => {
    if (dashboardType === "superadmin") {
      fetchKategori();
    }
  }, [selectedCompany]);

  // DELETE kategori
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Hapus Kategori?",
      text: "Data tidak bisa dikembalikan setelah dihapus.",
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

      await api.delete(`/kategori-reimbursement/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setKategoriList(kategoriList.filter((k) => k.id !== id));

      Swal.fire("Berhasil", "Kategori berhasil dihapus.", "success");
    } catch (err) {
      Swal.fire("Gagal", "Terjadi kesalahan saat menghapus.", "error");
    }
  };

  // EDIT
  const handleEdit = (item: KategoriReimbursement) => {
    navigate(`/edit-kategori-reimbursement/${item.id}`);
  };

  // Format Rupiah
  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);

  // TABLE COLUMNS
  const columns: Column<KategoriReimbursement>[] = [
    {
      header: "No",
      accessor: "id",
      cell: (_, index) => index + 1,
      width: "60px",
    },
    {
      header: "Nama Kategori",
      accessor: "nama",
    },
    {
      header: "Jumlah Maksimal",
      accessor: "jumlah",
      cell: (row) => formatRupiah(row.jumlah),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          {/* Edit */}
          <button
            onClick={() => handleEdit(row)}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Edit size={18} />
          </button>

          {/* Delete */}
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white"
          >
            <Trash size={18} />
          </button>
        </div>
      ),
      width: "160px",
    },
  ];

  // SEARCH + FILTER
  const filteredData = kategoriList
    .filter((k) =>
      k.nama.toLowerCase().includes(localSearch.toLowerCase())
    )
    .filter((k) =>
      selectedCompany === "all" ? true : k.company_id === selectedCompany
    );

    // USER INTERFACE
  return (
    <>
      <PageMeta title="Kategori Reimbursement" description="Daftar Kategori Reimbursement" />
      <PageHeader
        pageTitle="Kategori Reimbursement"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <button
            onClick={() => navigate("/add-kategori-reimbursement")}
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
              {/* SEARCH */}
              <div className="flex flex-col w-72">
                <label className="text-sm font-medium mb-1 text-gray-900 dark:text-white">
                  Cari Kategori
                </label>
                <input
                  type="text"
                  placeholder="Cari kategori..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="border px-3 py-2 rounded-lg w-72 bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* COMPANY FILTER */}
              {dashboardType === "superadmin" && (
                <div className="flex flex-col">
                  <label className="mb-1 dark:text-white">Company</label>
                  <select
                    value={selectedCompany}
                    onChange={(e) =>
                      setSelectedCompany(
                        e.target.value === "all" ? "all" : Number(e.target.value)
                      )
                    }
                    className="border px-3 py-2 rounded-lg w-72 dark:bg-gray-700 dark:text-white"
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
              <DataTable columns={columns} data={filteredData} disableSearch />
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
