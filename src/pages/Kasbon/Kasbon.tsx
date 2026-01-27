import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import { DataTable, Column } from "../../components/common/DataTable";
import { useSearch } from "../../SearchContext";
import api from "../../api/axios";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { Edit, Trash, CheckCircle, XCircle } from "lucide-react";

interface Kasbon {
  id: number;
  pegawai_id: number;
  company_id: number;
  pegawai?: { name: string };
  nominal: number;
  keperluan: string | null;
  status: string;
  tanggal: string;
}

export default function Kasbon() {
  const { searchTerm } = useSearch();
  const [kasbonList, setKasbonList] = useState<Kasbon[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string | number>("all");
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const dashboardType = localStorage.getItem("dashboard_type");
  const navigate = useNavigate();

  // GET KASBON
  const fetchKasbon = async () => {
    try {
      const token = localStorage.getItem("token");
      const company_id = localStorage.getItem("company_id");

      let params: any = {};

      if (dashboardType === "superadmin") {
        // Jika superadmin memilih ALL -> jangan kirim params
        if (selectedCompany !== "all") {
          params.company_id = selectedCompany;
        }
      } else {
        // Jika admin -> paksa filter company_id dari login
        params.company_id = company_id;
      }

      const res = await api.get("/kasbon", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setKasbonList(res.data.data);
    } catch (err) {
      console.error("Error fetching kasbon:", err);
    } finally {
      setLoading(false);
    }
  };



  // GET COMPANY
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

  const handleApproveKasbon = async (row: Kasbon) => {
    const { value: formValues } = await Swal.fire({
      title: "Approval Kasbon",
      width: "450px",
      html: `
        <div style="text-align: left;">
          <label style="font-weight: 600;">Status</label>
          <select id="swal-status"
            style="
              width: 100%;
              margin-top: 6px;
              padding: 10px;
              border-radius: 8px;
              border: 1px solid #d1d5db;
              outline: none;
              font-size: 14px;
            ">
            <option value="approve">Approve</option>
            <option value="reject">Reject</option>
          </select>
        </div>

        <div style="text-align: left; margin-top: 15px;">
          <label style="font-weight: 600;">Upload File</label>
          <input type="file" id="swal-file"
            style="
              width: 100%;
              margin-top: 6px;
              padding: 8px;
              border-radius: 8px;
              border: 1px solid #d1d5db;
              background: white;
            "
          />
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
      focusConfirm: false,

      preConfirm: () => {
        const status = (document.getElementById("swal-status") as HTMLSelectElement)?.value;
        const fileInput = document.getElementById("swal-file") as HTMLInputElement;
        const file = fileInput?.files?.[0] ?? null;

        return { status, file };
      },
    });

    if (!formValues) return;

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("status", formValues.status);
      if (formValues.file) formData.append("file", formValues.file);

      await api.post(`/kasbon/${row.id}/approval`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire("Berhasil!", "Status kasbon berhasil diperbarui.", "success");
      fetchKasbon();
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan data.", "error");
    }
  };


  useEffect(() => {
    fetchKasbon();
    
    if (localStorage.getItem("dashboard_type") === "superadmin") {
      fetchCompanies();
    }
  }, []);


  useEffect(() => {
    if (dashboardType === "superadmin") {
      fetchKasbon();
    }
  }, [selectedCompany]);


  // DELETE
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Hapus Kasbon?",
      text: "Data kasbon tidak bisa dikembalikan.",
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
        await api.delete(`/kasbon/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setKasbonList(kasbonList.filter((k) => k.id !== id));
        Swal.fire("Berhasil", "Kasbon berhasil dihapus.", "success");
      } catch (err) {
        Swal.fire("Gagal", "Terjadi kesalahan saat menghapus.", "error");
      }
    }
  };

  // EDIT
  const handleEdit = (kasbon: Kasbon) => {
    navigate(`/edit-kasbon/${kasbon.id}`);
  };

  // FORMAT RUPIAH
  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);

  // TABLE COLUMNS
  const columns: Column<Kasbon>[] = [
    {
      header: "No",
      accessor: "id",
      cell: (_, index) => index + 1,
      width: "60px",
    },
    {
      header: "Pegawai",
      accessor: "pegawai",
      cell: (row) => row.pegawai?.name || "-",
    },
    {
      header: "Nominal",
      accessor: "nominal",
      cell: (row) => formatRupiah(row.nominal),
    },
    {
      header: "Tanggal",
      accessor: "tanggal",
      cell: (row) =>
        new Date(row.tanggal).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
    },
    {
      header: "Keperluan",
      accessor: "keperluan",
      cell: (row) => row.keperluan || "-",
    },
    {
        header: "Status",
        accessor: "status",
        cell: (row) => {
            let color = "";
            switch (row.status) {
            case "pending":
                color = "bg-yellow-500";
                break;
            case "approve":
                color = "bg-green-600";
                break;
            case "reject":
                color = "bg-red-600";
                break;
            case "paid":
                color = "bg-blue-500";
                break;
            default:
                color = "bg-gray-400";
            }

            // Huruf pertama kapital
            const formattedStatus =
            row.status?.charAt(0).toUpperCase() + row.status?.slice(1) || "-";

            return (
            <span
                className={`px-3 py-1 rounded-full text-white font-medium ${color}`}
            >
                {formattedStatus}
            </span>
            );
        },
        width: "120px",
        },
      {
        header: "Actions",
        width: "160px",
        cell: (row) => (
          <div className="flex gap-2">

            {/* TOMBOL APPROVE/REJECT – hanya muncul saat pending */}
            {row.status === "pending" && (
              <button
                onClick={() => handleApproveKasbon(row)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded flex items-center justify-center"
                title="Approve / Reject"
              >
                <CheckCircle size={18} />
              </button>
            )}

            {/* EDIT */}
            <button
              onClick={() => handleEdit(row)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded flex items-center justify-center"
              title="Edit"
            >
              <Edit size={16} />
            </button>

            {/* DELETE */}
            <button
              onClick={() => handleDelete(row.id)}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded flex items-center justify-center"
              title="Hapus"
            >
              <Trash size={16} />
            </button>
          </div>
        ),
      },
  ];

  // SEARCH + FILTER
  const filteredData = kasbonList
    .filter((k) =>
      k.pegawai?.name?.toLowerCase().includes(localSearch.toLowerCase())
    )
    .filter((k) =>
      selectedCompany === "all" ? true : k.company_id === selectedCompany
    );

  return (
    <>
      <PageMeta title="Kasbon Pegawai" description="Daftar Kasbon Pegawai" />

      <PageHeader
        pageTitle="Kasbon Pegawai"
        titleClass="text-[32px] dark:text-white"
        rightContent={
          <button
            onClick={() => navigate("/add-kasbon")}
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
                  Cari Pegawai
                </label>
                <input
                  type="text"
                  placeholder="Cari pegawai..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="border px-3 py-2 rounded-lg w-72 bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* COMPANY FILTER */}
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