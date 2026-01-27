import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import { DataTable, Column } from "../../components/common/DataTable";
import { useSearch } from "../../SearchContext";
import api from "../../api/axios";
import { useNavigate } from "react-router";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CheckCircle, XCircle, Download, Eye, Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

interface Reimbursement {
  id: number;
  company_id: number;
  pegawai_id: number;
  tanggal: string;
  event: string;
  jumlah: number | null;
  terpakai: number;
  total: string;
  sisa: number;
  status: string;
  file?: string;            
  approved_file?: string;  
  metode_reim: "cash" | "transfer";
  no_rekening?: string;

  kategori?: {
    id: number;
    nama: string;
    jumlah: string;
  };

  pegawai?: {
    id: number;
    name: string;
    company_id: number;
  };
}

export default function Reimbursements() {
  const { searchTerm } = useSearch();
  const navigate = useNavigate();

  const [reims, setReims] = useState<Reimbursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const dashboardType = localStorage.getItem("dashboard_type");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [pegawaiSearch, setPegawaiSearch] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const formatRupiah = (value: number | string | null) => {
    if (!value) return "Rp0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(value));
  };

  const CustomInput = ({ value, onClick }: any) => (
    <button
      onClick={onClick}
      className="border px-3 py-2 rounded-lg w-40 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
    >
      {value || "Pilih tanggal"}
    </button>
  );

  const fetchCompanies = async () => {
    try {
      const res = await api.get("/companies");
      setCompanies(res.data.data || []);
    } catch (err) {
      console.error("Error fetch companies", err);
    }
  };

  const fetchReims = async () => {
    try {
      const res = await api.get("/reimbursement");
      setReims(res.data.data);
    } catch (err) {
      console.error("Error fetch reimbursements", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReims();
    
    if (localStorage.getItem("dashboard_type") === "superadmin") {
      fetchCompanies();
    }
  }, []);


  const handleEdit = (row: Reimbursement) => navigate(`/edit-reimbursement/${row.id}`);
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Yakin hapus?",
      text: "Data reimbursement akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/reimbursement/${id}`);
      setReims(reims.filter((r) => r.id !== id));
      Swal.fire("Berhasil", "Data berhasil dihapus", "success");
    } catch {
      Swal.fire("Gagal", "Tidak dapat menghapus data", "error");
    }
  };

  const handleReject = async (id: number) => {
    const ok = await Swal.fire({
      title: "Tolak Reimbursement?",
      text: "Tidak bisa dibatalkan setelah ditolak.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Tolak",
    });

    if (!ok.isConfirmed) return;

    try {
      await api.put(`/reimbursement/${id}/reject`);
      fetchReims();
      Swal.fire("Ditolak", "Reimbursement berhasil ditolak", "success");
    } catch {
      Swal.fire("Gagal", "Tidak dapat reject reimbursement", "error");
    }
  };

  const handleApprove = async (id: number) => {
    const { value: file } = await Swal.fire({
      title: "Upload Bukti Approved (Opsional)",
      html: `
        <input type="file" id="buktiFile" class="swal2-file" />
        <small style="color:gray;">
          Boleh dikosongkan. (jpg, png, pdf | max 2MB)
        </small>
      `,
      confirmButtonText: "Submit",
      showCancelButton: true,
      preConfirm: () => {
        const input: any = document.getElementById("buktiFile");
        const file = input?.files?.[0];
        if (!file) return null;

        const allowed = ["image/jpeg", "image/png", "application/pdf"];
        if (!allowed.includes(file.type)) {
          Swal.showValidationMessage("Format harus JPG, PNG, atau PDF");
          return false;
        }

        if (file.size > 2 * 1024 * 1024) {
          Swal.showValidationMessage("Ukuran file maksimal 2MB");
          return false;
        }

        return file;
      },
    });

    if (file === undefined) return;

    Swal.fire({
      title: "Memproses...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const formData = new FormData();

      if (file) {
        formData.append("approved_file", file);
      }

      await api.post(`/reimbursement/${id}/approve`, formData);

      Swal.close();
      fetchReims();

      Swal.fire("Berhasil!", "Reimbursement telah di-approve.", "success");
    } catch {
      Swal.close();
      Swal.fire("Gagal", "Approve reimbursement gagal.", "error");
    }
  };

  const renderMetode = (row: Reimbursement) => {
    if (row.metode_reim === "transfer") {
      return (
        <div className="flex flex-col gap-1">
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-300">
            Transfer
          </span>
          {row.no_rekening && (
            <span className="text-xs text-gray-500">
              {row.no_rekening}
            </span>
          )}
        </div>
      );
    }

    return (
      <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-300">
        Cash
      </span>
    );
  };

  const columns: Column<Reimbursement>[] = [
    { header: "No", accessor: "id", cell: (_, i) => i + 1, width: "60px" },
    { header: "Tanggal", accessor: "tanggal" },
    {
      header: "Nama",
      accessor: "pegawai",
      cell: (row) => row.pegawai?.name ?? "-",
    },
    { header: "Event", accessor: "event" },
    {
      header: "Kategori",
      accessor: "kategori",
      cell: (row) => row.kategori?.nama ?? "-",
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => {
        const status = row.status.toLowerCase();

        const style =
          status === "pending"
            ? // PENDING
              "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-600/30 dark:text-yellow-300 dark:border-yellow-500"
            : status === "approve"
            ? // APPROVE
              "bg-green-100 text-green-800 border-green-300 dark:bg-green-600/30 dark:text-green-300 dark:border-green-500"
            : status === "reject"
            ? // REJECT
              "bg-red-100 text-red-800 border-red-300 dark:bg-red-600/30 dark:text-red-300 dark:border-red-500"
            : "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-600/30 dark:text-gray-300 dark:border-gray-500";

        return (
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold border ${style}`}
          >
            {status === "approve"
              ? "Approved"
              : status === "reject"
              ? "Rejected"
              : "Pending"}
          </span>
        );
      },
    },
    {header: "Terpakai", accessor: "terpakai", cell: (row) => formatRupiah(row.terpakai),},
    { header: "Total", accessor: "total",cell: (row) => formatRupiah(row.total),},
    { header: "Sisa", accessor: "sisa", cell: (row) => formatRupiah(row.sisa),},
    {
      header: "Metode Reim",
      accessor: "metode_reim",
      cell: (row) => renderMetode(row),
    },
    {
      header: "File",
      accessor: "file",
      cell: (row) => {
        const files = [
          row.file && {
            url: `http://localhost:8000/storage/${row.file}`,
            label: "Pengajuan",
            color: "bg-blue-600 hover:bg-blue-700",
            icon: <Eye size={16} />,
          },
          row.approved_file && {
            url: `http://localhost:8000/storage/${row.approved_file}`,
            label: "Approved",
            color: "bg-green-600 hover:bg-green-700",
            icon: <Download size={16} />,
          },
        ].filter(Boolean) as {
          url: string;
          label: string;
          color: string;
          icon: React.ReactNode;
        }[];

        if (files.length === 0) return "-";

        return (
          <div className="flex items-center gap-2">
            {files.map((f, i) => (
              <button
                key={i}
                onClick={() => window.open(f.url, "_blank")}
                className={`${f.color} text-white p-2 rounded flex items-center gap-1`}
                title={f.label}
              >
                {f.icon}
              </button>
            ))}
          </div>
        );
      },
    },
    {
      header: "Actions",
      width: "150px",
      cell: (row) => (
        <div className="flex gap-2">

          {/* APPROVE */}
          {row.status === "pending" && (
            <button
              onClick={() => handleApprove(row.id)}
              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full"
            >
              <CheckCircle size={18} />
            </button>
          )}

          {/* REJECT */}
          {row.status === "pending" && (
            <button
              onClick={() => handleReject(row.id)}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
            >
              <XCircle size={18} />
            </button>
          )}
          {/* DELETE */}
          <button
            onClick={() => handleDelete(row.id)}
            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  // ==================== FILTERING ====================
  const filteredReims = reims.filter((r) => {
    const nameMatch = r.pegawai?.name
      ?.toLowerCase()
      .includes(pegawaiSearch.toLowerCase());

    const companyMatch =
      !selectedCompany ||
      String(r.pegawai?.company_id) === String(selectedCompany);

    const tanggal = new Date(r.tanggal);

    const dateMatch =
      (!startDate || tanggal >= startDate) &&
      (!endDate || tanggal <= endDate);

    return nameMatch && companyMatch && dateMatch;
  });

  // USER INTERFACE
  return (
    <>
      <PageMeta title="Reimbursements" description="Daftar Reimbursements" />

      <PageHeader
        pageTitle="Reimbursements"
        rightContent={
          <button
            onClick={() => navigate("/add-reimbursement")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl"
          >
            + Tambah
          </button>
        }
      />

      <div className="space-y-5 mt-4">
        <ComponentCard className="dark:bg-gray-800 p-0">
          {loading ? (
            <p className="text-gray-700 dark:text-gray-300">Loading...</p>
          ) : (
            <div className="datatable-no-search">

              {/* FILTER */}
              <div className="w-full bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border mb-4">
                <div className="flex flex-col md:flex-row md:justify-between gap-6">

                  {/* LEFT */}
                  <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full md:w-auto">

                    {/* NAMA */}
                    <div className="flex flex-col">
                      <label className="mb-1 dark:text-white">Cari Pegawai</label>
                      <input
                        type="text"
                        placeholder="Cari nama..."
                        value={pegawaiSearch}
                        onChange={(e) => setPegawaiSearch(e.target.value)}
                        className="border px-3 py-2 rounded-lg w-full sm:w-64 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    {/* COMPANY */}
                    {dashboardType === "superadmin" && (
                      <div className="flex flex-col">
                        <label className="mb-1 dark:text-white">Company</label>
                        <select
                          className="border px-3 py-2 rounded-lg w-64 dark:bg-gray-700 dark:text-white"
                          value={selectedCompany}
                          onChange={(e) => setSelectedCompany(e.target.value)}
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

                  {/* RIGHT */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-end w-full md:w-auto">
                    <div className="flex flex-col">
                      <label className="mb-1 dark:text-white">Tanggal Mulai</label>
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        dateFormat="yyyy-MM-dd"
                        customInput={<CustomInput />}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="mb-1 dark:text-white">Tanggal Akhir</label>
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        dateFormat="yyyy-MM-dd"
                        customInput={<CustomInput />}
                      />
                    </div>

                    <button
                      onClick={() => {
                        setPegawaiSearch("");
                        setSelectedCompany("");
                        setStartDate(null);
                        setEndDate(null);
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* TABLE */}
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
                [&_tr]:transition-colors" >
                <DataTable columns={columns} data={filteredReims} disableSearch />
              </div>
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
