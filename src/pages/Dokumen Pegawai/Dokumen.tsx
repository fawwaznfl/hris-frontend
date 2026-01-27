import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import { DataTable, Column } from "../../components/common/DataTable";
import api from "../../api/axios";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { Edit, Trash, Eye } from "lucide-react";

/* =======================
   INTERFACE
======================= */
interface Dokumen {
  id: number;
  pegawai_id: number;
  pegawai?: { id: number; name: string };
  nama_dokumen: string;
  catatan?: string;
  company_id?: number;
  created_at?: string;
  file_url?: string;
}

/* =======================
   COMPONENT
======================= */
export default function Dokumen() {
  const navigate = useNavigate();

  const [dokumenList, setDokumenList] = useState<Dokumen[]>([]);
  const [loading, setLoading] = useState(true);

  const dashboardType = localStorage.getItem("dashboard_type");
  const [localSearch, setLocalSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string | number>("all");
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);

  /* PREVIEW STATE */
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [previewType, setPreviewType] =
    useState<"pdf" | "image" | "other">("other");

  /* =======================
     FETCH DATA
  ======================= */
  const fetchDokumen = async () => {
    try {
      const token = localStorage.getItem("token");
      const company_id = localStorage.getItem("company_id");

      const res = await api.get("/dokumen-pegawai", {
        headers: { Authorization: `Bearer ${token}` },
        params: { company_id },
      });

      setDokumenList(res.data.data);
    } catch (err) {
      console.error(err);
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
      setCompanies(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDokumen();
    
    if (localStorage.getItem("dashboard_type") === "superadmin") {
      fetchCompanies();
    }
  }, []);

  const handleViewFile = (file?: string) => {
    if (!file) {
      Swal.fire("Tidak ada file", "File tidak tersedia", "info");
      return;
    }

    const ext = file.split(".").pop()?.toLowerCase();

    if (ext === "pdf") setPreviewType("pdf");
    else if (["jpg", "jpeg", "png", "webp"].includes(ext || ""))
      setPreviewType("image");
    else setPreviewType("other");

    setPreviewFile(file);
    setShowPreview(true);
  };

  useEffect(() => {
    document.body.style.overflow = showPreview ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showPreview]);


  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Hapus dokumen?",
      text: "Data tidak bisa dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/dokumen-pegawai/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDokumenList((prev) => prev.filter((d) => d.id !== id));
      Swal.fire("Berhasil", "Dokumen dihapus", "success");
    } catch (err) {
      Swal.fire("Gagal", "Terjadi kesalahan", "error");
    }
  };

  const columns: Column<Dokumen>[] = [
    {
      header: "No",
      accessor: "id",
      width: "60px",
      cell: (_, index) => index + 1,
    },
    {
      header: "Nama Pegawai",
      accessor: "pegawai",
      cell: (row) => row.pegawai?.name || "-",
    },
    {
      header: "Nama Dokumen",
      accessor: "nama_dokumen",
    },
    {
      header: "Tanggal Upload",
      accessor: "created_at",
      cell: (row) =>
        row.created_at
          ? new Date(row.created_at).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          : "-",
    },
    {
      header: "File",
      width: "100px",
      cell: (row) => (
        <a
          href={row.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded inline-flex items-center justify-center"
        >
          <Eye size={16} />
        </a>
      ),
    },
    {
      header: "Aksi",
      width: "150px",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/edit-dokumen-pegawai/${row.id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
          >
            <Trash size={18} />
          </button>
        </div>
      ),
    },
  ];

  const filteredDokumen = dokumenList
    .filter((d) =>
      d.pegawai?.name.toLowerCase().includes(localSearch.toLowerCase())
    )
    .filter((d) =>
      selectedCompany === "all" ? true : d.company_id === selectedCompany
    );


    // USER INTERFACE
  return (
    <>
      <PageMeta title="Dokumen Pegawai" description="Daftar Dokumen Pegawai" />

      <PageHeader
        pageTitle="Dokumen Pegawai"
        rightContent={
          <button
            onClick={() => navigate("/add-dokumen-pegawai")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl"
          >
            + Tambah
          </button>
        }
      />

      <ComponentCard>
        <DataTable columns={columns} data={filteredDokumen} disableSearch />
      </ComponentCard>
    </>
  );
}
