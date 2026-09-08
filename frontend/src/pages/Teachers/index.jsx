import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";

import teacherService from "../../services/teacherService";
import TeacherForm from "./TeacherForm";
import DataTable from "../../components/tables/DataTable";

import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmModal from "../../components/common/ConfirmModal";
import Toast from "../../components/common/Toast";

import { getErrorMessage } from "../../utils/getErrorMessage";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [showRegister, setShowRegister] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  // Modal state for deletion
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [search, setSearch] = useState("");

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await teacherService.list();
      setTeachers(data.teachers || data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // Open confirmation modal
  const handleOpenDeleteModal = (teacher) => {
    setDeleteTarget(teacher);
  };

  // Perform deletion
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    try {
      await teacherService.remove(deleteTarget.id);
      await fetchTeachers();
      setToast({
        type: "success",
        message: `Faculty member "${deleteTarget.name}" (${deleteTarget.teacher_code}) was deleted successfully.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      setToast({
        type: "error",
        message: getErrorMessage(err) || "Failed to delete teacher.",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddTeacher = () => {
    setEditingTeacher(null);
    setShowRegister(true);
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setShowRegister(true);
  };

  const handleCloseForm = () => {
    setShowRegister(false);
    setEditingTeacher(null);
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const query = search.toLowerCase();
    return (
      (teacher.teacher_code && teacher.teacher_code.toLowerCase().includes(query)) ||
      (teacher.name && teacher.name.toLowerCase().includes(query)) ||
      (teacher.email && teacher.email.toLowerCase().includes(query)) ||
      (teacher.department && teacher.department.toLowerCase().includes(query))
    );
  });

  const columns = [
    {
      key: "teacher_code",
      label: "Teacher Code",
      render: (teacher) => (
        <span className="code-pill">{teacher.teacher_code}</span>
      ),
    },
    {
      key: "name",
      label: "Faculty Name",
      render: (teacher) => {
        const initials = teacher.name
          ? teacher.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()
          : "TC";

        return (
          <div className="person-name-cell">
            <div className="person-avatar teacher" aria-hidden="true">
              {initials}
            </div>
            <div className="person-meta">
              <span className="person-name">{teacher.name}</span>
              <span className="person-sub">{teacher.department || "General"}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "email",
      label: "Email Address",
      render: (teacher) => (
        <span className="text-secondary">{teacher.email}</span>
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (teacher) => (
        <span className="course-badge">{teacher.department || "N/A"}</span>
      ),
    },
    {
      key: "profile_completed",
      label: "Status",
      render: (teacher) => (
        <span
          className={`status-pill ${
            teacher.profile_completed ? "present" : "absent"
          }`}
        >
          <span
            className={`status-dot ${
              teacher.profile_completed ? "present" : "absent"
            }`}
          />
          {teacher.profile_completed ? "Verified" : "Active"}
        </span>
      ),
    },
  ];

  return (
    <div className="management-page teachers-page">
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Header (Ghost button fixed: only renders when admin) */}
      <PageHeader
        title="Faculty Directory"
        subtitle="Manage faculty members, departmental designations, and academic assignments"
        buttonText={isAdmin ? "Register Teacher" : undefined}
        onButtonClick={isAdmin ? handleAddTeacher : undefined}
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
          <TeacherForm
            teacher={editingTeacher}
            onSuccess={fetchTeachers}
            onClose={handleCloseForm}
          />
        </Card>
      )}

      {/* Search & Stats Bar */}
      <div className="filter-toolbar">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by teacher code, name, email or department..."
        />
        <div className="filter-count-badge">
          <span>
            Showing <strong>{filteredTeachers.length}</strong> of{" "}
            {teachers.length} faculty members
          </span>
        </div>
      </div>

      {/* Delete Confirmation Modal (Replaces window.confirm) */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Faculty Record"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}" (${deleteTarget?.teacher_code})? This will unassign all linked courses and schedules.`}
        confirmText="Delete Faculty"
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
          <p>Loading faculty directory...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="dashboard-error-banner" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="btn-error-retry"
            onClick={fetchTeachers}
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
              data={filteredTeachers}
              renderActions={
                isAdmin
                  ? (teacher) => (
                      <div className="table-actions-row">
                        <button
                          type="button"
                          className="btn-action edit"
                          onClick={() => handleEditTeacher(teacher)}
                          title="Edit faculty profile"
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
                          onClick={() => handleOpenDeleteModal(teacher)}
                          title="Delete faculty member"
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
                      </div>
                    )
                  : null
              }
            />
          </div>
        </Card>
      )}
    </div>
  );
}