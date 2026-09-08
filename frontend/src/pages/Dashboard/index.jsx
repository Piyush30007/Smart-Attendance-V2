import { useState, useEffect, useCallback } from "react";
import DashboardHeader from "./DashboardHeader";
import StatCard from "./StatCard";
import AttendanceTrendChart from "./AttendanceTrendChart";
import SubjectAttendanceChart from "./SubjectAttendanceChart";
import RecentAttendanceTable from "./RecentAttendanceTable";
import TopAttendeesWidget from "./TopAttendeesWidget";

import dashboardService from "../../services/dashboardService";
import attendanceService from "../../services/attendanceService";
import studentService from "../../services/studentService";

import {
  mockWeeklyAttendanceTrend,
  mockSubjectAttendance,
  mockTopAttendees,
  mockRecentAttendanceFallback,
} from "./mockDashboardData";

import "./Dashboard.css";

export default function Dashboard() {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    subjects: 0,
    present: 0,
    absent: 0,
  });

  const [recentRecords, setRecentRecords] = useState([]);
  const [isDemoAttendance, setIsDemoAttendance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch real statistics and attendance data from backend
  const loadDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [statsResult, attendanceResult, studentsResult] =
        await Promise.allSettled([
          dashboardService.getStats(),
          attendanceService.list(),
          studentService.list(),
        ]);

      // 1. Process Core Stats
      if (statsResult.status === "fulfilled" && statsResult.value?.data) {
        setStats(statsResult.value.data);
      }

      // 2. Build Student Lookup Map for enriching attendance logs
      const studentMap = {};
      if (studentsResult.status === "fulfilled" && Array.isArray(studentsResult.value?.data)) {
        studentsResult.value.data.forEach((st) => {
          studentMap[st.id] = st;
        });
      }

      // 3. Process Recent Attendance
      if (
        attendanceResult.status === "fulfilled" &&
        Array.isArray(attendanceResult.value?.data) &&
        attendanceResult.value.data.length > 0
      ) {
        const liveLogs = attendanceResult.value.data.slice(0, 10).map((rec) => {
          const student = studentMap[rec.student_id];
          const timeFormatted = rec.check_in_time
            ? new Date(rec.check_in_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—";

          return {
            id: rec.id,
            studentName: student?.name || `Student #${rec.student_id}`,
            studentCode: student?.student_code || `ST-${rec.student_id}`,
            subject: student?.course || "General",
            date: rec.date,
            time: timeFormatted,
            status: rec.status,
            confidenceScore: rec.confidence_score
              ? `${(parseFloat(rec.confidence_score) * 100).toFixed(1)}%`
              : null,
          };
        });

        setRecentRecords(liveLogs);
        setIsDemoAttendance(false);
      } else {
        // Fallback to sample preview if database has no live logs yet
        setRecentRecords(mockRecentAttendanceFallback);
        setIsDemoAttendance(true);
      }
    } catch (err) {
      console.error("Dashboard Load Error:", err);
      setError("Unable to sync live attendance records. Displaying cached overview.");
      setRecentRecords(mockRecentAttendanceFallback);
      setIsDemoAttendance(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Derived calculations
  const totalStudents = stats.students || 0;
  const presentCount = stats.present || 0;
  const absentCount = stats.absent || 0;
  const attendanceRate =
    totalStudents > 0
      ? ((presentCount / totalStudents) * 100).toFixed(1)
      : "0.0";
  const absentRate =
    totalStudents > 0
      ? ((absentCount / totalStudents) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="dashboard-container">
      {/* 1. Header */}
      <DashboardHeader
        onRefresh={() => loadDashboardData(true)}
        refreshing={refreshing}
      />

      {/* Error alert with retry button if connection dropped */}
      {error && (
        <div className="dashboard-error-banner" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="btn-error-retry"
            onClick={() => loadDashboardData(true)}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* 2. Summary Stat Cards */}
      {loading ? (
        <div className="stats-grid">
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
      ) : (
        <div className="stats-grid">
          {/* Card 1: Total Students */}
          <StatCard
            title="Total Students"
            value={totalStudents.toLocaleString()}
            subtitle="Active enrolled"
            badgeBg="#ede9fe"
            iconColor="#7c3aed"
            graphicType="bars"
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />

          {/* Card 2: Present Today */}
          <StatCard
            title="Present Today"
            value={presentCount.toLocaleString()}
            subtitle={`${attendanceRate}% of total`}
            badgeBg="#ecfdf5"
            iconColor="#10b981"
            graphicType="gauge"
            gaugePercent={parseFloat(attendanceRate) || 0}
            gaugeColor="#10b981"
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            }
          />

          {/* Card 3: Absent Today */}
          <StatCard
            title="Absent Today"
            value={absentCount.toLocaleString()}
            subtitle={`${absentRate}% absent rate`}
            badgeBg="#fff1f2"
            iconColor="#ef4444"
            graphicType="gauge"
            gaugePercent={parseFloat(absentRate) || 0}
            gaugeColor="#ef4444"
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            }
          />

          {/* Card 4: Overall Attendance % */}
          <StatCard
            title="Overall Attendance %"
            value={`${attendanceRate}%`}
            subtitle="Campus target: 75.0%"
            badgeBg="#fefce8"
            iconColor="#d97706"
            graphicType="gauge"
            gaugePercent={parseFloat(attendanceRate) || 0}
            gaugeColor="#d97706"
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            }
          />
        </div>
      )}

      {/* 3. Middle Section: Charts (Attendance Trend + Subject Breakdown) */}
      {loading ? (
        <div className="charts-grid">
          <div className="skeleton-chart"></div>
          <div className="skeleton-chart"></div>
        </div>
      ) : (
        <div className="charts-grid">
          <AttendanceTrendChart data={mockWeeklyAttendanceTrend} />
          <SubjectAttendanceChart data={mockSubjectAttendance} />
        </div>
      )}

      {/* 4. Bottom Section: Recent Attendance Activity + Top Attendees */}
      <div className="bottom-grid">
        <RecentAttendanceTable
          records={recentRecords}
          isDemoData={isDemoAttendance}
        />
        <TopAttendeesWidget attendees={mockTopAttendees} />
      </div>
    </div>
  );
}