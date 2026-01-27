import { Wallet, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../../api/axios";

export default function HrisMetricsDouble() {
  const [time, setTime] = useState(new Date());
  const [totalKasbon, setTotalKasbon] = useState(0);
  const [totalReimbursement, setTotalReimbursement] = useState(0);

  useEffect(() => {
  api.get("/dashboard/metrics")
    .then(res => {
      setTotalKasbon(res.data.kasbon_bulan_ini ?? 0);
      setTotalReimbursement(res.data.reimbursement_bulan_ini ?? 0);
    })
    .catch(() => {
      setTotalKasbon(0);
      setTotalReimbursement(0);
    });
}, []);

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);



  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentMonthYear = time.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="grid grid-cols-2 gap-4 md:gap-6">
      
      {/* KASBON */}
      <div
        className="
          group
          rounded-2xl border border-gray-200 bg-white
          px-4 py-3 md:px-6 md:py-5
          dark:border-gray-800 dark:bg-white/[0.03]

          transition-all duration-300 ease-out
          hover:-translate-y-1
          hover:shadow-lg
          hover:border-green-300
          dark:hover:border-green-500
          cursor-pointer
        "
      >
        <div className="flex items-center gap-3 md:gap-4">
          {/* ICON */}
          <div
            className="
              flex items-center justify-center rounded-full
              bg-green-100
              h-10 w-10 md:h-16 md:w-16

              transition-transform duration-300
              group-hover:scale-110
            "
          >
            <Wallet className="h-5 w-5 md:h-8 md:w-8 text-green-600" />
          </div>

          {/* TEXT */}
          <div className="min-w-0">
            <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm md:text-lg truncate">
              Kasbon {currentMonthYear}
            </p>
            <p className=" font-bold text-gray-900 dark:text-white text-lg sm:text-xl md:text-2xl lg:text-3xl">
              {formatRupiah(totalKasbon)}
            </p>
          </div>
        </div>
      </div>

      {/* REIMBURSEMENT */}
      <div
        className="
          group
          rounded-2xl border border-gray-200 bg-white
          px-4 py-3 md:px-6 md:py-5
          dark:border-gray-800 dark:bg-white/[0.03]

          transition-all duration-300 ease-out
          hover:-translate-y-1
          hover:shadow-lg
          hover:border-purple-300
          dark:hover:border-purple-500
          cursor-pointer
        "
      >
        <div className="flex items-center gap-3 md:gap-4">
          {/* ICON */}
          <div
            className="
              flex items-center justify-center rounded-full
              bg-purple-100
              h-10 w-10 md:h-16 md:w-16

              transition-transform duration-300
              group-hover:scale-110
            "
          >
            <Receipt className="h-5 w-5 md:h-8 md:w-8 text-purple-600" />
          </div>

          {/* TEXT */}
          <div className="min-w-0">
            <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm md:text-lg truncate">
              Reimbursement {currentMonthYear}
            </p>
            <p className="font-bold text-gray-900 dark:text-white text-xl md:text-3xl">
              {formatRupiah(totalReimbursement)}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
