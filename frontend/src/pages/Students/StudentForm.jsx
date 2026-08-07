import { useEffect, useState } from "react";
import studentService from "../../services/studentService";
import { getErrorMessage } from "../../utils/getErrorMessage";

export default function StudentForm({
  student,
  onSuccess,
  onClose,
}) {
  const isEdit = !!student;

  const initialForm = {
    student_code: "",
    name: "",
    email: "",
    course: "",
  };

  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  // Fill form when editing
  useEffect(() => {
    if (student) {
      setForm({
        student_code: student.student_code,
        name: student.name,
        email: student.email,
        course: student.course,
      });
    } else {
      setForm(initialForm);
    }
  }, [student]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      if (isEdit) {
        await studentService.update(student.id, {
          name: form.name,
          email: form.email,
          course: form.course,
        });

        setSuccessMessage("Student updated successfully.");
      } else {
        await studentService.create(form);

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
      }, 800);

    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      <h2>
        {isEdit ? "Edit Student" : "Register Student"}
      </h2>

      {successMessage && (
        <p style={{ color: "green" }}>
          {successMessage}
        </p>
      )}

      {errorMessage && (
        <p style={{ color: "red" }}>
          {errorMessage}
        </p>
      )}

      <input
        name="student_code"
        placeholder="Student Code"
        value={form.student_code}
        onChange={handleChange}
        disabled={isEdit}
      />

      <input
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
      />

      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />

      <input
        name="course"
        placeholder="Course"
        value={form.course}
        onChange={handleChange}
      />

      <button
        type="submit"
        disabled={loading}
      >
        {loading
          ? (isEdit ? "Saving..." : "Registering...")
          : (isEdit ? "Save Changes" : "Register")}
      </button>

    </form>
  );
}