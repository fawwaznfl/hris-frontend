import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";
import BottomNav from "../../../components/common/BottomNav";
import api from "../../../api/axios";

export default function NotificationPegawai() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      //console.log("Notifikasi pegawai:", res.data);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ✅ Klik untuk mark as read
  const handleClick = async (item: any) => {
    console.log("Item clicked:", item);
    
    // Cek apakah ini notifikasi personal (punya user_id)
    const isPersonalNotification = item.user_id != null;
    
    // Cek apakah sudah dibaca (gunakan is_read dari backend)
    const isUnread = !item.is_read && !item.read_at;
    
    if (isUnread && isPersonalNotification) {
      // ✅ OPTIMISTIC UPDATE: Update UI dulu
      setItems(prevItems =>
        prevItems.map(i =>
          i.id === item.id 
            ? { ...i, is_read: true, read_at: new Date().toISOString() } 
            : i
        )
      );

      // Kirim request ke backend
      try {
        await api.post(`/notifications/${item.id}/read`);
      } catch (err) {
        console.error("Gagal mark as read:", err);
        // Rollback jika gagal
        fetchNotifications();
      }
    } else if (!isPersonalNotification) {
      console.log("Notifikasi broadcast, tidak bisa di-mark as read");
    }
  };

  // USER INTERFACE
  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* ================= HEADER ================= */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 pb-10 rounded-b-[32px] shadow-lg pt-8">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/home-pegawai")}
            className="p-2 mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold">Notifikasi</h1>
          </div>

          <Bell className="w-5 h-5 opacity-80" />
        </div>
      </div>

      {/* ================= INFO CARD ================= */}
      <div className="mx-5 -mt-10">
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-800">
            {items.filter((i) => !i.is_read && !i.read_at).length} notifikasi belum dibaca
          </p>
          <p className="text-xs text-gray-400">
            Ketuk notifikasi untuk menandai sebagai dibaca
          </p>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="px-5 mt-5 space-y-3">
        {loading && (
          <div className="text-center text-gray-400 py-10">
            Memuat notifikasi...
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center text-gray-400 py-10">
            Tidak ada notifikasi
          </div>
        )}

        {items.map((item) => {
          const unread = !item.is_read && !item.read_at;
          const notif = item.notification;

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className={`w-full text-left p-4 rounded-2xl shadow-sm border transition
                ${unread
                  ? "bg-indigo-50 border-indigo-200"
                  : "bg-white border-gray-100 hover:bg-gray-50"}
              `}
            >
              <div className="flex gap-3">
                {/* Icon berdasarkan status */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                    ${unread ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"}
                  `}
                >
                  {notif?.type?.includes("approved") ? (
                    <span className="text-lg">✓</span>
                  ) : notif?.type?.includes("rejected") ? (
                    <span className="text-lg">✗</span>
                  ) : notif?.type?.includes("meeting") ? (
                    <span className="text-lg">📅</span>
                  ) : notif?.type?.includes("contract") ? (
                    <span className="text-lg">📄</span>
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {notif?.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {notif?.message}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {new Date(item.created_at).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {unread && (
                  <span className="w-2 h-2 mt-1 rounded-full bg-indigo-500 shrink-0"></span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}