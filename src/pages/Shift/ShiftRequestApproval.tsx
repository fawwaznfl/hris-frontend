import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import { DataTable, Column } from "../../components/common/DataTable";
import api from "../../api/axios";
import Swal from "sweetalert2";
import { CheckCircle, XCircle } from "lucide-react";

interface ShiftInfo {
  nama: string;
  jam_masuk: string;
  jam_pulang: string;
}

interface ShiftRequest {
  id: number;
  tanggal_mulai: string;
  pegawai: {
    id: number;
    name: string;
  };
  shift_lama: ShiftInfo | null;
  shift_baru: ShiftInfo;
  company_id?: number;
  status: string;
}

export default function ShiftRequestApproval() {
  const [requests, setRequests] = useState<ShiftRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string | number>("all");
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);

  const dashboardType = localStorage.getItem("dashboard_type");

  // =========================
  // FETCH DATA
  // =========================
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/shift-mapping/requests");
      setRequests(res.data.data || []);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal mengambil data request", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    if (dashboardType !== "superadmin") return;
    try {
      const res = await api.get("/companies");
      setCompanies(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchCompanies();
  }, []);

  // =========================
  // ACTIONS
  // =========================
  const handleApprove = async (id: number) => {
    const confirm = await Swal.fire({
      icon: "question",
      title: "Approve request ini?",
      showCancelButton: true,
      confirmButtonText: "Approve",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.post(`/shift-mapping/${id}/approve`);
      Swal.fire("Berhasil", "Request berhasil di-approve", "success");
      fetchRequests();
    } catch (error) {
      Swal.fire("Error", "Gagal approve request", "error");
    }
  };

  const handleReject = async (id: number) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Reject request ini?",
      showCancelButton: true,
      confirmButtonText: "Reject",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.post(`/shift-mapping/${id}/reject`);
      Swal.fire("Ditolak", "Request berhasil ditolak", "success");
      fetchRequests();
    } catch (error) {
      Swal.fire("Error", "Gagal reject request", "error");
    }
  };

  // =========================
  // FILTER
  // =========================
  const filteredData = requests
    .filter((r) =>
      r.pegawai.name.toLowerCase().includes(localSearch.toLowerCase())
    )
    .filter((r) =>
      selectedCompany === "all" ? true : r.company_id === selectedCompany
    );

  // =========================
  // TABLE COLUMNS
  // =========================
  const columns: Column<ShiftRequest>[] = [
    {
      header: "No",
      accessor: "id",
      cell: (_, i) => i + 1,
      width: "60px",
    },
    {
      header: "Pegawai",
      accessor: "pegawai",
      cell: (r) => r.pegawai.name,
    },
    {
      header: "Tanggal",
      accessor: "tanggal_mulai",
    },
    {
      header: "Shift Lama",
      cell: (r) =>
        r.shift_lama
          ? `${r.shift_lama.nama} (${r.shift_lama.jam_masuk} - ${r.shift_lama.jam_pulang})`
          : "-",
    },
    {
      header: "Shift Baru",
      cell: (r) =>
        `${r.shift_baru.nama} (${r.shift_baru.jam_masuk} - ${r.shift_baru.jam_pulang})`,
    },
    {
      header: "Aksi",
      cell: (r) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleApprove(r.id)}
            className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
            title="Approve"
          >
            <CheckCircle size={18} />
          </button>
          <button
            onClick={() => handleReject(r.id)}
            className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
            title="Reject"
          >
            <XCircle size={18} />
          </button>
        </div>
      ),
      width: "140px",
    },
  ];

  // =========================
  // RENDER
  // =========================
  return (
    <>
      <PageMeta title="Approval Shift" description="Approval Shift Request" />
      <PageHeader
        pageTitle="Approval Shift Request"
        titleClass="text-[32px] dark:text-white"
      />

      <ComponentCard>
        {/* FILTER */}
        <div className="w-full bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border mb-4">
          <div className="flex gap-6 items-end flex-wrap">
            <div className="flex flex-col w-72">
              <label className="text-sm font-medium mb-1">Cari Pegawai</label>
              <input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="border px-3 py-2 rounded-lg"
                placeholder="Cari pegawai..."
              />
            </div>

            {dashboardType === "superadmin" && (
              <div className="flex flex-col w-72">
                <label className="text-sm font-medium mb-1">Company</label>
                <select
                  value={selectedCompany}
                  onChange={(e) =>
                    setSelectedCompany(
                      e.target.value === "all"
                        ? "all"
                        : Number(e.target.value)
                    )
                  }
                  className="border px-3 py-2 rounded-lg"
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
          <p className="text-center py-6">Loading...</p>
        ) : (
          <DataTable columns={columns} data={filteredData} disableSearch />
        )}
      </ComponentCard>
    </>
  );
}
