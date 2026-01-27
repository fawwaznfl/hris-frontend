import PageMeta from "../../components/common/PageMeta";
import DashboardHeader from "../../components/common/Dashboard/DashboardHeader";
import HrisMetrics from "../../components/common/Dashboard/HrisMetrics";
import HrisMetricsTriple from "../../components/common/Dashboard/HrisMetricsTriple";
import HrisMetricsDouble from "../../components/common/Dashboard/HrisMetricsDouble";
import AttendanceCalendar from "../../components/common/Dashboard/AttendanceCalendar";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Absensi"
        description=""
      />
      <DashboardHeader />

      <div className="space-y-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <HrisMetrics />
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-7">
          <HrisMetricsTriple />
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-7">
          <HrisMetricsDouble />
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-7">
          <AttendanceCalendar />
        </div>
      </div>
    </>
  );
}
