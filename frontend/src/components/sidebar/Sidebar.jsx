import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">

      <NavLink to="/">
        Dashboard
      </NavLink>

      <NavLink to="/students">
        Students
      </NavLink>

      <NavLink to="/teachers">
        Teachers
      </NavLink>

      <NavLink to="/attendance">
        Attendance
      </NavLink>

      <NavLink to="/subjects">
        Subjects
      </NavLink>

      <NavLink to="/reports">
        Reports
      </NavLink>

      <NavLink to="/settings">
        Settings
      </NavLink>

    </aside>
  );
}

export default Sidebar;