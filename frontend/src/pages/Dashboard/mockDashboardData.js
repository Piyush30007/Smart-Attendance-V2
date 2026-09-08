/**
 * Isolated Mock Data for Smart Attendance Dashboard
 *
 * NOTE: This mock dataset is utilized for UI metrics (e.g. weekly trend & subject rates)
 * that are not yet exposed as dedicated endpoints in the current backend.
 * Once endpoints like /dashboard/trend and /dashboard/subjects are available,
 * simply swap these imports with the corresponding API service calls.
 */

export const mockWeeklyAttendanceTrend = [
  { day: "Mon", present: 485, absent: 85, attendanceRate: 85.1 },
  { day: "Tue", present: 512, absent: 58, attendanceRate: 89.8 },
  { day: "Wed", present: 498, absent: 72, attendanceRate: 87.4 },
  { day: "Thu", present: 465, absent: 105, attendanceRate: 81.6 },
  { day: "Fri", present: 520, absent: 50, attendanceRate: 91.2 },
  { day: "Sat", present: 430, absent: 140, attendanceRate: 75.4 },
];

export const mockSubjectAttendance = [
  { subject: "Mathematics", attendance: 90, totalClasses: 28, faculty: "Dr. Sharma" },
  { subject: "Physics", attendance: 84, totalClasses: 25, faculty: "Prof. Verma" },
  { subject: "DBMS", attendance: 88, totalClasses: 30, faculty: "Dr. Gupta" },
  { subject: "Computer Networks", attendance: 92, totalClasses: 26, faculty: "Prof. Singh" },
  { subject: "Operating Systems", attendance: 81, totalClasses: 24, faculty: "Dr. Rao" },
];

export const mockTopAttendees = [
  {
    id: 1,
    name: "Jacob Zachary",
    code: "CS-2024-001",
    attendance: 100,
    daysAttended: 30,
    department: "Computer Science",
    avatarBg: "#8b5cf6",
  },
  {
    id: 2,
    name: "Hannah Sarah",
    code: "CS-2024-014",
    attendance: 98,
    daysAttended: 30,
    department: "Computer Science",
    avatarBg: "#06b6d4",
  },
  {
    id: 3,
    name: "Megan Alyssa",
    code: "IT-2024-022",
    attendance: 96,
    daysAttended: 29,
    department: "Information Tech",
    avatarBg: "#10b981",
  },
  {
    id: 4,
    name: "Lucas Anthony",
    code: "EC-2024-008",
    attendance: 95,
    daysAttended: 28,
    department: "Electronics",
    avatarBg: "#f59e0b",
  },
  {
    id: 5,
    name: "Sophia Claire",
    code: "CS-2024-035",
    attendance: 94,
    daysAttended: 28,
    department: "Computer Science",
    avatarBg: "#ec4899",
  },
];

export const mockRecentAttendanceFallback = [
  {
    id: 101,
    studentName: "Aarav Sharma",
    studentCode: "CS-2024-041",
    subject: "DBMS",
    date: "2026-09-08",
    time: "09:15 AM",
    status: "Present",
    confidenceScore: "98.4%",
  },
  {
    id: 102,
    studentName: "Priya Patel",
    studentCode: "CS-2024-018",
    subject: "Mathematics",
    date: "2026-09-08",
    time: "09:14 AM",
    status: "Present",
    confidenceScore: "97.8%",
  },
  {
    id: 103,
    studentName: "Rohan Varma",
    studentCode: "IT-2024-009",
    subject: "Operating Systems",
    date: "2026-09-08",
    time: "09:12 AM",
    status: "Present",
    confidenceScore: "99.1%",
  },
  {
    id: 104,
    studentName: "Sneha Reddy",
    studentCode: "EC-2024-027",
    subject: "Computer Networks",
    date: "2026-09-08",
    time: "09:05 AM",
    status: "Absent",
    confidenceScore: null,
  },
  {
    id: 105,
    studentName: "Vikram Singh",
    studentCode: "CS-2024-052",
    subject: "Physics",
    date: "2026-09-08",
    time: "09:01 AM",
    status: "Present",
    confidenceScore: "96.5%",
  },
  {
    id: 106,
    studentName: "Ananya Joshi",
    studentCode: "IT-2024-015",
    subject: "DBMS",
    date: "2026-09-08",
    time: "08:58 AM",
    status: "Present",
    confidenceScore: "98.9%",
  },
];
