import { useEffect, useState } from "react";
import subjectService from "../../services/subjectService";
import FormField from "../../components/forms/FormField";

export default function SubjectForm({ subject, teachers = [], onSuccess, onClose }) {
  const isEdit = Boolean(subject);

  const initialForm = {
    code: "",
    name: "",
    department: "",
    faculty: "",
    credits: "3",
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (subject) {
      setForm({
        code: subject.code || "",
        name: subject.name || "",
        department: subject.department || "",
        faculty: subject.faculty || "",
        credits: String(subject.credits || "3"),
      });
    } else {
      setForm(initialForm);
    }
    setErrors({});
    setErrorMessage("");
  }, [subject]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [loading, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.code.trim()) {
      newErrors.code = "Subject Code is required (e.g. CS-201).";
    }

    if (!form.name.trim()) {
      newErrors.name = "Subject Name is required.";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    if (!form.department.trim()) {
      newErrors.department = "Department is required (e.g. Computer Science).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage("");

    try {
      if (isEdit) {
        const { data } = await subjectService.update(subject.id, {
          code: form.code.trim(),
          name: form.name.trim(),
          department: form.department.trim(),
          faculty: form.faculty.trim() || "Unassigned",
          credits: Number(form.credits) || 3,
        });
        onSuccess(data, "Subject updated successfully.");
      } else {
        const { data } = await subjectService.create({
          code: form.code.trim(),
          name: form.name.trim(),
          department: form.department.trim(),
          faculty: form.faculty.trim() || "Unassigned",
          credits: Number(form.credits) || 3,
        });
        onSuccess(data, "Subject created successfully.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to save subject.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="subject-form-title"
    >
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-titles">
            <h3 id="subject-form-title" className="modal-title">
              {isEdit ? "Edit Curriculum Subject" : "Add New Curriculum Subject"}
            </h3>
            <p className="modal-subtitle">
              {isEdit
                ? `Updating properties for ${subject.name}`
                : "Register a course module into the curriculum roster"}
            </p>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={loading}
            aria-label="Close dialog"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {errorMessage && (
              <div className="auth-alert error" role="alert" style={{ marginBottom: "12px" }}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="form-fields-grid" style={{ display: "grid", gap: "14px" }}>
              <FormField
                label="Subject Code"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="e.g. CS-201, MATH-101"
                required
                error={errors.code}
                disabled={loading}
              />

              <FormField
                label="Subject Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Database Management Systems"
                required
                error={errors.name}
                disabled={loading}
              />

              <FormField
                label="Department / Course"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
                required
                error={errors.department}
                disabled={loading}
              />

              <div className="form-field">
                <label htmlFor="faculty" className="form-field-label">
                  Assigned Faculty Member
                </label>
                {teachers.length > 0 ? (
                  <select
                    id="faculty"
                    name="faculty"
                    value={form.faculty}
                    onChange={handleChange}
                    disabled={loading}
                    className="form-field-input"
                    style={{ background: "#fff", cursor: "pointer" }}
                  >
                    <option value="">Select Faculty (or leave Unassigned)</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.department || "Faculty"})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="faculty"
                    name="faculty"
                    type="text"
                    value={form.faculty}
                    onChange={handleChange}
                    placeholder="e.g. Dr. Gupta"
                    disabled={loading}
                    className="form-field-input"
                  />
                )}
              </div>

              <div className="form-field">
                <label htmlFor="credits" className="form-field-label">
                  Credit Hours
                </label>
                <input
                  id="credits"
                  name="credits"
                  type="number"
                  min="1"
                  max="6"
                  value={form.credits}
                  onChange={handleChange}
                  disabled={loading}
                  className="form-field-input"
                />
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <span className="btn-loading-content">
                  <span className="btn-spinner" aria-hidden="true" />
                  <span>Saving...</span>
                </span>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Add Subject"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
