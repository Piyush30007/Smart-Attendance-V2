import Attendance from "../pages/Attendance";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import Students from "../pages/Students";
import Subjects from "../pages/Subjects";
import Teachers from "../pages/Teachers";

export const appRoutes = [
  {
    path: "/",
    element: Dashboard,
    label: "Dashboard",
    protected: true,
  },

  {
    path: "/login",
    element: Login,
    label: "Login",
    protected: false,
  },

  {
    path: "/students",
    element: Students,
    label: "Students",
    protected: true,
  },

  {
    path: "/teachers",
    element: Teachers,
    label: "Teachers",
    protected: true,
  },

  {
    path: "/attendance",
    element: Attendance,
    label: "Attendance",
    protected: true,
  },

  {
    path: "/reports",
    element: Reports,
    label: "Reports",
    protected: true,
  },

  {
    path: "/subjects",
    element: Subjects,
    label: "Subjects",
    protected: true,
  },

  {
    path: "/settings",
    element: Settings,
    label: "Settings",
    protected: true,
  },
];