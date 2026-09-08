import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const PIE_COLORS = {
  Present: "#10b981",
  Absent: "#ef4444",
};

function CustomPieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="chart-tooltip">
        <p className="tooltip-title">{item.name}</p>
        <p className="tooltip-item">
          <span>Total:</span>
          <strong>{item.value}</strong>
        </p>
      </div>
    );
  }
  return null;
}

function CustomBarTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-title">Date: {label}</p>
        <div className="tooltip-items">
          <p className="tooltip-item present">
            <span className="tooltip-dot dot-present" />
            <span>Present:</span>
            <strong>{payload[0]?.value || 0}</strong>
          </p>
          <p className="tooltip-item absent">
            <span className="tooltip-dot dot-absent" />
            <span>Absent:</span>
            <strong>{payload[1]?.value || 0}</strong>
          </p>
        </div>
      </div>
    );
  }
  return null;
}

export default function ReportCharts({
  statusData = [],
  trendData = [],
  totalRecords = 0,
}) {
  return (
    <div className="report-charts-grid">
      {/* 1. Status Breakdown Donut */}
      <div className="dashboard-card chart-card">
        <div className="card-header-bar">
          <div>
            <h3 className="card-heading">Attendance Status Breakdown</h3>
            <p className="card-subheading">Proportion of verified vs missed check-ins</p>
          </div>
          <span className="card-badge">Status</span>
        </div>

        {totalRecords === 0 ? (
          <div className="chart-empty-placeholder">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            <p>No status data available for selected range</p>
          </div>
        ) : (
          <div className="pie-chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={PIE_COLORS[entry.name] || "#3b82f6"}
                    />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Custom Bottom Legend */}
            <div className="donut-legend-bar">
              {statusData.map((item) => (
                <div key={item.name} className="donut-legend-item">
                  <span
                    className="donut-legend-dot"
                    style={{ backgroundColor: PIE_COLORS[item.name] || "#3b82f6" }}
                  />
                  <span className="donut-legend-name">{item.name}:</span>
                  <strong className="donut-legend-count">{item.value}</strong>
                  <span className="donut-legend-percent">
                    ({totalRecords > 0 ? ((item.value / totalRecords) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Daily Attendance Trend */}
      <div className="dashboard-card chart-card">
        <div className="card-header-bar">
          <div>
            <h3 className="card-heading">Daily Attendance Trend</h3>
            <p className="card-subheading">Day-by-day attendance count across period</p>
          </div>
          <div className="chart-legend-pills">
            <span className="legend-pill present">
              <span className="pill-dot present" /> Present
            </span>
            <span className="legend-pill absent">
              <span className="pill-dot absent" /> Absent
            </span>
          </div>
        </div>

        {trendData.length === 0 ? (
          <div className="chart-empty-placeholder">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <p>No daily timeline records in this period</p>
          </div>
        ) : (
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={trendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  allowDecimals={false}
                />
                <RechartsTooltip content={<CustomBarTooltip />} />
                <Bar
                  dataKey="present"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="absent"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
