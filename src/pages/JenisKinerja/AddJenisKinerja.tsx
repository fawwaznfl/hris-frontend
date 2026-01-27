import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import Swal from "sweetalert2";
import Label from "../../components/form/Label";
import InputField from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";

export default function AddJenisKinerja() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const dashboardType = user.dashboard_type;
    const userCompanyId = user.company_id;

    const [companies, setCompanies] = useState<any[]>([]);
    const [companyId, setCompanyId] = useState(
        dashboardType === "admin" ? String(userCompanyId) : ""
        );

    const [nama, setNama] = useState("");
    const [bobot, setBobot] = useState("");
    const [detail, setDetail] = useState("");
    const [loading, setLoading] = useState(true);

    // Fetch companies (SAMA KAYA AddShift)
    const fetchCompanies = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await api.get("/companies", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCompanies(res.data.data || []);
        } catch (error) {
            console.error("Error fetching companies:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            await api.post(
            "/jenis-kinerja",
            {
                company_id: companyId,
                nama: nama,
                bobot_penilaian: bobot,
                detail: detail || null,
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );


            Swal.fire("Berhasil!", "Jenis kinerja berhasil ditambahkan.", "success");
            navigate("/jenis-kinerja");
        } catch (err) {
            console.error("Error adding jenis kinerja:", err);
            Swal.fire("Gagal", "Terjadi kesalahan saat menambahkan data.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageMeta title="Tambah Jenis Kinerja" description="Tambah Jenis Kinerja" />
            <PageHeader
                pageTitle="Tambah Jenis Kinerja"
                titleClass="text-[32px] dark:text-white"
                rightContent={
                    <button
                        onClick={() => navigate("/jenis-kinerja")}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-5 py-2 rounded-xl"
                    >
                        ⬅ Back
                    </button>
                }
            />

            <ComponentCard>
                {loading ? (
                    <p className="text-gray-700 dark:text-gray-300">Loading...</p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Company */}
                        {dashboardType === "superadmin" && (
                        <div>
                            <Label>Company <span className="text-red-500">*</span></Label>
                            <select
                            value={companyId}
                            onChange={(e) => setCompanyId(e.target.value)}
                            className="border px-3 py-2 rounded-lg w-full dark:bg-gray-700 dark:text-white"
                            required
                            >
                            <option value="">Pilih Company</option>
                            {companies.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                            </select>
                        </div>
                        )}

                        {/* ADMIN → tidak tampilkan dropdown, tetapi kirim hidden input */}
                        {dashboardType === "admin" && (
                        <input type="hidden" name="company_id" value={companyId} />
                        )}


                        {/* Nama Jenis Kinerja */}
                        <div>
                            <Label>Nama Jenis Kinerja <span className="text-red-500">*</span></Label>
                            <InputField
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                                placeholder="Masukkan nama jenis kinerja"
                                required
                            />
                        </div>

                        {/* Bobot */}
                        <div>
                            <Label>Bobot Penilaian (%) <span className="text-red-500">*</span></Label>
                           <InputField
                                type="number"
                                min="-100"
                                max="100"
                                value={bobot}
                                onChange={(e) => setBobot(e.target.value)}
                                placeholder="Contoh: -10 atau 20"
                                required
                            />
                        </div>

                        {/* Detail */}
                        <div>
                            <Label>Detail</Label>
                            <TextArea
                                rows={3}
                                value={detail}
                                onChange={(v) => setDetail(v)}
                                placeholder="Tambahkan detail (opsional)"
                            />
                        </div>

                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Simpan
                        </button>
                    </form>
                )}
            </ComponentCard>
        </>
    );
}
