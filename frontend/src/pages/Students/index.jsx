import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

import studentService from "../../services/studentService";
import StudentForm from "./StudentForm";
import RegisterFaceModal from "./RegisterFaceModal";
import DataTable from "../../components/tables/DataTable";

import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";

import { getErrorMessage } from "../../utils/getErrorMessage";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [showRegister, setShowRegister] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [registeringStudent, setRegisteringStudent] = useState(null);

  const [search, setSearch] = useState("");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await studentService.list();

      setStudents(data.students || data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmed) return;

    try {
      await studentService.remove(id);
      await fetchStudents();
      alert("Student deleted successfully.");
    } catch (err) {
      alert(getErrorMessage(err));
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
      student.student_code.toLowerCase().includes(query) ||
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    );
  });

  const columns = [
    {
      key: "student_code",
      label: "Student Code",
    },
    {
      key: "name",
      label: "Name",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "course",
      label: "Course",
    },
    {
      key: "profile_completed",
      label: "Profile Status",
      render: (student) => (
        <span
          style={{
            color: student.profile_completed ? "#16a34a" : "#ea580c",
            fontWeight: "600",
            fontSize: "0.85rem",
          }}
        >
          {student.profile_completed ? "COMPLETE" : "INCOMPLETE"}
        </span>
      ),
    },
  ];

  return (
    <div className="students-page">

      <PageHeader
        title="Students"
        buttonText={isAdmin ? "Register Student" : undefined}
        onButtonClick={isAdmin ? handleAddStudent : undefined}
      />

      <SearchBar
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by Student Code, Name or Email..."
      />

      {showRegister && (
        <Card>
          <StudentForm
            student={editingStudent}
            onSuccess={fetchStudents}
            onClose={handleCloseForm}
          />
        </Card>
      )}

      {registeringStudent && (
        <RegisterFaceModal
          studentId={registeringStudent.id}
          studentName={registeringStudent.name}
          student={registeringStudent}
          onSuccess={fetchStudents}
          onClose={() => setRegisteringStudent(null)}
        />
      )}

      {loading && <LoadingSpinner />}

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {!loading && !error && (
        <Card>
          <DataTable
            columns={columns}
            data={filteredStudents}
            renderActions={isAdmin ? (student) => (
              <>
                <button
                  onClick={() => setRegisteringStudent(student)}
                  style={{
                    backgroundColor: "#059669",
                    marginRight: "10px",
                  }}
                >
                  Register Face
                </button>
                <button onClick={() => handleEditStudent(student)}>
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(student.id)}
                  style={{ marginLeft: "10px" }}
                >
                  Delete
                </button>
              </>
            ) : null}
          />
        </Card>
      )}

    </div>
  );
}