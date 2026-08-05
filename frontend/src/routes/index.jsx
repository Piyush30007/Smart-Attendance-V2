import Attendance from "../pages/Attendance";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import Students from "../pages/Students";
import Subjects from "../pages/Subjects";
import Teachers from "../pages/Teachers";

export const appRoutes = [
  { path: "/", element: Dashboard, label: "Dashboard" },
  { path: "/login", element: Login, label: "Login" },
  { path: "/students", element: Students, label: "Students" },
  { path: "/teachers", element: Teachers, label: "Teachers" },
  { path: "/attendance", element: Attendance, label: "Attendance" },
  { path: "/reports", element: Reports, label: "Reports" },
  { path: "/subjects", element: Subjects, label: "Subjects" },
  { path: "/settings", element: Settings, label: "Settings" },
];
