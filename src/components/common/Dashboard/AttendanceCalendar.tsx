import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import api from "../../../api/axios";
import { useEffect, useState } from "react";
import { EventInput } from "@fullcalendar/core";


export default function AttendanceCalendar() {

  const [events, setEvents] = useState<EventInput[]>([]);

  useEffect(() => {
    Promise.all([
      api.get("/calendar/birthdays", { params: { year: 2026 } }),
      api.get("/calendar/sakit", { params: { year: 2026 } }),
      api.get("/calendar/cuti", { params: { year: 2026 } }),
      api.get("/calendar/izin", { params: { year: 2026 } }),
      api.get("/calendar/telat", { params: { year: 2026 } }),
      api.get("/calendar/pulang", { params: { year: 2026 } }),

    ]).then(([birthdayRes, sakitRes, cutiRes, izinRes, telatRes, pulangRes]) => {
      setEvents([
        ...birthdayRes.data,
        ...sakitRes.data,
        ...cutiRes.data,
        ...izinRes.data,
        ...telatRes.data,
        ...pulangRes.data,
      ]);
    });
  }, []);



  // USER INTERFACE
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-700
                overflow-hidden">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold text-blue-600">
          Kalender Kehadiran – January 2026
        </h2>

        {/* LEGEND */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-md bg-pink-500 px-2 py-1 text-white">
            Ulang Tahun
          </span>
          <span className="rounded-md bg-yellow-500 px-2 py-1 text-white">
            Sakit
          </span>
          <span className="rounded-md bg-blue-500 px-2 py-1 text-white">
            Cuti
          </span>
          <span className="rounded-md bg-cyan-500 px-2 py-1 text-white">
            Izin
          </span>
          <span className="rounded-md bg-green-500 px-2 py-1 text-white">
            Izin Telat
          </span>
          <span className="rounded-md bg-amber-400 px-2 py-1 text-white">
            Izin Pulang Cepat
          </span>
        </div>
      </div>

      {/* CALENDAR */}
      <FullCalendar
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          listPlugin,
          interactionPlugin,
        ]}
        initialView="dayGridMonth"
        initialDate="2026-01-01"
        height="auto"
        events={events}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
        }}
        dayMaxEvents={true}
        eventDisplay="block"
      />
    </div>
  );
}
