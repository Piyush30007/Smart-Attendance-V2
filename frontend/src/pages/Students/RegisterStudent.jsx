import { useState } from "react";
import studentService from "../../services/studentService";
import { getErrorMessage } from "../../utils/getErrorMessage";

export default function RegisterStudent() {
  const [form, setForm] = useState({
    student_code: "",
    name: "",
    email: "",
    course: "",
  });

  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await studentService.create(form);

      setStatus("Student registered successfully");

      // Optional: Clear the form after successful registration
      setForm({
        student_code: "",
        name: "",
        email: "",
        course: "",
      });

    } catch (error) {
      setStatus(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Register Student</h1>

      {status && <p>{status}</p>}

      {Object.keys(form).map((field) => (
        <input
          key={field}
          placeholder={field}
          value={form[field]}
          onChange={(e) =>
            setForm({
              ...form,
              [field]: e.target.value,
            })
          }
        />
      ))}

      <button type="submit">
        Register
      </button>
    </form>
  );
}