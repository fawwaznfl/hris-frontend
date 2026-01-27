import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getNotifications, markAsRead } from "../../api/notification";
import PageHeader from "../../PageHeader";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import { markAllAsRead } from "../../api/notification";


export default function Notification() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const hasUnread = notifications.some(n => !n.read_at);

  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Gagal mengambil notifikasi", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleClick = async (item: any) => {
    if (!item.read_at) {
      await markAsRead(item.id);
      fetchNotifications();
    }

    const notifType = item.notification.type;
    const data = item.notification.data;

    // Navigation berdasarkan type
    switch (notifType) {
        // Admin & Superadmin
      case "contract_expiring":
        navigate(`/kontrak/${data.kontrak_id}`);
        break;
      case "request_shift_submitted":
        navigate(`/shift-request-approval`);
        break;
      case "cuti_submitted":
        navigate(`/cuti`);
        break;
      case "lembur_submitted":
        navigate(`/data-lembur`);
        break;
      case "reimbursement_submitted":
        navigate(`/reimbursement`);
        break;
      case "kasbon_submitted":
        navigate(`/kasbon`);
        break;
      // Pegawai baru dibuat (untuk superadmin)
      case "new_employee_created":
        navigate(`/pegawai`);
        break;
    // Pegawai di-assign ke company (untuk admin)
      case "new_employee_assigned":
        navigate(`/pegawai`);
        break;

    // Pegawai
      case "meeting_created":
        //navigate(`/rapat/${data.meeting_id}`);
        break;
      case "cuti_approved":
      case "cuti_rejected":
        navigate(`/cuti-izin`);
        break;
      case "lembur_approved":
      case "lembur_rejected":
        navigate(`/history-lembur/${data.pegawai_id}`);
        break;
      case "reimbursement_approved":
      case "reimbursement_rejected":
        navigate(`/reimbursement-pegawai`);
        break;
      case "kasbon_approved":
      case "kasbon_rejected":
        navigate(`/kaskasbon-pegawaibon`);
        break;
      case "request_shift_approved":
      case "request_shift_rejected":
        navigate(`/shift-mapping/self/${data.pegawai_id}`);
        break;
      case "contract_expiring_personal":
        //navigate(`/kontrak`);
        break;
    }
  };

  // USER INTERFACE
  return (
    <>
      <PageMeta
        title="Notification"
        description="Notifikasi dashboard admin dan dashboard superadmin"
      />
      <PageHeader
        pageTitle="Notifications"
        rightContent={
          <button
            onClick={async () => {
              await markAllAsRead();
              fetchNotifications();
            }}
            disabled={!hasUnread}
            className={`text-sm px-4 py-2 rounded-lg transition
              ${hasUnread
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            Tandai semua dibaca
          </button>
        }
      />



      <ComponentCard>
        {loading && (
          <div className="p-4 text-gray-500 dark:text-gray-400">Loading...</div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="p-4 text-gray-500">
            Tidak ada notifikasi
          </div>
        )}

        {!loading && notifications.length > 0 && (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((item) => (
              <li
                key={item.id}
                onClick={() => handleClick(item)}
                className={`p-4 cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-700
                ${
                    !item.read_at
                    ? "bg-blue-50 dark:bg-gray-700 border-l-4 border-blue-500"
                    : "bg-white dark:bg-gray-800"
                }`}

              >
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {item.notification.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {item.notification.message}
                </p>
                <small className="text-gray-400 dark:text-gray-500 mt-2 block">
                  {new Date(item.created_at).toLocaleString('id-ID')}
                </small>
              </li>
            ))}
          </ul>
        )}
      </ComponentCard>
    </>
  );
}