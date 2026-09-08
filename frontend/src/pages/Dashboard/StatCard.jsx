/**
 * Modern StatCard component supporting:
 * - Title, large numeric value, subtitle/meta
 * - Soft colored icon badge
 * - Visual graphics (SVG wave bars or semi-circle gauge) matching the reference design
 */

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  badgeBg = "#f1f5f9",
  iconColor = "#2563eb",
  graphicType = "none", // 'bars' | 'gauge' | 'none'
  gaugePercent = 0,
  gaugeColor = "#22c55e",
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className="stat-card-info">
          <span className="stat-card-title">{title}</span>
          <span className="stat-card-value">{value}</span>
        </div>

        <div
          className="stat-icon-badge"
          style={{ backgroundColor: badgeBg, color: iconColor }}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      <div className="stat-card-bottom">
        <span className="stat-card-subtitle">{subtitle}</span>

        {/* Mini Bars Graphic (like the reference's Total Students card) */}
        {graphicType === "bars" && (
          <div className="stat-mini-bars" aria-hidden="true">
            <span style={{ height: "35%", backgroundColor: iconColor, opacity: 0.35 }}></span>
            <span style={{ height: "60%", backgroundColor: iconColor, opacity: 0.5 }}></span>
            <span style={{ height: "90%", backgroundColor: iconColor, opacity: 0.85 }}></span>
            <span style={{ height: "45%", backgroundColor: iconColor, opacity: 0.4 }}></span>
            <span style={{ height: "75%", backgroundColor: iconColor, opacity: 0.7 }}></span>
            <span style={{ height: "100%", backgroundColor: iconColor }}></span>
          </div>
        )}

        {/* Semi Gauge Graphic (like the reference's Present/Absent/Rate cards) */}
        {graphicType === "gauge" && (
          <div className="stat-mini-gauge" title={`${gaugePercent}%`}>
            <svg width="68" height="38" viewBox="0 0 100 55" className="gauge-svg">
              {/* Background Arc */}
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Value Arc */}
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke={gaugeColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="125.6"
                strokeDashoffset={125.6 - (125.6 * Math.min(Math.max(gaugePercent, 0), 100)) / 100}
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
              />
            </svg>
            <span className="gauge-label" style={{ color: gaugeColor }}>
              {gaugePercent}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
