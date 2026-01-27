import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import { DataTable, Column } from "../../components/common/DataTable";
import { useNavigate } from "react-router";
import { Edit, Trash, Download } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../api/axios";


interface Payroll {
  id: number;
  nomor_gaji: string;
  nama: string;
  divisi: string;
  keterangan: string;
  grand_total: number;
  company_id: number;
}

export default function Payroll() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState("");
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);

  const dashboardType = localStorage.getItem("dashboard_type");
  const [selectedCompany, setSelectedCompany] = useState<string | number>("all");
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      setLoading(true);

      const res = await api.get("/payrolls");

      const mapped: Payroll[] = res.data.map((p: any) => ({
        id: p.id,
        nomor_gaji: p.nomor_gaji,
        nama: p.pegawai?.name ?? "-",
        divisi: p.pegawai?.divisi?.nama ?? "-",
        keterangan: p.keterangan ?? "-",
        grand_total: p.gaji_diterima,
        company_id: p.company_id,
      }));

      setPayrolls(mapped);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal mengambil data payroll", "error");
    } finally {
      setLoading(false);
    }
  };

  // DELETE (UI ONLY)
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data payroll yang dihapus tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/payrolls/${id}`);

      setPayrolls((prev) => prev.filter((p) => p.id !== id));

      Swal.fire("Terhapus!", "Payroll berhasil dihapus.", "success");
    } catch (error) {
      Swal.fire("Error", "Gagal menghapus payroll", "error");
    }
  };


  // Columns
  const columns: Column<Payroll>[] = [
    {
      header: "No",
      accessor: "id",
      cell: (_, index) => index + 1,
      width: "60px",
    },
    { header: "Nomor Gaji", accessor: "nomor_gaji" },
    { header: "Nama", accessor: "nama" },
    { header: "Divisi", accessor: "divisi" },
    { header: "Keterangan", accessor: "keterangan" },
    {
      header: "Grand Total",
      accessor: "grand_total",
      cell: (row) => (
        "Rp " + Number(row.grand_total || 0).toLocaleString("id-ID")
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleDownload(row.id)}
            className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
            title="Download Slip Gaji"
          >
            <Download size={18} />
          </button>

          <button
            onClick={() => navigate(`/payroll/edit/${row.id}`)}
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
      width: "180px",
    },
  ];

  const filteredPayrolls = payrolls
    .filter(
        (p) =>
        p.nama.toLowerCase().includes(localSearch.toLowerCase()) ||
        p.divisi.toLowerCase().includes(localSearch.toLowerCase()) ||
        p.nomor_gaji.toLowerCase().includes(localSearch.toLowerCase())
    )
    .filter((p) =>
        selectedCompany === "all"
        ? true
        : p.company_id === selectedCompany
    );

    const handleDownload = async (id: number) => {
      try {
        const res = await api.get(`/payrolls/${id}/download`, {
          responseType: "blob",
        });

        const url = window.URL.createObjectURL(
          new Blob([res.data], { type: "application/pdf" })
        );

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `slip-gaji-${id}.pdf`);
        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        Swal.fire("Error", "Gagal download slip gaji", "error");
      }
    };



  // USER INTERFACE
  return (
    <>
      <PageMeta title="Payroll" description="Daftar Payroll" />
      <PageHeader
        pageTitle="Payroll"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <button
            onClick={() => navigate("/rekap-data")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-xl"
          >
            + Tambah Payroll
          </button>
        }
      />

      <div className="space-y-5 sm:space-y-6">
        <ComponentCard className="dark:bg-gray-800 dark:border-gray-700">
          {/* FILTER */}
          <div className="w-full bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border border-gray-300 dark:border-gray-700 mb-4">
            <div className="flex flex-wrap gap-6 items-end">
              <div className="flex flex-col w-72">
                <label className="text-sm font-medium mb-1 text-gray-900 dark:text-white">
                  Cari Payroll
                </label>
                <input
                  type="text"
                  placeholder="Nama / Divisi / Nomor Gaji"
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
                    e.target.value === "all"
                        ? "all"
                        : Number(e.target.value)
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
                data={filteredPayrolls}
                disableSearch
              />
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
