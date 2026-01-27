import { CalendarDays, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardHeader() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedDate = time.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const formattedTime = time.toLocaleTimeString("en-GB");

  const currentMonthYear = time.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="
        mb-6 rounded-2xl bg-white p-6
        shadow-sm transition-all duration-300
        hover:-translate-y-1 hover:shadow-lg
        dark:bg-gray-900 dark:shadow-gray-800/50
      "
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* LEFT */}
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Dashboard Kehadiran – {currentMonthYear}
        </h1>

        {/* RIGHT */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-indigo-500 hover:shadow-md">
            <CalendarDays size={18} />
            {formattedDate}
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-sky-400 hover:shadow-md">
            <Clock size={18} />
            {formattedTime}
          </div>
        </div>
      </div>
    </div>
  );
}
