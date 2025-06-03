import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../auth-context";
import CreateUserForm from "../CreateUserForm";

type User = {
  id: number;
  username: string;
  role: "student" | "teacher" | "admin";
};

type PaginatedUsersResponse = {
  users: User[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

type Test = {
  id: number;
  name: string;
};

export default function AdminAssignmentPanel() {
  const { user } = useAuth();

  // For assigning students to teachers
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(
    null
  );
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );

  // For assigning tests to teachers
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [selectedTeacherForTestId, setSelectedTeacherForTestId] = useState<
    number | null
  >(null);

  // Load users and tests on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const usersRes = await axios.get<PaginatedUsersResponse>(
          "/api/admin/users",
          {
            headers: { "x-user-id": user?.id, "x-user-role": user?.role },
          }
        );
        const allUsers = usersRes.data.users;
        setTeachers(allUsers.filter((u) => u.role === "teacher"));
        setStudents(allUsers.filter((u) => u.role === "student"));

        const testsRes = await axios.get<Test[]>("/api/admin/tests", {
          headers: { "x-user-id": user?.id, "x-user-role": user?.role },
        });
        setTests(testsRes.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, [user?.id, user?.role]);

  async function handleAssignStudent() {
    if (!selectedTeacherId || !selectedStudentId)
      return alert("Select both teacher and student");

    try {
      await axios.post(
        "/api/admin/assign-student-to-teacher",
        {
          teacher_id: selectedTeacherId,
          student_id: selectedStudentId,
        },
        {
          headers: {
            "x-user-id": user?.id,
            "x-user-role": user?.role,
          },
        }
      );
      alert("Student assigned to teacher!");
    } catch {
      alert("Failed to assign student");
    }
  }

  async function handleAssignTestToTeacher() {
    if (!selectedTeacherForTestId || !selectedTestId)
      return alert("Select teacher and test");

    try {
      await axios.post(
        "/api/admin/assign-test-to-teacher",
        {
          teacher_id: selectedTeacherForTestId,
          test_id: selectedTestId,
        },
        {
          headers: {
            "x-user-id": user?.id,
            "x-user-role": user?.role,
          },
        }
      );
      alert("Test assigned to teacher!");
    } catch {
      alert("Failed to assign test");
    }
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <CreateUserForm />

      <section className="mb-6 border p-4 rounded">
        <h2 className="text-xl mb-2">Assign Student to Teacher</h2>
        <div>
          <select
            value={selectedTeacherId ?? ""}
            onChange={(e) => setSelectedTeacherId(Number(e.target.value))}
            className="border px-2 py-1 mr-2"
          >
            <option value="">Select Teacher</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.username}
              </option>
            ))}
          </select>

          <select
            value={selectedStudentId ?? ""}
            onChange={(e) => setSelectedStudentId(Number(e.target.value))}
            className="border px-2 py-1"
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.username}
              </option>
            ))}
          </select>

          <button
            onClick={handleAssignStudent}
            className="ml-2 px-4 py-2 bg-green-500 text-white rounded"
          >
            Assign
          </button>
        </div>
      </section>

      <section className="border p-4 rounded">
        <h2 className="text-xl mb-2">Assign Test to Teacher</h2>
        <div>
          <select
            value={selectedTeacherForTestId ?? ""}
            onChange={(e) =>
              setSelectedTeacherForTestId(Number(e.target.value))
            }
            className="border px-2 py-1 mr-2"
          >
            <option value="">Select Teacher</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.username}
              </option>
            ))}
          </select>

          <select
            value={selectedTestId ?? ""}
            onChange={(e) => setSelectedTestId(Number(e.target.value))}
            className="border px-2 py-1"
          >
            <option value="">Select Test</option>
            {tests.map((test) => (
              <option key={test.id} value={test.id}>
                {test.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleAssignTestToTeacher}
            className="ml-2 px-4 py-2 bg-purple-500 text-white rounded"
          >
            Assign
          </button>
        </div>
      </section>
    </div>
  );
}
