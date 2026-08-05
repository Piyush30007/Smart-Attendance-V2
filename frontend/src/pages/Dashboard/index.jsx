import { useAttendance } from "../../hooks/useAttendance";

export default function Dashboard() {
  const { records, loading, error } = useAttendance();

  if (loading) return <p>Loading attendance...</p>;
  if (error) return <p role="alert">{error}</p>;

  return (
    <section>
      <h1>Today's Attendance</h1>
      <table>
        <thead>
          <tr><th>Student ID</th><th>Date</th><th>Check-in</th><th>Status</th></tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>{r.student_id}</td>
              <td>{r.date}</td>
              <td>{r.check_in_time}</td>
              <td>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
