import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../../icons"; 

import { CheckCircle, XCircle, CalendarOff, Clock, Calendar, HeartPulse, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../../api/axios";

export default function HrisMetrics() {
  const [totalPegawai, setTotalPegawai] = useState(0);
  const [totalLembur, setTotalLembur] = useState(0);
  const [totalAlfa, setTotalAlfa] = useState(0);
  const [totalLibur, setTotalLibur] = useState(0);
  const [bulan, setBulan] = useState("");
  const [totalCuti, setTotalCuti] = useState(0);
  const [totalSakit, setTotalSakit] = useState(0);
  const [totalIzin, setTotalIzin] = useState(0);
  const [totalTelat, setTotalTelat] = useState(0);

  const [totalHadir, setTotalHadir] = useState(0);




  useEffect(() => {
    api.get("/dashboard/metrics")
      .then(res => {
        setTotalPegawai(res.data.total_pegawai);
        setTotalHadir(res.data.hadir_bulan_ini);
        setTotalAlfa(res.data.alfa_bulan_ini);
        setTotalLibur(res.data.libur_bulan_ini);
        setTotalLembur(res.data.lembur_bulan_ini);
        setTotalCuti(res.data.cuti_bulan_ini);
        setTotalSakit(res.data.sakit_bulan_ini);
        setTotalIzin(res.data.izin_bulan_ini);
        setTotalTelat(res.data.telat_bulan_ini);
        setBulan(res.data.bulan);
      })
      .catch(() => {
        setTotalPegawai(0);
        setTotalLembur(0);
        setTotalCuti(0);
        setTotalSakit(0);
        setTotalIzin(0);
        setTotalTelat(0);
        setTotalAlfa(0);
        setTotalLibur(0);
      });
  }, []);


  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 md:gap-6">

      {/* <!-- Metric Item Start --> */}
      <div className=" rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03]
              transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-blue-300
              dark:hover:border-blue-500 cursor-pointer">

        <div className="flex items-center gap-3">
          {/* ICON */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <GroupIcon className="h-6 w-6 text-blue-600" />
          </div>

          {/* TEXT */}
          <div>
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Total Pegawai
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {totalPegawai}
            </p>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className=" rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03]
              transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-blue-300
              dark:hover:border-blue-500 cursor-pointer">
        <div className="flex items-center gap-3">
          {/* ICON */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>

          {/* TEXT */}
          <div>
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Masuk
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {totalHadir}
            </p>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className=" rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03]
              transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-blue-300
              dark:hover:border-blue-500 cursor-pointer">
        <div className="flex items-center gap-3">
          {/* ICON */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>

          {/* TEXT */}
          <div>
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Alfa
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {totalAlfa}
            </p>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className=" rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03]
              transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-blue-300
              dark:hover:border-blue-500 cursor-pointer">
        <div className="flex items-center gap-3">
          {/* ICON */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <CalendarOff className="h-6 w-6 text-slate-600" />
          </div>

          {/* TEXT */}
          <div>
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Libur
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {totalLibur}
            </p>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className=" rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03]
              transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-blue-300
              dark:hover:border-blue-500 cursor-pointer">
        <div className="flex items-center gap-3">
          {/* ICON */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <Clock className="h-6 w-6 text-purple-600" />
          </div>

          {/* TEXT */}
          <div>
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Lembur
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {totalLembur}
            </p>
          </div>
        </div>
      </div>

      {/* <!-- Metric Item Start --> */}
      <div className=" rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03]
              transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-blue-300
              dark:hover:border-blue-500 cursor-pointer">
        <div className="flex items-center gap-3">
          {/* ICON */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>

          {/* TEXT */}
          <div>
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Cuti
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {totalCuti}
            </p>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className=" rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03]
              transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-blue-300
              dark:hover:border-blue-500 cursor-pointer">
        <div className="flex items-center gap-3">
          {/* ICON */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
            <HeartPulse className="h-6 w-6 text-rose-600" />
          </div>

          {/* TEXT */}
          <div>
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Sakit
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {totalSakit}
            </p>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className=" rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03]
              transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-blue-300
              dark:hover:border-blue-500 cursor-pointer">
        <div className="flex items-center gap-3">
          {/* ICON */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <FileText className="h-6 w-6 text-amber-600" />
          </div>


          {/* TEXT */}
          <div>
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Izin
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {totalIzin}
            </p>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      
    </div>
  );
}
