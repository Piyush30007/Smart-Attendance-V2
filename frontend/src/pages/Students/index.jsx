import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";

import studentService from "../../services/studentService";
import StudentForm from "./StudentForm";
import RegisterFaceModal from "./RegisterFaceModal";
import StudentHistoryModal from "./StudentHistoryModal";
import DataTable from "../../components/tables/DataTable";

import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmModal from "../../components/common/ConfirmModal";
import Toast from "../../components/common/Toast";

import { getErrorMessage } from "../../utils/getErrorMessage";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [showRegister, setShowRegister] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [registeringStudent, setRegisteringStudent] = useState(null);
  const [selectedHistoryStudent, setSelectedHistoryStudent] = useState(null);

  // Modal state for deletion
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [search, setSearch] = useState("");

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await studentService.list();
      setStudents(data.students || data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Trigger modal confirmation
  const handleOpenDeleteModal = (student) => {
    setDeleteTarget(student);
  };

  // Perform backend deletion
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    try {
      await studentService.remove(deleteTarget.id);
      await fetchStudents();
      setToast({
        type: "success",
        message: `Student "${deleteTarget.name}" (${deleteTarget.student_code}) was deleted successfully.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      setToast({
        type: "error",
        message: getErrorMessage(err) || "Failed to delete student.",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowRegister(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setShowRegister(true);
  };

  const handleCloseForm = () => {
    setShowRegister(false);
    setEditingStudent(null);
  };

  const filteredStudents = students.filter((student) => {
    const query = search.toLowerCase();
    return (
      (student.student_code && student.student_code.toLowerCase().includes(query)) ||
      (student.name && student.name.toLowerCase().includes(query)) ||
      (student.email && student.email.toLowerCase().includes(query)) ||
      (student.course && student.course.toLowerCase().includes(query))
    );
  });

  const columns = [
    {
      key: "student_code",
      label: "Student Code",
      render: (student) => (
        <span className="code-pill">{student.student_code}</span>
      ),
    },
    {
      key: "name",
      label: "Student Name",
      render: (student) => {
        const initials = student.name
          ? student.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()
          : "ST";

        return (
          <div className="person-name-cell">
            <div className="person-avatar student" aria-hidden="true">
              {initials}
            </div>
            <div className="person-meta">
              <span className="person-name">{student.name}</span>
              <span className="person-sub">{student.course || "No Course"}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "email",
      label: "Email Address",
      render: (student) => (
        <span className="text-secondary">{student.email}</span>
      ),
    },
    {
      key: "course",
      label: "Program / Course",
      render: (student) => (
        <span className="course-badge">{student.course || "N/A"}</span>
      ),
    },
    {
      key: "profile_completed",
      label: "Face ID Status",
      render: (student) => {
        const hasFace = Boolean(
          student.has_face || (student.encoding_path && student.profile_completed)
        );
        return (
          <span
            className={`status-pill ${
              hasFace ? "present" : "absent"
            }`}
          >
            <span
              className={`status-dot ${
                hasFace ? "present" : "absent"
              }`}
            />
            {hasFace ? "Face Registered" : "Pending Face"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="management-page students-page">
      {/* Toast Feedback */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Header (Ghost button fixed: only renders when admin) */}
      <PageHeader
        title="Student Directory"
        subtitle="Manage student admissions, academic enrollments, and biometric face registration"
        buttonText={isAdmin ? "Register Student" : undefined}
        onButtonClick={isAdmin ? handleAddStudent : undefined}
        buttonIcon={
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        }
      />

      {/* Slide-down Register / Edit Form Card */}
      {showRegister && (
        <Card>
          <StudentForm
            student={editingStudent}
            onSuccess={fetchStudents}
            onClose={handleCloseForm}
          />
        </Card>
      )}

      {/* Search & Stats Bar */}
      <div className="filter-toolbar">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student code, name, email or course..."
        />
        <div className="filter-count-badge">
          <span>
            Showing <strong>{filteredStudents.length}</strong> of{" "}
            {students.length} students
          </span>
        </div>
      </div>

      {/* Register Face ID Modal */}
      {registeringStudent && (
        <RegisterFaceModal
          studentId={registeringStudent.id}
          studentName={registeringStudent.name}
          student={registeringStudent}
          onSuccess={fetchStudents}
          onClose={() => setRegisteringStudent(null)}
        />
      )}

      {/* Attendance History Modal */}
      {selectedHistoryStudent && (
        <StudentHistoryModal
          student={selectedHistoryStudent}
          onClose={() => setSelectedHistoryStudent(null)}
        />
      )}

      {/* Delete Confirmation Modal (Replaces window.confirm) */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Student Record"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}" (${deleteTarget?.student_code})? This will remove all associated enrollment and attendance history.`}
        confirmText="Delete Student"
        cancelText="Cancel"
        isDanger={true}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Loading state */}
      {loading && (
        <div className="page-loading-state">
          <LoadingSpinner />
          <p>Loading student directory...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="dashboard-error-banner" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="btn-error-retry"
            onClick={fetchStudents}
          >
            Retry
          </button>
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && (
        <Card>
          <div className="table-responsive-wrapper">
            <DataTable
              columns={columns}
              data={filteredStudents}
              renderActions={(student) => (
                <div className="table-actions-row">
                  <button
                    type="button"
                    className="btn-action history"
                    onClick={() => setSelectedHistoryStudent(student)}
                    title="View attendance history"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>History</span>
                  </button>

                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        className="btn-action face-id"
                        onClick={() => setRegisteringStudent(student)}
                        title="Register or update Face ID"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        <span>Face ID</span>
                      </button>

                      <button
                        type="button"
                        className="btn-action edit"
                        onClick={() => handleEditStudent(student)}
                        title="Edit student profile"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        className="btn-action delete"
                        onClick={() => handleOpenDeleteModal(student)}
                        title="Delete student"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            />
          </div>
        </Card>
      )}
    </div>
  );
}