export default function TopAttendeesWidget({ attendees = [] }) {
  return (
    <div className="dashboard-card top-attendees-card">
      <div className="card-header-bar">
        <div>
          <h2 className="card-heading">Top Attendees</h2>
          <p className="card-subheading">Highest attendance consistency</p>
        </div>
        <span className="card-badge">Top 5</span>
      </div>

      <div className="attendees-list">
        {attendees.map((attendee, index) => {
          const initials = attendee.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();

          return (
            <div key={attendee.id || index} className="attendee-item">
              <div className="attendee-left">
                <div
                  className="attendee-avatar"
                  style={{ backgroundColor: attendee.avatarBg || "#6366f1" }}
                  aria-hidden="true"
                >
                  {initials}
                </div>

                <div className="attendee-meta">
                  <span className="attendee-name">{attendee.name}</span>
                  <span className="attendee-dept">
                    {attendee.department || attendee.code}
                  </span>
                </div>
              </div>

              <div className="attendee-right">
                <span className="rate-badge">{attendee.attendance}%</span>
                <span className="days-badge">{attendee.daysAttended} Days</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
