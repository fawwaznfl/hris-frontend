import { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Link, useNavigate } from "react-router";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
} from "../../api/notification";

import {
  Bell,
  FileText,
  CalendarClock,
  Users,
  Clock,
  Wallet,
} from "lucide-react";

const getNotifIcon = (type?: string) => {
  switch (type) {
    case "contract_expiring":
      return <FileText className="h-4 w-4 text-orange-500" />;
    case "request_shift_submitted":
      return <CalendarClock className="h-4 w-4 text-blue-500" />;
    case "cuti_submitted":
      return <CalendarClock className="h-4 w-4 text-green-500" />;
    case "lembur_submitted":
      return <Clock className="h-4 w-4 text-purple-500" />;
    case "reimbursement_submitted":
    case "kasbon_submitted":
      return <Wallet className="h-4 w-4 text-emerald-500" />;
    case "new_employee_created":
    case "new_employee_assigned":
      return <Users className="h-4 w-4 text-indigo-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-400" />;
  }
};

const formatTime = (date: string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));


export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      //console.log("Raw response:", res.data); // ✅ Debug
      
      const notifs = Array.isArray(res.data) ? res.data : [];
      //console.log("Processed notifications:", notifs); // ✅ Debug
      
      setNotifications(notifs);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data.unread ?? 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();
    
    const interval = setInterval(() => {
      fetchUnreadCount();
      if (isOpen) {
        fetchNotifications();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleClickNotif = async (item: any) => {
    if (!item.read_at) {
      await markAsRead(item.id);
      fetchUnreadCount();
      fetchNotifications();
    }

    const notifType = item.notification?.type;
    const data = item.notification?.data;

    if (!notifType) return;

    // Navigation berdasarkan type notifikasi
    switch (notifType) {

      // Admin & Superadmin
      case "contract_expiring":
        navigate(`/kontrak/${data.kontrak_id}`);
        break;
      case "request_shift_submitted":
        navigate(`/shift-request`); // sesuaikan route
        break;
      case "cuti_submitted":
        navigate(`/cuti`);
        break;
      case "lembur_submitted":
        navigate(`/lembur`);
        break;
      case "reimbursement_submitted":
        navigate(`/reimbursement`);
        break;
      case "kasbon_submitted":
        navigate(`/kasbon`);
        break;
      // pegawai baru dibuat (untuk superadmin)
      case "new_employee_created":
      navigate(`/pegawai`);
      break;
    // Pegawai di-assign ke company (untuk admin)
    case "new_employee_assigned":
      navigate(`/pegawai`);
      break;

    // Pegawai Notifications
    case "meeting_created":
      //navigate(`/rapat/${data.meeting_id}`); 
      break;
    case "cuti_approved":
      navigate(`/cuti-izin`); 
      break;
    case "cuti_rejected":
      navigate(`/cuti-izin`);
      break;
    case "lembur_approved":
      navigate(`/history-lembur/${data.pegawai_id}`);
      break;
    case "lembur_rejected":
      navigate(`/history-lembur/${data.pegawai_id}`);
      break;
    case "reimbursement_approved":
      navigate(`/reimbursement-pegawai`);
      break;
    case "reimbursement_rejected":
      navigate(`/reimbursement-pegawai`);
      break;
    case "kasbon_approved":
      navigate(`/kasbon-pegawai`);
      break;
    case "kasbon_rejected":
      navigate(`/kasbon-pegawai`);
      break;
    case "request_shift_approved":
      navigate(`/shift-mapping/self/${data.pegawai_id}`);
      break;
    case "request_shift_rejected":
      navigate(`/shift-mapping/self/${data.pegawai_id}`);
      break;
    case "contract_expiring_personal":
      //navigate(`/kontrak`); 
      break;
  }

    setIsOpen(false);
  };

  // USER INTERFACE
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className=" relative flex h-11 w-11 items-center justify-center rounded-full border bg-white hover:bg-gray-50
        dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition"

      >
        <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />

        {unreadCount > 0 && (
          <span className=" absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center 
          rounded-full bg-orange-500 text-xs font-semibold text-white ring-2 ring-white dark:ring-gray-800 ">

            {unreadCount}
          </span>
        )}
      </button>

      <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700">
          <h5 className="text-gray-900 dark:text-gray-100">Notification</h5>
          <span className="text-xs text-gray-400">
            {notifications.length} item
          </span>
        </div>

        <ul className="max-h-[360px] overflow-y-auto">
          {notifications.length === 0 && (
            <li className="p-6 text-sm text-center text-gray-500">
              Tidak ada notifikasi
            </li>
          )}

          {notifications.map((item) => {
            const notif = item.notification;
            const unread = !item.read_at;

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleClickNotif(item)}
                  className={`
                    w-full text-left px-4 py-3 border-b transition
                    border-gray-200 dark:border-gray-700
                    hover:bg-gray-50 dark:hover:bg-gray-700
                    ${unread
                      ? "bg-blue-50 dark:bg-gray-700"
                      : "bg-white dark:bg-gray-800"}
                  `}

                >
                  <div className="flex gap-3">
                    {/* ICON */}
                    <div className="mt-1">
                      {getNotifIcon(notif?.type)}
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <p className={`text-sm font-medium ${
                            unread
                              ? "text-gray-900 dark:text-gray-100"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >

                          {notif?.title}
                        </p>

                        {unread && (
                          <span className="mt-1 h-2 w-2 rounded-full bg-blue-500"></span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {notif?.message}
                      </p>

                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                        {formatTime(item.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <Link
          to="/notifications"
          className="block px-4 py-3 text-center text-sm font-medium text-blue-600 hover:bg-gray-50"
        >
          Lihat semua notifikasi
        </Link>
      </Dropdown>
    </div>
  );
}