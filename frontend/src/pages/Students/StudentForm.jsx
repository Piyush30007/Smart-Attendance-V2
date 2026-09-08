import { useEffect, useState } from "react";
import studentService from "../../services/studentService";
import FormField from "../../components/forms/FormField";
import { getErrorMessage } from "../../utils/getErrorMessage";

export default function StudentForm({ student, onSuccess, onClose }) {
  const isEdit = Boolean(student);

  const initialForm = {
    student_code: "",
    name: "",
    email: "",
    course: "",
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Populate form fields when editing
  useEffect(() => {
    if (student) {
      setForm({
        student_code: student.student_code || "",
        name: student.name || "",
        email: student.email || "",
        course: student.course || "",
      });
    } else {
      setForm(initialForm);
    }
    setErrors({});
    setSuccessMessage("");
    setErrorMessage("");
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-level error on change
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isEdit && !form.student_code.trim()) {
      newErrors.student_code = "Student Code is required (e.g. CS-2024-001).";
    }

    if (!form.name.trim()) {
      newErrors.name = "Full student name is required.";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Please provide a valid email format.";
    }

    if (!form.course.trim()) {
      newErrors.course = "Course/Program is required (e.g. Computer Science).";
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
        await studentService.update(student.id, {
          name: form.name.trim(),
          email: form.email.trim(),
          course: form.course.trim(),
        });
        setSuccessMessage("Student updated successfully.");
      } else {
        await studentService.create({
          student_code: form.student_code.trim(),
          name: form.name.trim(),
          email: form.email.trim(),
          course: form.course.trim(),
        });
        setSuccessMessage("Student registered successfully.");
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
          <div className="form-icon-badge student" aria-hidden="true">
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
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <div>
            <h2 className="form-title">
              {isEdit ? "Edit Student Details" : "Register New Student"}
            </h2>
            <p className="form-subtitle">
              {isEdit
                ? `Updating academic profile for ${student.student_code}`
                : "Add a new student profile to the institutional database"}
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
            label="Student Code"
            name="student_code"
            value={form.student_code}
            onChange={handleChange}
            placeholder="e.g. CS-2024-001"
            disabled={isEdit}
            required={!isEdit}
            error={errors.student_code}
            autoComplete="off"
          />

          <FormField
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. John Doe"
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
            placeholder="e.g. j.doe@institution.edu"
            required
            error={errors.email}
            autoComplete="email"
          />

          <FormField
            label="Course / Program"
            name="course"
            value={form.course}
            onChange={handleChange}
            placeholder="e.g. Computer Science & Eng"
            required
            error={errors.course}
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
                <span>{isEdit ? "Saving Changes..." : "Registering Student..."}</span>
              </span>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Register Student"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}