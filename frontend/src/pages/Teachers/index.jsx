import { useEffect, useState } from "react";
import teacherService from "../../services/teacherService";
import TeacherForm from "./TeacherForm";
import DataTable from "../../components/tables/DataTable";

import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";

import { getErrorMessage } from "../../utils/getErrorMessage";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showRegister, setShowRegister] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const [search, setSearch] = useState("");

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await teacherService.list();

      setTeachers(data.teachers || data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this teacher?"
    );

    if (!confirmed) return;

    try {
      await teacherService.remove(id);

      await fetchTeachers();

      alert("Teacher deleted successfully.");
    } catch (err) {
      alert(getErrorMessage(err));
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
      teacher.teacher_code.toLowerCase().includes(query) ||
      teacher.name.toLowerCase().includes(query) ||
      teacher.email.toLowerCase().includes(query)
    );
  });

  const columns = [
    {
      key: "teacher_code",
      label: "Teacher Code",
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
      key: "department",
      label: "Department",
    },
    {
      key: "profile_completed",
      label: "Profile Status",
      render: (teacher) => (
        <span
          style={{
            color: teacher.profile_completed ? "#16a34a" : "#ea580c",
            fontWeight: "600",
            fontSize: "0.85rem",
          }}
        >
          {teacher.profile_completed ? "COMPLETE" : "INCOMPLETE"}
        </span>
      ),
    },
  ];

  return (
    <div className="teachers-page">

      <PageHeader
        title="Teachers"
        buttonText="Register Teacher"
        onButtonClick={handleAddTeacher}
      />

      <SearchBar
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by Teacher Code, Name or Email..."
      />

      {showRegister && (
        <Card>
          <TeacherForm
            teacher={editingTeacher}
            onSuccess={fetchTeachers}
            onClose={handleCloseForm}
          />
        </Card>
      )}

      {loading && <LoadingSpinner />}

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      {!loading && !error && (
        <Card>
          <DataTable
            columns={columns}
            data={filteredTeachers}
            renderActions={(teacher) => (
              <>
                <button
                  onClick={() => handleEditTeacher(teacher)}
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(teacher.id)}
                  style={{ marginLeft: "10px" }}
                >
                  Delete
                </button>
              </>
            )}
          />
        </Card>
      )}

    </div>
  );
}