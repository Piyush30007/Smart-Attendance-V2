import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

const BAR_COLORS = ["#2563eb", "#6366f1", "#06b6d4", "#10b981", "#8b5cf6"];

function CustomBarTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="chart-tooltip">
        <p className="tooltip-title">{data.subject}</p>
        <div className="tooltip-items">
          <p className="tooltip-item">
            <span>Attendance Rate:</span>
            <strong>{data.attendance}%</strong>
          </p>
          {data.faculty && (
            <p className="tooltip-item sub">
              <span>Faculty:</span>
              <span>{data.faculty}</span>
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
}

export default function SubjectAttendanceChart({ data }) {
  return (
    <div className="dashboard-card subject-card">
      <div className="card-header-bar">
        <div>
          <h2 className="card-heading">Subject-wise Attendance</h2>
          <p className="card-subheading">Performance across key curriculum courses</p>
        </div>
        <span className="card-badge">Current Term</span>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={270}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />

            <XAxis
              dataKey="subject"
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tick={{ fill: "#64748b", fontSize: 11 }}
              interval={0}
              tickFormatter={(val) =>
                val.length > 9 ? val.substring(0, 8) + "…" : val
              }
            />

            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickFormatter={(val) => `${val}%`}
            />

            <Tooltip content={<CustomBarTooltip />} />

            <Bar
              dataKey="attendance"
              radius={[6, 6, 0, 0]}
              maxBarSize={38}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
