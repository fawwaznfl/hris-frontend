import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import { DataTable, Column } from "../../components/common/DataTable";
import api from "../../api/axios";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { Eye, Trash } from "lucide-react";

interface Kunjungan {
  id: number;
  company_id?: number;
  created_at: string;
  updated_at?: string;
  keterangan?: string | null;
  keterangan_keluar?: string | null;
  lokasi_masuk: string;
  lokasi_keluar?: string | null;
  upload_foto: string;
  foto_keluar?: string | null;
  pegawai?: {
    name: string;
  };
  tanggal_mulai: string;
  tanggal_selesai?: string | null;
  jam_masuk?: string | null;
  jam_pulang?: string | null;
  status: string;
}

export default function KunjunganPage() {
  const [list, setList] = useState<Kunjungan[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string | number>("all");
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const dashboardType = localStorage.getItem("dashboard_type");
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/kunjungan", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setList(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Yakin?",
      text: "Data kunjungan akan dihapus!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/kunjungan/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setList((prev) => prev.filter((i) => i.id !== id));
      Swal.fire("Berhasil", "Data dihapus", "success");
    } catch {
      Swal.fire("Gagal", "Tidak bisa menghapus data", "error");
    }
  };

  const fetchCompanies = async () => {
    const token = localStorage.getItem("token");
    const res = await api.get("/companies", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCompanies(res.data.data);
  };

  useEffect(() => {
    fetchData();
    
    if (localStorage.getItem("dashboard_type") === "superadmin") {
      fetchCompanies();
    }
  }, []);


  const statusBadge = (status: string) => {
    const map: any = {
      berlangsung: "bg-blue-100 text-blue-700",
      selesai: "bg-green-100 text-green-700",
      batal: "bg-red-100 text-red-700",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${map[status]}`}>
        {status}
      </span>
    );
  };

  const columns: Column<Kunjungan>[] = [
    {
      header: "No",
      cell: (_, i) => i + 1,
      width: "60px",
    },
    {
      header: "Nama",
      accessor: "pegawai",
      cell: (row) => row.pegawai?.name || "-",
    },
    {
      header: "Tanggal",
      accessor: "tanggal_mulai",
      cell: (row) =>
        new Date(row.tanggal_mulai).toLocaleDateString("id-ID"),
    },
    {
    header: "Visit In",
    cell: (row) => (
        <div className="space-y-1 text-sm text-center flex flex-col items-center">
        <p className="font-medium text-gray-800 dark:text-gray-100">
          {formatTanggal(row.created_at)}
        </p>

        <p className="text-gray-700 dark:text-gray-200">
          {row.pegawai?.name || "-"}
        </p>

        {row.keterangan && (
          <p className="text-gray-600 dark:text-gray-300">
            Keterangan: {row.keterangan}
          </p>
        )}

        <div className="flex gap-4 pt-1">
          <a
            href={`${import.meta.env.VITE_API_BASE_URL}/storage/${row.upload_foto}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            📎 Lampiran
          </a>

          <a
            href={`https://www.google.com/maps?q=${row.lokasi_masuk}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 dark:text-green-400 hover:underline"
          >
            📍 Lokasi
          </a>
        </div>
      </div>

    ),
    },
    {
    header: "Visit Out",
    cell: (row) => {
        if (!row.foto_keluar) {
        return (
            <button
            onClick={() => navigate(`/kunjungan/${row.id}/visit-out`)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-lg text-xs"
            >
            Visit Out
            </button>
        );
        }

        return (
        <div className="space-y-1 text-sm text-center flex flex-col items-center">
            {/* TANGGAL */}
            <p className="font-medium text-gray-800 dark:text-gray-100">
            {formatTanggal(row.updated_at!)}
            </p>

            {/* NAMA */}
            <p className="text-gray-700 dark:text-gray-200">
            {row.pegawai?.name || "-"}
            </p>

            {/* KETERANGAN */}
            {row.keterangan_keluar && (
            <p className="text-gray-600 dark:text-gray-300">
                Keterangan: {row.keterangan_keluar}
            </p>
            )}

            {/* ACTION */}
            <div className="flex gap-4 pt-1">
            <a
                href={`${import.meta.env.VITE_API_BASE_URL}/storage/${row.foto_keluar}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
            >
                📎 Lampiran
            </a>

            <a
                href={`https://www.google.com/maps?q=${row.lokasi_keluar}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 dark:text-green-400 hover:underline"
            >
                📍 Lokasi
            </a>
            </div>
        </div>
        );
    },
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => statusBadge(row.status),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash size={18} />
          </button>
        </div>
      ),
      width: "150px",
    },
  ];

  const formatTanggal = (date: string) =>
    new Date(date).toLocaleString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    // Search
  const filteredKunjungan = list
    .filter((k) =>
      k.pegawai?.name
        ?.toLowerCase()
        .includes(localSearch.toLowerCase())
    )
    .filter((k) =>
      selectedCompany === "all"
        ? true
        : k.company_id === selectedCompany
    );



  // USER INTERFACE

  return (
    <>
      <PageMeta title="Kunjungan" description="Data Kunjungan" />
      <PageHeader
        pageTitle="Kunjungan"
        titleClass="text-[32px]"
        rightContent={
          <button
            onClick={() => navigate("/add-kunjungan")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl"
          >
            + Visit In
          </button>
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
                data={filteredKunjungan}
                disableSearch
              />
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
