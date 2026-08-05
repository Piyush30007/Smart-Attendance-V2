import { useState } from "react";
import { studentApi } from "../../services/api";

export default function RegisterStudent() {
  const [form, setForm] = useState({ student_code: "", name: "", email: "", course: "" });
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await studentApi.create(form);
      setStatus("Student registered successfully");
    } catch (err) {
      setStatus(err.response?.data?.detail || "Registration failed");
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
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
        />
      ))}
      <button type="submit">Register</button>
    </form>
  );
}
