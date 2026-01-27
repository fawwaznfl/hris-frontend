import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import { DataTable, Column } from "../../components/common/DataTable";
import Swal from "sweetalert2";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { Printer, Wallet } from "lucide-react";
import { useSearchParams } from "react-router-dom";

// INTERFACE
interface Company {
  id: number;
  name: string;
}

interface RekapSummary {
  pegawai_id: number;
  nama_pegawai: string;
  has_payroll: boolean;
  total_cuti: number;
  total_izin_masuk: number;
  total_sakit: number;
  total_izin_telat: number;
  total_izin_pulang_cepat: number;
  total_hadir: number;
  total_alfa: number;
  total_libur: number;
  total_telat: string;
  total_pulang_cepat: string;
  total_lembur: string;
  persentase_kehadiran: number;
}


type ViewState = "form" | "loading" | "result";

export default function RekapData() {
  const dashboardType = localStorage.getItem("dashboard_type");

  // STATE
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<number | "">("");
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();


  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };


  const [data, setData] = useState<RekapSummary[]>([]);
  const [viewState, setViewState] = useState<ViewState>("form");

  // FETCH COMPANY (SUPERADMIN)
  const fetchCompanies = async () => {
    try {
      const res = await api.get("/companies");
      setCompanies(res.data.data);
    } catch {
      Swal.fire("Error", "Gagal mengambil data company", "error");
    }
  };

  // FETCH REKAP
  const fetchRekap = async () => {
    if (!startDate || !endDate) {
        return Swal.fire("Error", "Tanggal harus diisi", "warning");
    }

    if (dashboardType === "superadmin" && !selectedCompany) {
        return Swal.fire("Error", "Pilih company terlebih dahulu", "warning");
    }

    setViewState("loading");

    try {
        const params: any = {
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        };

        if (dashboardType === "superadmin") {
        params.company_id = selectedCompany;
        }

        const res = await api.get("/rekap-absensi/summary", { params });
       setData(res.data.data);
        setViewState("result");

        // ⬇️ SIMPAN KE URL
        setSearchParams({
          start_date: formatDate(startDate),
          end_date: formatDate(endDate),
          ...(dashboardType === "superadmin" && {
            company_id: String(selectedCompany),
          }),
        });

    } catch {
        Swal.fire("Error", "Gagal mengambil data rekap", "error");
        setViewState("form");
    }
    };

    useEffect(() => {
      const start = searchParams.get("start_date");
      const end = searchParams.get("end_date");
      const companyId = searchParams.get("company_id");

      if (start && end) {
        const startD = new Date(start);
        const endD = new Date(end);

        setStartDate(startD);
        setEndDate(endD);

        if (dashboardType === "superadmin" && companyId) {
          setSelectedCompany(Number(companyId));
        }

        fetchRekapWithParams(
          startD,
          endD,
          companyId ? Number(companyId) : undefined
        );
      }
    }, []);

    const HighlightStat = ({
      text,
      mainBg,
      subBg,
    }: {
      text: string;
      mainBg: string;
      subBg: string;
    }) => {

      if (text.startsWith("Tidak")) {
        return (
          <span className="
            inline-block
            px-3 py-1
            rounded-full
            bg-gray-100
            text-gray-500
            text-xs
            font-medium
          ">
            {text}
          </span>
        );
      }

      const [main, sub] = text.split("\n");

      return (
        <div className="flex flex-col gap-1 items-start">
          
          {/* MAIN BADGE */}
          <span className={`
            px-3 py-1
            rounded-full
            text-xs
            font-semibold
            ${mainBg}
          `}>
            {main}
          </span>

          {/* SUB BADGE */}
          {sub && (
            <span className={`
              px-2 py-0.5
              rounded-full
              text-[11px]
              font-medium
              ${subBg}
            `}>
              {sub}
            </span>
          )}
        </div>
      );
    };



  // EFFECT
  useEffect(() => {
    if (dashboardType === "superadmin") {
      fetchCompanies();
    }
  }, []);

  // TABLE COLUMNS
  const columns: Column<RekapSummary>[] = [
    { header: "Nama Pegawai", accessor: "nama_pegawai" },
    { header: "Total Cuti", cell: r => `${r.total_cuti} x` },
    { header: "Total Izin Masuk", cell: r => `${r.total_izin_masuk} x` },
    { header: "Total Sakit", cell: r => `${r.total_sakit} x` },
    { header: "Total Izin Telat", cell: r => `${r.total_izin_telat} x` },
    { header: "Total Izin Pulang Cepat", cell: r => `${r.total_izin_pulang_cepat} x` },
    { header: "Total Hadir", accessor: "total_hadir" },
    { header: "Total Alfa", cell: r => `${r.total_alfa} x` },
    { header: "Total Libur", cell: r => `${r.total_libur} x` },
    {
      header: "Total Telat",
      width: "130px",
      cell: r => (
        <HighlightStat
          text={r.total_telat}
          mainBg=" bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
          subBg=" bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
        />
      )
    },
    {
      header: "Total Pulang Cepat",
      width: "130px",
      cell: r => (
        <HighlightStat
          text={r.total_pulang_cepat}
          mainBg=" bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
          subBg=" bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
        />
      )
    },
    {
      header: "Total Lembur",
      cell: r => (
        <HighlightStat
          text={r.total_lembur}
          mainBg="bg-blue-100 text-blue-700"
          subBg="bg-blue-50 text-blue-600"
        />
      )
    },
    {
      header: "Persentase Kehadiran",
      cell: r => `${r.persentase_kehadiran} %`
    },
    {
      header: "Action",
      cell: r => (
        <div className="flex gap-3">
          <button
            onClick={() => handleExportPegawai(r)}
            className=" px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700
                    dark:bg-green-500 dark:hover:bg-green-600"
          >
            <Printer size={18} />
          </button>

        {/* TOMBOL HITUNG GAJI */}
        {!r.has_payroll && (
          <button
            onClick={() =>
              navigate(
                `/hitung-gaji/${r.pegawai_id}?start_date=${formatDate(startDate!)}
                &end_date=${formatDate(endDate!)}&persentase=${r.persentase_kehadiran}`
              )
            }
            className="px-4 py-2 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700"
            title="Hitung Gaji"
          >
            <Wallet size={18} />
          </button>
        )}

        </div>
      )
    }
  ];

  // EXPORT REKAP
  const handleExportRekap = () => {
    if (!startDate || !endDate) {
      return Swal.fire("Error", "Tanggal belum lengkap", "warning");
    }

    Swal.fire({
      title: "Export Detail",
      text: "Pilih format export",
      icon: "question",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Excel",
      denyButtonText: "PDF",
      cancelButtonText: "Batal",
      confirmButtonColor: "#16a34a",
      denyButtonColor: "#dc2626",
    }).then((result) => {
      if (result.isConfirmed) {
        exportRekapExcel();
      } else if (result.isDenied) {
        exportRekapPdf();
      }
    });
  };


  const exportRekapExcel = async () => {
    const res = await api.get("/rekap-absensi/export-summary", {
      params: {
        start_date: formatDate(startDate!),
        end_date: formatDate(endDate!),
        company_id: selectedCompany || undefined,
      },
      responseType: "blob",
    });

    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rekap-absensi-summary.xlsx";
    a.click();
  };

  const exportRekapPdf = async () => {
    const res = await api.get("/rekap-absensi/export-rekap-pdf", {
      params: {
        start_date: formatDate(startDate!),
        end_date: formatDate(endDate!),
        company_id: selectedCompany || undefined,
      },
      responseType: "blob",
    });

    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "rekap-absensi-summary.pdf";
    a.click();
  };


  // EXPORT DETAIL
  const handleExportAll = () => {
    if (!startDate || !endDate) {
      return Swal.fire("Error", "Tanggal belum lengkap", "warning");
    }

    Swal.fire({
      title: "Export Detail",
      text: "Pilih format export",
      icon: "question",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Excel",
      denyButtonText: "PDF",
      cancelButtonText: "Batal",
      confirmButtonColor: "#16a34a",
      denyButtonColor: "#dc2626",
    }).then((result) => {
      if (result.isConfirmed) {
        exportExcelAll();
      } else if (result.isDenied) {
        exportPdfAll();
      }
    });
  };

  const exportExcelAll = async () => {
    const res = await api.get("/rekap-absensi/export", {
      params: {
        start_date: formatDate(startDate!),
        end_date: formatDate(endDate!),
        company_id: selectedCompany || undefined,
      },
      responseType: "blob",
    });

    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rekap-absensi-detail.xlsx";
    a.click();
  };

  const exportPdfAll = async () => {
    const res = await api.get("/rekap-absensi/export-pdf", {
      params: {
        start_date: formatDate(startDate!),
        end_date: formatDate(endDate!),
        company_id: selectedCompany || undefined,
      },
      responseType: "blob",
    });

    const blob = new Blob([res.data], {
      type: "application/pdf",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rekap-absensi-detail.pdf";
    a.click();
  };

  const handleExportPopup = async () => {
    const result = await Swal.fire({
      title: "Export Detail Absensi",
      text: "Pilih format export",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "📊 Excel",
      cancelButtonText: "📄 PDF",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      // EXCEL
      handleExportAll();
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      // PDF
      handleExportPdf();
    }
  };

  const handleExportPdf = async () => {
    if (!startDate || !endDate) {
      return Swal.fire("Error", "Tanggal belum lengkap", "warning");
    }

    try {
      const res = await api.get("/rekap-absensi/export-pdf", {
        params: {
          start_date: formatDate(startDate),
          end_date: formatDate(endDate),
          company_id: selectedCompany || undefined,
        },
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rekap-absensi-detail.pdf";
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      Swal.fire("Error", "Gagal export PDF", "error");
    }
  };

  const handleExportPegawai = async (pegawai: RekapSummary) => {
    if (!startDate || !endDate) {
      return Swal.fire("Error", "Tanggal belum lengkap", "warning");
    }

    try {
      const res = await api.get("/rekap-absensi/export", {
        params: {
          start_date: formatDate(startDate),
          end_date: formatDate(endDate),
          pegawai_id: pegawai.pegawai_id, // ⬅️ KUNCI
        },
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rekap-absensi-${pegawai.nama_pegawai}.xlsx`;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      Swal.fire("Error", "Gagal export pegawai", "error");
    }
  };

  const fetchRekapWithParams = async (
    start: Date,
    end: Date,
    companyId?: number
  ) => {
    setViewState("loading");

    try {
      const params: any = {
        start_date: formatDate(start),
        end_date: formatDate(end),
      };

      if (dashboardType === "superadmin" && companyId) {
        params.company_id = companyId;
      }

      const res = await api.get("/rekap-absensi/summary", { params });
      setData(res.data.data);
      setViewState("result");
    } catch {
      Swal.fire("Error", "Gagal mengambil data rekap", "error");
      setViewState("form");
    }
  };


  // USER INTERFACE
  return (
    <>
      <PageMeta title="Rekap Absensi" description="Rekap Data Absensi" />
      <PageHeader
        pageTitle="Rekap Data Absensi"
        titleClass="text-[32px] dark:text-white"
      />

      <div className="space-y-6">

        {/* ================= FORM ================= */}
        {viewState === "form" && (
          <ComponentCard title="Filter Rekap Absensi">
            <div className="space-y-5">
              {dashboardType === "superadmin" && (
                <div className="flex flex-col">
                    <label className="text-xl-700 dark:text-gray-200">Company</label>
                    <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(Number(e.target.value))}
                    className=" border px-3 py-2 rounded-lg bg-white dark:bg-gray-700
                    text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    >
                    <option value="">Pilih Company</option>
                    {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                        {c.name}
                        </option>
                    ))}
                    </select>
                </div>
            )}
              <div className="flex flex-col">
                <label className="text-gray-700 dark:text-gray-200">Tanggal Mulai</label>
                <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Pilih tanggal mulai"
                    className=" border px-3 py-2 rounded-lg bg-white dark:bg-gray-700
                    text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"                
                    maxDate={endDate || undefined}
                />
             </div>

              <div className="flex flex-col">
                <label className="text-gray-700 dark:text-gray-200">Tanggal Akhir</label>
                <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Pilih tanggal akhir"
                    className=" border px-3 py-2 rounded-lg bg-white dark:bg-gray-700
                    text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    minDate={startDate || undefined}
                />
                </div>
                
              <button
                onClick={fetchRekap}
                className="
                    w-full
                    bg-gradient-to-r from-blue-600 to-blue-500
                    hover:from-blue-700 hover:to-blue-600
                    text-white font-semibold
                    py-3 rounded-xl
                    shadow-md hover:shadow-lg
                    transition-all duration-200
                    flex items-center justify-center gap-2
                "
                >
                 Tampilkan Rekap Absensi
                </button>
            </div>
          </ComponentCard>
        )}

        {/* ================= LOADING ================= */}
        {viewState === "loading" && (
          <ComponentCard className="dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-col items-center py-12 gap-4">
              <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-600"></div>
              <p className="text-gray-600 font-medium">
                Memuat rekap absensi...
              </p>
            </div>
          </ComponentCard>
        )}

        {/* ================= RESULT ================= */}
        {viewState === "result" && (
          <>
            <ComponentCard className="dark:bg-gray-800 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl dark:text-gray-200">
                  Rekap Data Absensi
                </h2>

                <div className="flex gap-3">
                 <button
                    onClick={handleExportAll}
                    className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700
                    dark:bg-blue-500 dark:hover:bg-blue-600">
                    Export Details
                  </button>

                  <button 
                  onClick={handleExportRekap}
                  className="px-4 py-2 rounded-lg text-white bg-purple-600 hover:bg-purple-700
                  dark:bg-purple-500 dark:hover:bg-purple-600">
                    Export Rekap
                  </button>
                  <button
                    onClick={() => {
                      setViewState("form");
                      setSearchParams({});
                    }}
                    className="px-4 py-2 rounded-lg text-white bg-green-600"
                  >
                    Back
                  </button>

                </div>
              </div>
            </ComponentCard>

            <ComponentCard className="dark:bg-gray-800 dark:border-gray-700">
              <div className="flex gap-6">
                <DatePicker
                    selected={startDate}
                    dateFormat="yyyy-MM-dd"
                    disabled
                    className="bg-gray-100 px-4 py-2 rounded-lg"
                    />

                    <DatePicker
                    selected={endDate}
                    dateFormat="yyyy-MM-dd"
                    disabled
                    className="bg-gray-100 px-4 py-2 rounded-lg"
                />

              </div>
            </ComponentCard>

            <ComponentCard className=" overflow-x-auto [&_tr:hover]:bg-white [&_tr:hover]:text-gray-900
            dark:[&_tr:hover]:bg-gray-800 dark:[&_tr:hover]:text-gray-100 [&_input]:bg-white [&_input]:text-gray-900
            dark:[&_input]:bg-gray-800 dark:[&_input]:text-gray-100 dark:[&_table]:bg-gray-900 dark:[&_table]:text-gray-100
            dark:[&_thead]:bg-gray-800 dark:[&_th]:bg-gray-800 dark:[&_th]:text-gray-100 dark:[&_tr]:border-gray-700
            dark:[&_td]:border-gray-700 [&_tr]:transition-colors">
              <DataTable columns={columns} data={data} />
            </ComponentCard>
          </>
        )}

      </div>
    </>
  );
}
