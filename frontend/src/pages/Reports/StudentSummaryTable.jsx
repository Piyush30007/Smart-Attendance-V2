import { useMemo, useState } from "react";
import DataTable from "../../components/tables/DataTable";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function StudentSummaryTable({
  records = [],
  studentMap = {},
  loading = false,
}) {
  const [search, setSearch] = useState("");

  // Aggregate stats per student strictly from real loaded records
  const studentAggregates = useMemo(() => {
    const map = {};

    records.forEach((rec) => {
      const id = rec.student_id;
      if (!map[id]) {
        const studentInfo = studentMap[id];
        map[id] = {
          id: id,
          student_name: studentInfo?.name || `Student #${id}`,
          student_code: studentInfo?.student_code || `ST-${id}`,
          course: studentInfo?.course || "General",
          totalSessions: 0,
          presentCount: 0,
          absentCount: 0,
        };
      }

      map[id].totalSessions += 1;
      if (rec.status?.toLowerCase() === "present") {
        map[id].presentCount += 1;
      } else {
        map[id].absentCount += 1;
      }
    });

    return Object.values(map).map((item) => {
      const rateNum =
        item.totalSessions > 0
          ? (item.presentCount / item.totalSessions) * 100
          : 0;
      return {
        ...item,
        attendanceRateNum: rateNum,
        attendanceRate: `${rateNum.toFixed(1)}%`,
      };
    });
  }, [records, studentMap]);

  // Filtered by search
  const filteredAggregates = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return studentAggregates;
    return studentAggregates.filter(
      (s) =>
        s.student_name.toLowerCase().includes(q) ||
        s.student_code.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q)
    );
  }, [studentAggregates, search]);

  const columns = [
    {
      key: "student_name",
      label: "Student",
      render: (row) => {
        const initials = row.student_name
          ? row.student_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()
          : "ST";

        return (
          <div className="person-name-cell">
            <div className="person-avatar student" aria-hidden="true">
              {initials}
            </div>
            <div className="person-meta">
              <span className="person-name">{row.student_name}</span>
              <span className="person-sub">{row.course}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "student_code",
      label: "Student Code",
      render: (row) => <span className="student-code-tag">{row.student_code}</span>,
    },
    {
      key: "totalSessions",
      label: "Total Sessions",
      render: (row) => <strong>{row.totalSessions}</strong>,
    },
    {
      key: "presentCount",
      label: "Days Present",
      render: (row) => (
        <span className="text-green" style={{ fontWeight: 600 }}>
          {row.presentCount}
        </span>
      ),
    },
    {
      key: "absentCount",
      label: "Days Absent",
      render: (row) => (
        <span className="text-red" style={{ fontWeight: 600 }}>
          {row.absentCount}
        </span>
      ),
    },
    {
      key: "attendanceRate",
      label: "Attendance Rate",
      render: (row) => {
        const isOptimal = row.attendanceRateNum >= 75;
        return (
          <span className={`status-pill ${isOptimal ? "present" : "absent"}`}>
            <span className={`status-dot ${isOptimal ? "present" : "absent"}`} />
            {row.attendanceRate}
          </span>
        );
      },
    },
  ];

  return (
    <div className="student-summary-section">
      <div className="table-toolbar-bar">
        <div className="search-input-wrapper" style={{ maxWidth: "380px" }}>
          <svg
            className="search-icon"
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
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students in report..."
            aria-label="Search student summaries"
          />
        </div>

        <div className="filter-count-badge">
          <span>
            <strong>{filteredAggregates.length}</strong> students evaluated
          </span>
        </div>
      </div>

      {loading ? (
        <div className="page-loading-state">
          <LoadingSpinner />
          <p>Calculating student attendance aggregates...</p>
        </div>
      ) : filteredAggregates.length === 0 ? (
        <div className="attendance-empty-container">
          <div className="empty-state-icon-circle" aria-hidden="true">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h4 className="empty-title">No Student Summaries Available</h4>
          <p className="empty-description">
            No student records could be aggregated for this date range.
          </p>
        </div>
      ) : (
        <div className="table-responsive-wrapper">
          <DataTable columns={columns} data={filteredAggregates} />
        </div>
      )}
    </div>
  );
}
