import { useEffect, useState, useCallback } from "react";
import subjectService from "../../services/subjectService";
import teacherService from "../../services/teacherService";

import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import Card from "../../components/common/Card";
import DataTable from "../../components/tables/DataTable";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmModal from "../../components/common/ConfirmModal";
import Toast from "../../components/common/Toast";

import SubjectForm from "./SubjectForm";
import "./Subjects.css";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Form modal state
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Search filter
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [subjectsRes, teachersRes] = await Promise.allSettled([
        subjectService.list(),
        teacherService.list(),
      ]);

      if (subjectsRes.status === "fulfilled") {
        setSubjects(subjectsRes.value.data || []);
      }

      if (teachersRes.status === "fulfilled") {
        const tData = teachersRes.value.data;
        setTeachers(tData.teachers || tData || []);
      }
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Failed to load subjects.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddSubject = () => {
    setEditingSubject(null);
    setShowForm(true);
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSubject(null);
  };

  const handleFormSuccess = (updatedOrNewSubject, message) => {
    handleCloseForm();
    fetchData();
    setToast({
      type: "success",
      message,
    });
  };

  const handleOpenDeleteModal = (subject) => {
    setDeleteTarget(subject);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    try {
      await subjectService.remove(deleteTarget.id);
      await fetchData();
      setToast({
        type: "success",
        message: `Subject "${deleteTarget.name}" (${deleteTarget.code}) was removed successfully.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Failed to delete subject.",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered rows
  const filteredSubjects = subjects.filter((s) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (s.code && s.code.toLowerCase().includes(q)) ||
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.department && s.department.toLowerCase().includes(q)) ||
      (s.faculty && s.faculty.toLowerCase().includes(q))
    );
  });

  const columns = [
    {
      key: "code",
      label: "Course Code",
      render: (row) => <span className="subject-code-tag">{row.code}</span>,
    },
    {
      key: "name",
      label: "Subject Title",
      render: (row) => (
        <div className="person-name-cell">
          <div
            className="person-avatar"
            style={{ background: "#e0e7ff", color: "#4338ca" }}
            aria-hidden="true"
          >
            {row.name ? row.name.charAt(0).toUpperCase() : "S"}
          </div>
          <div className="person-meta">
            <span className="person-name">{row.name}</span>
            <span className="person-sub">{row.department}</span>
          </div>
        </div>
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (row) => <span className="department-badge">{row.department}</span>,
    },
    {
      key: "credits",
      label: "Credits",
      render: (row) => <span className="credits-pill">{row.credits || 3} Credits</span>,
    },
    {
      key: "faculty",
      label: "Assigned Faculty",
      render: (row) => {
        const facultyName = row.faculty || "Unassigned";
        const initials = facultyName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();

        return (
          <div className="faculty-cell">
            <div className="faculty-avatar-mini" aria-hidden="true">
              {initials}
            </div>
            <span>{facultyName}</span>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="table-actions-row">
          <button
            type="button"
            className="btn-action edit"
            title={`Edit ${row.name}`}
            onClick={() => handleEditSubject(row)}
          >
            <svg
              width="15"
              height="15"
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
            title={`Delete ${row.name}`}
            onClick={() => handleOpenDeleteModal(row)}
          >
            <svg
              width="15"
              height="15"
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
      ),
    },
  ];

  return (
    <div className="subjects-page">
      {/* Toast feedback */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Header */}
      <PageHeader
        title="Subjects Management"
        subtitle="Manage curriculum subjects, course codes, and faculty allocations."
        buttonText="Add Subject"
        onButtonClick={handleAddSubject}
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
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        }
      />

      {/* Card Table Container */}
      <Card>
        <div className="subjects-toolbar-bar" style={{ marginBottom: "16px" }}>
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subjects by code, title, department, or faculty..."
          />

          <div className="subjects-stats-banner">
            <span className="subjects-count-pill">
              <strong>{filteredSubjects.length}</strong> of {subjects.length} Subjects
            </span>
          </div>
        </div>

        {loading ? (
          <div className="page-loading-state">
            <LoadingSpinner />
            <p>Loading curriculum subjects...</p>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon-circle" aria-hidden="true">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <h3 className="empty-title">
              {search ? "No Matching Subjects Found" : "No Curriculum Subjects Registered"}
            </h3>
            <p className="empty-description">
              {search
                ? `No subjects match the search query "${search}". Try adjusting your keywords.`
                : "Add courses and subjects to assign them to curriculum departments and faculty."}
            </p>
            {!search && (
              <button
                type="button"
                className="btn-primary"
                onClick={handleAddSubject}
                style={{ marginTop: "12px" }}
              >
                Add Your First Subject
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive-wrapper">
            <DataTable columns={columns} data={filteredSubjects} />
          </div>
        )}
      </Card>

      {/* Add / Edit Subject Modal */}
      {showForm && (
        <SubjectForm
          subject={editingSubject}
          teachers={teachers}
          onSuccess={handleFormSuccess}
          onClose={handleCloseForm}
        />
      )}

      {/* Confirmation Modal for Deletion */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Remove Subject"
        message={
          deleteTarget
            ? `Are you sure you want to remove "${deleteTarget.name}" (${deleteTarget.code}) from the curriculum roster?`
            : ""
        }
        confirmText="Remove Subject"
        cancelText="Cancel"
        isDanger={true}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
