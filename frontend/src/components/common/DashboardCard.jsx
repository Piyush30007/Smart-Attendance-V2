export default function DashboardCard({
  title,
  value,
  color = "#2563eb",
}) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,.08)",
        borderLeft: `6px solid ${color}`,
      }}
    >
      <h3>{title}</h3>

      <h1>{value}</h1>
    </div>
  );
}