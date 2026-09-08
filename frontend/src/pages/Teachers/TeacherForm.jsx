import { useEffect, useState } from "react";
import teacherService from "../../services/teacherService";
import FormField from "../../components/forms/FormField";
import { getErrorMessage } from "../../utils/getErrorMessage";

export default function TeacherForm({ teacher, onSuccess, onClose }) {
  const isEdit = Boolean(teacher);

  const initialForm = {
    teacher_code: "",
    name: "",
    email: "",
    department: "",
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Populate form fields when editing
  useEffect(() => {
    if (teacher) {
      setForm({
        teacher_code: teacher.teacher_code || "",
        name: teacher.name || "",
        email: teacher.email || "",
        department: teacher.department || "",
      });
    } else {
      setForm(initialForm);
    }
    setErrors({});
    setSuccessMessage("");
    setErrorMessage("");
  }, [teacher]);

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

    if (!isEdit && !form.teacher_code.trim()) {
      newErrors.teacher_code = "Teacher Code is required (e.g. TCH-001).";
    }

    if (!form.name.trim()) {
      newErrors.name = "Full teacher name is required.";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Please provide a valid email format.";
    }

    if (!form.department.trim()) {
      newErrors.department = "Department is required (e.g. Computer Science).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      if (isEdit) {
        await teacherService.update(teacher.id, {
          name: form.name.trim(),
          email: form.email.trim(),
          department: form.department.trim(),
        });
        setSuccessMessage("Teacher updated successfully.");
      } else {
        await teacherService.create({
          teacher_code: form.teacher_code.trim(),
          name: form.name.trim(),
          email: form.email.trim(),
          department: form.department.trim(),
        });
        setSuccessMessage("Teacher registered successfully.");
        setForm(initialForm);
      }

      if (onSuccess) {
        await onSuccess();
      }

      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 700);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="management-form-container">
      <div className="form-header-bar">
        <div className="form-header-info">
          <div className="form-icon-badge teacher" aria-hidden="true">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <h2 className="form-title">
              {isEdit ? "Edit Faculty Details" : "Register Faculty Member"}
            </h2>
            <p className="form-subtitle">
              {isEdit
                ? `Updating profile for ${teacher.teacher_code}`
                : "Add a faculty member to the institutional database"}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            className="form-close-btn"
            onClick={onClose}
            disabled={loading}
            aria-label="Close form"
          >
            &times;
          </button>
        )}
      </div>

      {successMessage && (
        <div className="auth-alert success" role="status">
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
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="auth-alert error" role="alert">
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

      <form onSubmit={handleSubmit} noValidate className="management-form">
        <div className="form-fields-grid">
          <FormField
            label="Teacher Code"
            name="teacher_code"
            value={form.teacher_code}
            onChange={handleChange}
            placeholder="e.g. TCH-001"
            disabled={isEdit}
            required={!isEdit}
            error={errors.teacher_code}
            autoComplete="off"
          />

          <FormField
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Dr. Jane Smith"
            required
            error={errors.name}
            autoComplete="name"
          />

          <FormField
            label="Email Address"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="e.g. j.smith@institution.edu"
            required
            error={errors.email}
            autoComplete="email"
          />

          <FormField
            label="Department"
            name="department"
            value={form.department}
            onChange={handleChange}
            placeholder="e.g. Computer Science"
            required
            error={errors.department}
            autoComplete="organization"
          />
        </div>

        <div className="form-actions-bar">
          {onClose && (
            <button
              type="button"
              className="btn-form-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            className="btn-form-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading-content">
                <span className="btn-spinner" aria-hidden="true"></span>
                <span>{isEdit ? "Saving Changes..." : "Registering Faculty..."}</span>
              </span>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Register Faculty"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}