import { useEffect, useState } from "react";

import DashboardCard from "../../components/common/DashboardCard";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import dashboardService from "../../services/dashboardService";

export default function Dashboard() {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    subjects: 0,
    present: 0,
    absent: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await dashboardService.getStats();
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <h2>Loading Dashboard...</h2>;
  }

  return (
    <div className="dashboard-page">
      <PageHeader title="Dashboard" />

      <div className="dashboard-grid">
        <DashboardCard
          title="Total Students"
          value={stats.students}
          color="#2563eb"
        />

        <DashboardCard
          title="Total Teachers"
          value={stats.teachers}
          color="#16a34a"
        />

        <DashboardCard
          title="Total Subjects"
          value={stats.subjects}
          color="#9333ea"
        />

        <DashboardCard
          title="Present Today"
          value={stats.present}
          color="#22c55e"
        />

        <DashboardCard
          title="Absent Today"
          value={stats.absent}
          color="#ef4444"
        />
      </div>

      <Card>
        <h2>Recent Attendance</h2>
        <p>Attendance table will be displayed here.</p>
      </Card>
    </div>
  );
}