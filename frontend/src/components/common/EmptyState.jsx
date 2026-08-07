export default function EmptyState({
  message = "No data found",
}) {
  return (
    <div
      style={{
        padding: "40px",
        textAlign: "center",
        color: "gray",
      }}
    >
      {message}
    </div>
  );
}