import { useEffect, useState } from "react";
import teacherService from "../../services/teacherService";
import FormField from "../../components/forms/FormField";
import { getErrorMessage } from "../../utils/getErrorMessage";

export default function TeacherForm({
  teacher,
  onSuccess,
  onClose,
}) {
  const isEdit = !!teacher;

  const initialForm = {
    teacher_code: "",
    name: "",
    email: "",
    department: "",
  };

  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (teacher) {
      setForm({
        teacher_code: teacher.teacher_code,
        name: teacher.name,
        email: teacher.email,
        department: teacher.department,
      });
    } else {
      setForm(initialForm);
    }
  }, [teacher]);

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
        await teacherService.update(teacher.id, {
          name: form.name,
          email: form.email,
          department: form.department,
        });

        setSuccessMessage("Teacher updated successfully.");
      } else {
        await teacherService.create(form);

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
        {isEdit ? "Edit Teacher" : "Register Teacher"}
      </h2>

      {successMessage && (
        <p className="success">
          {successMessage}
        </p>
      )}

      {errorMessage && (
        <p className="error">
          {errorMessage}
        </p>
      )}

      <FormField
        label="Teacher Code"
        name="teacher_code"
        value={form.teacher_code}
        onChange={handleChange}
        disabled={isEdit}
        required
      />

      <FormField
        label="Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        required
      />

      <FormField
        label="Email"
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        required
      />

      <FormField
        label="Department"
        name="department"
        value={form.department}
        onChange={handleChange}
        required
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