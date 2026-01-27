import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageHeader from "../../PageHeader";
import ComponentCard from "../../components/common/ComponentCard";
import api from "../../api/axios";
import Swal from "sweetalert2";
import Label from "../../components/form/Label";
import InputField from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";

export default function EditJenisKinerja() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [companies, setCompanies] = useState([]);
    const [companyId, setCompanyId] = useState("");       // selalu string
    const [nama, setNama] = useState("");
    const [bobot, setBobot] = useState("");
    const [detail, setDetail] = useState("");             // tidak boleh undefined
    const [loading, setLoading] = useState(false);

    // Fetch companies
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await api.get("/companies");
                setCompanies(res.data.data || []);
            } catch (error) {
                console.error("Error fetching companies:", error);
            }
        };
        fetchCompanies();
    }, []);

    // Fetch data lama
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await api.get(`/jenis-kinerja/${id}`);
                const d = res.data.data;
                console.log("DATA JENIS KINERJA:", d);

                setCompanyId(String(d.company_id || ""));
                setNama(d.nama || "");
                setBobot(String(d.bobot_penilaian || ""));
                setDetail(d.detail || "");
            } catch (err) {
                console.error("Error fetching data:", err);
                Swal.fire("Error", "Data tidak ditemukan!", "error");
                navigate("/jenis-kinerja");
            }
        };

        if (id) fetchDetail();
    }, [id, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.put(`/jenis-kinerja/${id}`, {
                company_id: companyId,
                nama_jenis_kinerja: nama,
                bobot_penilaian: bobot,
                detail: detail || null,
            });

            Swal.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Jenis kinerja berhasil diperbarui.",
                confirmButtonColor: "#3085d6",
            }).then(() => navigate("/jenis-kinerja"));
        } catch (err) {
            console.error("Error updating:", err);
            Swal.fire("Gagal", "Terjadi kesalahan saat update.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageMeta title="Edit Jenis Kinerja" description="Edit Jenis Kinerja" />
            <PageHeader
                pageTitle="Edit Jenis Kinerja"
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
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* company */}
                    <div>
                        <Label>Company <span className="text-red-500">*</span></Label>
                        <select
                            value={companyId || ""}                 // fallback string
                            onChange={(e) => setCompanyId(e.target.value)}
                            required
                            className="w-full border px-3 py-2 rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                        >
                            <option value="">-- Pilih Company --</option>
                            {companies.map((c: any) => (
                                <option key={c.id} value={String(c.id)}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* nama */}
                    <div>
                        <Label>Nama Jenis Kinerja <span className="text-red-500">*</span></Label>
                        <InputField
                            value={nama || ""}
                            onChange={(e) => setNama(e.target.value)}
                            placeholder="Masukkan nama jenis kinerja"
                            required
                        />
                    </div>

                    {/* bobot */}
                    <div>
                        <Label>Bobot Penilaian (%) <span className="text-red-500">*</span></Label>
                        <InputField
                            type="number"
                            value={bobot || ""}
                            onChange={(e) => setBobot(e.target.value)}
                            placeholder="Contoh: 20"
                            required
                        />
                    </div>

                    {/* detail */}
                    <div>
                        <Label>Detail</Label>
                        <TextArea
                            rows={3}
                            value={detail}
                            onChange={(v: string) => setDetail(v)}
                            placeholder="Tambahkan detail (opsional)"
                        />

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        {loading ? "Menyimpan..." : "Update"}
                    </button>
                </form>
            </ComponentCard>
        </>
    );
}
