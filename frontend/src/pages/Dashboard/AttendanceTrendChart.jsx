import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-title">{label}</p>
        <div className="tooltip-items">
          <p className="tooltip-item present">
            <span className="tooltip-dot dot-present"></span>
            <span>Present:</span>
            <strong>{payload[0]?.value}</strong>
          </p>
          <p className="tooltip-item absent">
            <span className="tooltip-dot dot-absent"></span>
            <span>Absent:</span>
            <strong>{payload[1]?.value}</strong>
          </p>
        </div>
      </div>
    );
  }
  return null;
}

export default function AttendanceTrendChart({ data }) {
  return (
    <div className="dashboard-card trend-card">
      <div className="card-header-bar">
        <div>
          <h2 className="card-heading">Attendance Trend</h2>
          <p className="card-subheading">Recent daily attendance distribution</p>
        </div>
        <div className="chart-legend-pills">
          <span className="legend-pill present">
            <span className="pill-dot present"></span> Present
          </span>
          <span className="legend-pill absent">
            <span className="pill-dot absent"></span> Absent
          </span>
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={270}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="present"
              stroke="#6366f1"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#presentGrad)"
            />

            <Area
              type="monotone"
              dataKey="absent"
              stroke="#f43f5e"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#absentGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
