/**
 * Subject Service
 * 
 * Manages institutional curriculum subjects with persistence.
 * Returns standard Axios-like responses ({ data: ... }) for consistency
 * with other services (studentService, teacherService).
 */

const STORAGE_KEY = "smart_attendance_subjects";

const INITIAL_SUBJECTS = [
  {
    id: 1,
    name: "Mathematics",
    code: "MATH-101",
    department: "Mathematics",
    faculty: "Dr. Sharma",
    credits: 4,
  },
  {
    id: 2,
    name: "Physics",
    code: "PHY-102",
    department: "Applied Sciences",
    faculty: "Prof. Verma",
    credits: 4,
  },
  {
    id: 3,
    name: "Database Management Systems",
    code: "CS-201",
    department: "Computer Science",
    faculty: "Dr. Gupta",
    credits: 3,
  },
  {
    id: 4,
    name: "Computer Networks",
    code: "CS-202",
    department: "Computer Science",
    faculty: "Prof. Singh",
    credits: 3,
  },
  {
    id: 5,
    name: "Operating Systems",
    code: "CS-203",
    department: "Computer Science",
    faculty: "Dr. Rao",
    credits: 4,
  },
];

function getStoredSubjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SUBJECTS));
      return [...INITIAL_SUBJECTS];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...INITIAL_SUBJECTS];
  } catch {
    return [...INITIAL_SUBJECTS];
  }
}

function saveSubjects(subjects) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
  } catch (err) {
    console.error("Failed to save subjects to localStorage:", err);
  }
}

const subjectService = {
  async list() {
    // Return a copy of stored subjects
    const subjects = getStoredSubjects();
    return { data: subjects };
  },

  async create(data) {
    const subjects = getStoredSubjects();
    const newId = subjects.length > 0 ? Math.max(...subjects.map((s) => s.id)) + 1 : 1;
    const newSubject = {
      id: newId,
      name: data.name.trim(),
      code: data.code ? data.code.trim().toUpperCase() : `SUB-${newId}`,
      department: data.department ? data.department.trim() : "General",
      faculty: data.faculty ? data.faculty.trim() : "Unassigned",
      credits: Number(data.credits) || 3,
    };

    subjects.unshift(newSubject);
    saveSubjects(subjects);
    return { data: newSubject };
  },

  async update(id, data) {
    const subjects = getStoredSubjects();
    const index = subjects.findIndex((s) => s.id === Number(id));
    if (index === -1) {
      throw new Error(`Subject with ID ${id} not found.`);
    }

    const updated = {
      ...subjects[index],
      name: data.name !== undefined ? data.name.trim() : subjects[index].name,
      code: data.code !== undefined ? data.code.trim().toUpperCase() : subjects[index].code,
      department: data.department !== undefined ? data.department.trim() : subjects[index].department,
      faculty: data.faculty !== undefined ? data.faculty.trim() : subjects[index].faculty,
      credits: data.credits !== undefined ? Number(data.credits) : subjects[index].credits,
    };

    subjects[index] = updated;
    saveSubjects(subjects);
    return { data: updated };
  },

  async remove(id) {
    const subjects = getStoredSubjects();
    const filtered = subjects.filter((s) => s.id !== Number(id));
    if (filtered.length === subjects.length) {
      throw new Error(`Subject with ID ${id} not found.`);
    }

    saveSubjects(filtered);
    return { data: { success: true, id } };
  },
};

export default subjectService;
