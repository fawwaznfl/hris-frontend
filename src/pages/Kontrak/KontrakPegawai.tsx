import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import { DataTable, Column } from "../../components/common/DataTable";
import api from "../../api/axios";
import { useNavigate } from "react-router";
import "react-datepicker/dist/react-datepicker.css";
import { Download, Eye } from "lucide-react";
import { useParams } from "react-router-dom";

interface KontrakPegawai {
  id: number;
  jenis_kontrak: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  keterangan?: string;
  file_kontrak?: string;
  pegawai?: {
    id: number;
    name: string;
     company_id?: number;
  };
}

export default function KontrakPegawai() {
    const [selectedPegawaiId, setSelectedPegawaiId] = useState<number | "">("");
    const { pegawaiId } = useParams<{ pegawaiId: string }>();
    const [pegawaiName, setPegawaiName] = useState<string>("");
    const [endDate] = useState<Date | null>(null);
    const navigate = useNavigate();
    const [kontraks, setKontraks] = useState<KontrakPegawai[]>([]);
    const [loading, setLoading] = useState(true);
    const dashboardType = localStorage.getItem("dashboard_type");

    const fetchKontraks = async (pegawaiId?: number | "") => {
    try {
        const token = localStorage.getItem("token");
        const userCompany = localStorage.getItem("company_id");

        const params: any = {};

        if (dashboardType === "admin") {
        params.company_id = userCompany;
        }

        if (pegawaiId) {
        params.pegawai_id = pegawaiId;
        }

        const res = await api.get("/kontrak", {
        headers: { Authorization: `Bearer ${token}` },
        params,
        });

        const data = res.data.data;
        setKontraks(data);

        // ✅ ambil nama pegawai dari kontrak pertama
        if (data.length > 0 && data[0].pegawai?.name) {
        setPegawaiName(data[0].pegawai.name);
        }
    } catch (err) {
        console.error("Error fetching kontraks:", err);
    } finally {
        setLoading(false);
    }
  };


  useEffect(() => {
    if (pegawaiId) {
        setSelectedPegawaiId(Number(pegawaiId));
    }
    }, [pegawaiId]);


  useEffect(() => {
    if (selectedPegawaiId) {
        fetchKontraks(selectedPegawaiId);
    }
    }, [selectedPegawaiId]);


  const columns: Column<KontrakPegawai>[] = [
    { header: "No", accessor: "id", cell: (_, index) => index + 1, width: "60px" },
    { header: "Nama Pegawai", accessor: "pegawai", cell: (row) => row.pegawai?.name || "-" },
    { header: "Jenis Kontrak", accessor: "jenis_kontrak" },
    { header: "Tanggal Mulai", accessor: "tanggal_mulai" },
    { header: "Tanggal Selesai", accessor: "tanggal_selesai" },
    { header: "Keterangan", accessor: "keterangan", cell: (row) => row.keterangan || "-" },

    {
      header: "File",
      accessor: "file_kontrak",
      cell: (row) =>
        row.file_kontrak ? (
          <div className="flex gap-2">
            <button
              onClick={() => window.open(`${row.file_kontrak}`, "_blank")}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded flex items-center justify-center"
            >
              <Eye size={16} />
            </button>

            <button
              onClick={() => {
                const link = document.createElement("a");
                link.href = `${row.file_kontrak}`;
                link.download = `Kontrak-${row.pegawai?.name ?? row.id}.pdf`;
                document.body.appendChild(link);
                link.click();
                link.remove();
              }}
              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded flex items-center justify-center"
            >
              <Download size={16} />
            </button>
          </div>
        ) : (
          "-"
        ),
    },
  ];

  // FILTER NAMA
  const filteredKontraks = kontraks.filter((k) => {
    const mulai = new Date(k.tanggal_mulai);
    const dateMatch =
        
        (!endDate || mulai <= endDate);

    return dateMatch
    });

    console.log("pegawaiId dari URL:", pegawaiId);
    console.log("selectedPegawaiId:", selectedPegawaiId);

  return (
    <>
      <PageMeta title="Kontrak" description="Daftar Kontrak" />
      <PageHeader
            pageTitle={`Kontrak Pegawai ${pegawaiName || ""}`}
            titleClass="text-[32px] dark:text-white"
            rightContent={
                <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => navigate("/add-kontrak")}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2 rounded-xl"
                >
                    Back
                </button>
                </div>
            }
        />

      <div className="space-y-5 sm:space-y-6 mt-4">
        <ComponentCard className="dark:bg-gray-800 dark:border-gray-700 p-0" >
          {loading ? (
            <p className="text-gray-700 dark:text-gray-300">Loading...</p>
          ) : (
            <div className="datatable-no-search">

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
              [&_tr]:transition-colors
            "
            >
                <DataTable columns={columns} data={filteredKontraks} disableSearch />
              </div>
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}

