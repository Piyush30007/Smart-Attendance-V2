import { useState, useEffect, useMemo, useCallback } from "react";
import attendanceService from "../../services/attendanceService";
import studentService from "../../services/studentService";

import PageHeader from "../../components/common/PageHeader";
import Toast from "../../components/common/Toast";

import ReportFilters from "./ReportFilters";
import ReportStats from "./ReportStats";
import ReportCharts from "./ReportCharts";
import ReportTable from "./ReportTable";
import StudentSummaryTable from "./StudentSummaryTable";

import { getErrorMessage } from "../../utils/getErrorMessage";
import "./Reports.css";

// Date formatting helper: YYYY-MM-DD
const formatDate = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Calculate start & end for standard presets
const getPresetRange = (preset) => {
  const now = new Date();
  const end = formatDate(now);
  let start = end;

  if (preset === "today") {
    start = end;
  } else if (preset === "7days") {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    start = formatDate(d);
  } else if (preset === "30days") {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    start = formatDate(d);
  } else if (preset === "thisMonth") {
    const d = new Date(now.getFullYear(), now.getMonth(), 1);
    start = formatDate(d);
  }

  return { start, end };
};

export default function Reports() {
  // Default range: Last 30 Days
  const defaultDates = useMemo(() => getPresetRange("30days"), []);

  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);
  const [activePreset, setActivePreset] = useState("30days");
  const [validationError, setValidationError] = useState("");

  // Sub-view: "records" (Detailed raw logs) or "students" (Aggregated per student)
  const [activeTab, setActiveTab] = useState("records");

  // Loading and exporting state
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Raw data from backend
  const [allRecords, setAllRecords] = useState([]);
  const [studentMap, setStudentMap] = useState({});

  // Feedback Toast
  const [toast, setToast] = useState(null);

  // Fetch real attendance records and student directory
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [attendanceRes, studentsRes] = await Promise.allSettled([
        attendanceService.list(),
        studentService.list(),
      ]);

      if (
        attendanceRes.status === "fulfilled" &&
        Array.isArray(attendanceRes.value?.data)
      ) {
        setAllRecords(attendanceRes.value.data);
      } else if (attendanceRes.status === "rejected") {
        setToast({
          type: "error",
          message: getErrorMessage(attendanceRes.reason),
        });
      }

      if (
        studentsRes.status === "fulfilled" &&
        Array.isArray(studentsRes.value?.data)
      ) {
        const map = {};
        studentsRes.value.data.forEach((st) => {
          map[st.id] = st;
        });
        setStudentMap(map);
      }
    } catch (err) {
      setToast({
        type: "error",
        message: getErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle preset selection
  const handlePresetSelect = (preset) => {
    const range = getPresetRange(preset);
    setActivePreset(preset);
    setStartDate(range.start);
    setEndDate(range.end);
    setValidationError("");
  };

  // Handle manual start date change
  const handleStartDateChange = (val) => {
    setStartDate(val);
    setActivePreset(null);
    if (endDate && val > endDate) {
      setValidationError("Start date cannot be after end date.");
    } else {
      setValidationError("");
    }
  };

  // Handle manual end date change
  const handleEndDateChange = (val) => {
    setEndDate(val);
    setActivePreset(null);
    if (startDate && startDate > val) {
      setValidationError("Start date cannot be after end date.");
    } else {
      setValidationError("");
    }
  };

  // Generate / Refresh Report
  const handleGenerate = () => {
    if (validationError) return;
    if (startDate && endDate && startDate > endDate) {
      setValidationError("Start date cannot be after end date.");
      return;
    }
    fetchData();
  };

  // Export CSV via real backend endpoint /attendance/report
  const handleExportCSV = async () => {
    if (validationError) {
      setToast({
        type: "error",
        message: "Please choose a valid date range before exporting.",
      });
      return;
    }

    setExporting(true);
    try {
      const res = await attendanceService.report(startDate, endDate);
      const csvData = res.data?.csv;

      if (!csvData) {
        setToast({
          type: "error",
          message: "No report data was returned for the selected range.",
        });
        return;
      }

      // Create Blob and trigger native browser download
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `attendance_report_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setToast({
        type: "success",
        message: `Attendance report exported successfully (${startDate} to ${endDate}).`,
      });
    } catch (err) {
      setToast({
        type: "error",
        message: `Export failed: ${getErrorMessage(err)}`,
      });
    } finally {
      setExporting(false);
    }
  };

  // Filter records within active date window strictly from real loaded backend data
  const filteredRecords = useMemo(() => {
    if (!startDate || !endDate) return allRecords;
    return allRecords.filter((r) => {
      if (!r.date) return false;
      return r.date >= startDate && r.date <= endDate;
    });
  }, [allRecords, startDate, endDate]);

  // Derived Summary Statistics (Strictly Real Data)
  const stats = useMemo(() => {
    const total = filteredRecords.length;
    let present = 0;
    let absent = 0;
    const uniqueStudentSet = new Set();

    filteredRecords.forEach((r) => {
      if (r.student_id) uniqueStudentSet.add(r.student_id);
      const s = r.status?.toLowerCase();
      if (s === "present") present += 1;
      else if (s === "absent") absent += 1;
    });

    const rate = total > 0 ? ((present / total) * 100).toFixed(1) : "0.0";

    return {
      totalRecords: total,
      presentCount: present,
      absentCount: absent,
      attendanceRate: rate,
      uniqueStudentsCount: uniqueStudentSet.size,
    };
  }, [filteredRecords]);

  // Group status distribution for Donut Chart
  const statusChartData = useMemo(() => {
    if (stats.totalRecords === 0) return [];
    const arr = [];
    if (stats.presentCount > 0) {
      arr.push({ name: "Present", value: stats.presentCount });
    }
    if (stats.absentCount > 0) {
      arr.push({ name: "Absent", value: stats.absentCount });
    }
    // Include any other possible recorded statuses if present
    const otherCount = stats.totalRecords - (stats.presentCount + stats.absentCount);
    if (otherCount > 0) {
      arr.push({ name: "Other", value: otherCount });
    }
    return arr;
  }, [stats]);

  // Group daily trend for Bar Chart
  const trendChartData = useMemo(() => {
    if (filteredRecords.length === 0) return [];
    const dateMap = {};

    filteredRecords.forEach((r) => {
      const d = r.date;
      if (!dateMap[d]) {
        dateMap[d] = { date: d, present: 0, absent: 0 };
      }
      if (r.status?.toLowerCase() === "present") {
        dateMap[d].present += 1;
      } else {
        dateMap[d].absent += 1;
      }
    });

    return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredRecords]);

  return (
    <div className="reports-page">
      {/* Notifications / Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* A. Page Header */}
      <PageHeader
        title="Attendance Reports"
        subtitle="Analyze attendance performance and generate attendance reports."
        buttonText={exporting ? "Exporting CSV..." : "Export CSV"}
        onButtonClick={handleExportCSV}
        buttonIcon={
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        }
      />

      {/* B. Date Filters & Presets Bar */}
      <ReportFilters
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onPresetSelect={handlePresetSelect}
        activePreset={activePreset}
        onGenerate={handleGenerate}
        onExport={handleExportCSV}
        loading={loading}
        exporting={exporting}
        validationError={validationError}
      />

      {/* C. Summary Statistics Cards */}
      <ReportStats
        totalRecords={stats.totalRecords}
        presentCount={stats.presentCount}
        absentCount={stats.absentCount}
        attendanceRate={stats.attendanceRate}
        uniqueStudentsCount={stats.uniqueStudentsCount}
        loading={loading}
      />

      {/* D. Attendance Visualizations */}
      <ReportCharts
        statusData={statusChartData}
        trendData={trendChartData}
        totalRecords={stats.totalRecords}
      />

      {/* Segmented View Switch: Detailed Logs vs Student Summary */}
      <div className="report-view-nav" role="tablist" aria-label="Report Views">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "records"}
          className={`report-view-tab ${activeTab === "records" ? "active" : ""}`}
          onClick={() => setActiveTab("records")}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          <span>Detailed Log Records ({stats.totalRecords})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "students"}
          className={`report-view-tab ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Student Attendance Summary ({stats.uniqueStudentsCount})</span>
        </button>
      </div>

      {/* E & F. Report Tables */}
      {activeTab === "records" ? (
        <ReportTable
          records={filteredRecords}
          studentMap={studentMap}
          loading={loading}
        />
      ) : (
        <StudentSummaryTable
          records={filteredRecords}
          studentMap={studentMap}
          loading={loading}
        />
      )}
    </div>
  );
}
