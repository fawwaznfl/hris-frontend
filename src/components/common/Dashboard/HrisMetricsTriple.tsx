import { useEffect, useState } from "react";
import { ClockAlert, LogOut, Banknote } from "lucide-react";
import api from "../../../api/axios";

export default function HrisMetrics() {
    const [time, setTime] = useState(new Date());
    const [totalTelat, setTotalTelat] = useState(0);
    const [totalPulang, setTotalPulang] = useState(0);
    const [bulan, setBulan] = useState("");

    useEffect(() => {
    api.get("/dashboard/metrics")
      .then(res => {
        setTotalTelat(res.data.telat_bulan_ini);
        setTotalPulang(res.data.pulang_bulan_ini);
      })
      .catch(() => {
        setTotalTelat(0);
        setTotalPulang(0);
      });
  }, []);
    
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


  // USER INTERFACE
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">

      {/* <!-- Metric Item Start --> */}
      <div className=" rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03]
              transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-blue-300
              dark:hover:border-blue-500 cursor-pointer">
        <div className="flex items-center gap-3 md:gap-4">
        {/* ICON */}
        <div className="flex items-center justify-center rounded-full bg-yellow-100 h-10 w-10 md:h-16 md:w-16">
            <ClockAlert className="h-5 w-5 md:h-8 md:w-8 text-yellow-600" />
        </div>
            {/* TEXT */}
            <div className="min-w-0">
            <p className=" font-semibold text-gray-700 dark:text-gray-300 text-sm md:text-lg truncate">
                Izin Telat
            </p>
            <p className=" mt-0.5 md:mt-1 font-bold text-gray-900 dark:text-white text-xl md:text-3xl">
                {totalTelat}
            </p>
            </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className=" rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03]
              transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-blue-300
              dark:hover:border-blue-500 cursor-pointer">
        <div className="flex items-center gap-3 md:gap-4">
        {/* ICON */}
        <div className="flex items-center justify-center rounded-full bg-orange-100 h-10 w-10 md:h-16 md:w-16">
            <LogOut className="h-5 w-5 md:h-8 md:w-8 text-orange-600" />
        </div>

            {/* TEXT */}
            <div className="min-w-0">
            <p className=" font-semibold text-gray-700 dark:text-gray-300 text-sm md:text-lg truncate">
                Izin Pulang Cepat
            </p>
            <p className=" mt-0.5 md:mt-1 font-bold text-gray-900 dark:text-white text-xl md:text-3xl">
                {totalPulang}
            </p>
            </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div
            className="col-span-2 md:col-span-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 md:px-6 md:py-5
            dark:border-gray-800 dark:bg-white/[0.03]
            transition-all duration-300 ease-out
            hover:-translate-y-1 hover:shadow-lg hover:border-blue-300
            dark:hover:border-blue-500 cursor-pointer"
        >
        <div className="flex items-center gap-3 md:gap-4">
            
            {/* ICON */}
            <div className="flex items-center justify-center rounded-full bg-emerald-100 h-10 w-10 md:h-16 md:w-16">
                <Banknote className="h-5 w-5 md:h-8 md:w-8 text-emerald-600" />
            </div>

            {/* TEXT */}
            <div className="min-w-0">
            <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm md:text-lg">
                Payroll {currentMonthYear}
            </p>

            <p className="mt-0.5 md:mt-1 font-bold text-gray-900 dark:text-white text-xl md:text-3xl">
                14
            </p>
            </div>
        </div>
        </div>
      {/* <!-- Metric Item End --> */}
      
    </div>
  );
}
