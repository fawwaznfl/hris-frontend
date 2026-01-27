import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import { DataTable, Column } from "../../components/common/DataTable";
import api from "../../api/axios";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { Check, X, Trash2 } from "lucide-react";

interface Pegawai {
  id: number;
  name: string;
  company_id: number;
  lokasi_id: number;
  lokasi?: Lokasi;
}

interface Company {
  id: number;
  name: string;
}

interface Lokasi {
  id: number;
  nama_lokasi: string;
}

interface Cuti {
  id: number;
  pegawai_id: number;
  company_id: number;
  jenis_cuti: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  alasan: string;
  status: string;
  foto?: string;
  disetujui_oleh?: number;
  catatan?: string;
  pegawai?: Pegawai;
  company?: Company;

  approved_by?: {
    id: number;
    name: string;
  };
} 

export default function CutiPage() {
  const [cutis, setCutis] = useState<Cuti[]>([]);
  const [pegawais, setPegawais] = useState<Pegawai[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [lokasis, setLokasis] = useState<Lokasi[]>([]);
  const dashboardType = localStorage.getItem("dashboard_type");
  const storageUrl = "http://localhost:8000/storage/";
  

  const [selectedCompany, setSelectedCompany] = useState<number | "all">("all");
  const [localSearch, setLocalSearch] = useState("");

  const navigate = useNavigate();

  // ✅ Fetch Companies - HANYA untuk superadmin
  const fetchCompanies = async () => {
    // Skip jika bukan superadmin
    if (dashboardType !== "superadmin") {
      return;
    }

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

  // Fetch Lokasis
  const fetchLokasis = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/lokasis", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLokasis(res.data.data);
    } catch (err) {
      console.error("Error fetching lokasis:", err);
    }
  };

  const handleApprove = async (row: Cuti) => {
    const { value: note } = await Swal.fire({
      title: "Approve Cuti?",
      input: "textarea",
      inputPlaceholder: "Tambahkan catatan (opsional)",
      showCancelButton: true,
      confirmButtonText: "Approve",
      cancelButtonText: "Batal",
    });

    if (note === undefined) return;

    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/cuti/${row.id}/approve`,
        { 
          catatan: note || "",
          disetujui_oleh: JSON.parse(localStorage.getItem("user")!)?.id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Berhasil!", "Cuti telah disetujui.", "success");

      fetchCutis(); 
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", "Terjadi kesalahan.", "error");
    }
  };

  const handleReject = async (row: Cuti) => {
    const { value: note } = await Swal.fire({
      title: "Reject Cuti?",
      input: "textarea",
      inputPlaceholder: "Tambahkan catatan (opsional)",
      showCancelButton: true,
      confirmButtonText: "Reject",
      cancelButtonText: "Batal",
    });

    if (note === undefined) return;

    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/cuti/${row.id}/reject`,
        { 
          catatan: note || "",
          disetujui_oleh: JSON.parse(localStorage.getItem("user")!)?.id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Ditolak!", "Cuti telah ditolak.", "success");

      // langsung update state supaya UI terlihat berubah
      setCutis(prev =>
        prev.map(c =>
          c.id === row.id
            ? { ...c, status: "ditolak", catatan: note || "", disetujui_oleh: c.disetujui_oleh || 1 } 
            : c
        )
      );

    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", "Terjadi kesalahan.", "error");
    }
  };


  // Fetch Pegawai
  const fetchPegawais = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/pegawais", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPegawais(res.data.data);
    } catch (err) {
      console.error("Error fetching pegawais:", err);
    }
  };

  // Fetch Cuti
  const fetchCutis = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/cuti", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCutis(res.data.data);
    } catch (err) {
      console.error("Error fetching cuti:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCutis();
    fetchPegawais();
    fetchCompanies(); // ✅ Sekarang aman, akan di-skip untuk admin
    fetchLokasis();
  }, []);

  // DELETE CUTI
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Hapus Cuti?",
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
        await api.delete(`/cuti/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCutis((prev) => prev.filter((c) => c.id !== id));

        Swal.fire("Terhapus!", "Cuti berhasil dihapus.", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Gagal", "Terjadi kesalahan saat menghapus cuti.", "error");
      }
    }
  };

  // EDIT
  const handleEdit = (row: Cuti) => {
    navigate(`/edit-cuti/${row.id}`);
  };

  // TABLE COLUMNS
  const columns: Column<Cuti>[] = [
    {
      header: "No",
      accessor: "id",
      cell: (_, index) => index + 1,
      width: "60px",
    },
    {
      header: "Nama Pegawai",
      accessor: "pegawai_id",
      cell: (row) => (
        <div>
          {row.pegawai?.name || "-"}
        </div>
      ),
    },
    {
      header: "Lokasi Pegawai",
      accessor: "pegawai_id",
      cell: (row) => (
        <div>
          {row.pegawai?.lokasi?.nama_lokasi || "-"}
        </div>
      ),
    },
    {
      header: "Jenis Cuti",
      accessor: "jenis_cuti",
    },
    {
      header: "Tanggal",
      accessor: "tanggal_mulai",
      cell: (row) => row.tanggal_mulai || "-",
    },
    {
      header: "Alasan",
      accessor: "alasan",
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => {
        const statusMap: Record<string, { label: string; bg: string; text: string }> = {
          disetujui: { label: "Disetujui", bg: "bg-green-100", text: "text-green-700" },
          ditolak: { label: "Ditolak", bg: "bg-red-100", text: "text-red-700" },
          menunggu: { label: "Menunggu", bg: "bg-yellow-100", text: "text-yellow-700" },
        };

        const st = statusMap[row.status] || { label: row.status, bg: "bg-gray-100", text: "text-gray-700" };

        return (
          <span className={`px-2 py-1 rounded text-sm font-medium ${st.bg} ${st.text}`}>
            {st.label}
          </span>
        );
      },
    },
    {
      header: "Foto",
      accessor: "foto",
      cell: (row) => {
        return row.foto ? (
          <img
            src={storageUrl + row.foto}
            alt="Foto Cuti"
            className="w-20 aspect-square object-cover rounded-full cursor-pointer"
            onClick={() => handlePreview(row.foto)}
          />
        ) : (
          "-"
        );
      },
    },
    {
      header: "User Approval",
      accessor: "disetujui_oleh",
      cell: (row) => row.approved_by?.name || "-",
    },
    {
      header: "Catatan",
      accessor: "catatan",
      cell: (row) => row.catatan || "-",
    },
    {
      header: "Actions",
      accessor: "id",
      width: "130px",
      cell: (row) => {
        const isPending = row.status === "menunggu";

        return (
          <div className="flex gap-2">
            {isPending && (
              <>
                <button
                  onClick={() => handleApprove(row)}
                  className="bg-green-600 hover:bg-green-700 text-white p-2 rounded"
                  title="Approve"
                >
                  <Check size={18} />
                </button>

                <button
                  onClick={() => handleReject(row)}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                  title="Reject"
                >
                  <X size={18} />
                </button>
              </>
            )}

            <button
              onClick={() => handleDelete(row.id)}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
            >
              <Trash2 size={18} />
            </button>
          </div>
        );
      },
    },
  ];

  // FILTERING
  const filteredCutis = cutis
    .filter((c) =>
      (c.pegawai?.name || "")
        .toLowerCase()
        .includes(localSearch.toLowerCase())
    )
    .filter((c) =>
      selectedCompany === "all" ? true : c.company_id === selectedCompany
    );

  const handlePreview = (foto?: string) => {
    if (!foto) return;

    const url = storageUrl + foto;

    Swal.fire({
      title: 'Foto Cuti',
      html: `
        <img 
          src="${url}" 
          style="width: 100%; border-radius: 12px;" 
        />
      `,
      showCloseButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Download',
      width: '40rem',
    }).then((result) => {
      if (result.isConfirmed) {
        const link = document.createElement('a');
        link.href = url;
        link.download = foto.split('/').pop() || "foto.jpg";
        link.click();
      }
    });
  };

  return (
    <>
      <PageMeta title="Cuti" description="Daftar Cuti" />
      <PageHeader
        pageTitle="Cuti"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <button
            onClick={() => navigate("/add-cuti")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-xl"
          >
            + Tambah
          </button>
        }
      />

      <div className="space-y-5 sm:space-y-6 mt-4">
        <ComponentCard className="dark:bg-gray-800 dark:border-gray-700">
          {/* FILTER SECTION */}
          <div className="w-full bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border border-gray-300 dark:border-gray-700 mb-4">
            <div className="flex flex-wrap gap-6">
              <div className="flex flex-col w-72">
                <label className="text-sm font-medium mb-1 dark:text-white">
                  Cari Pegawai
                </label>
                <input
                  type="text"
                  placeholder="Cari pegawai..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="border px-3 py-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* ✅ Filter company HANYA muncul untuk superadmin */}
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
            <div className="overflow-x-auto [&_tr:hover]:bg-white [&_tr:hover]:text-gray-900 dark:[&_tr:hover]:bg-gray-800 dark:[&_tr:hover]:text-gray-100 [&_input]:bg-white [&_input]:text-gray-900 [&_input::placeholder]:text-gray-400 dark:[&_input]:bg-gray-800 dark:[&_input]:text-gray-100 dark:[&_input::placeholder]:text-gray-400 dark:[&_table]:bg-gray-900 dark:[&_table]:text-gray-100 dark:[&_thead]:bg-gray-800 dark:[&_th]:bg-gray-800 dark:[&_th]:text-gray-100 dark:[&_tr]:border-gray-700 dark:[&_td]:border-gray-700 [&_tr]:transition-colors">
              <DataTable columns={columns} data={filteredCutis} disableSearch />
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}