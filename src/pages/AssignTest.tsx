import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../auth";

interface Student {
  id: number;
  username: string;
}

interface Test {
  id: number;
  name: string;
}

export function AssignTest() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentsRes, testsRes] = await Promise.all([
          axios.get<Student[]>(`/api/teacher/students`, {
            headers: {
              "x-user-id": user?.id,
              "x-user-role": user?.role,
            },
          }),
          axios.get<Test[]>(`/api/teacher/tests`, {
            headers: {
              "x-user-id": user?.id,
              "x-user-role": user?.role,
            },
          }),
        ]);
        setStudents(studentsRes.data);
        setTests(testsRes.data);
      } catch {
        setError("Failed to load students or tests.");
      }
    }
    fetchData();
  }, [user?.id]);

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudentId || !selectedTestId) {
      setError("Please select both student and test.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await axios.post(
        "/api/teacher/assign-test",
        { student_id: selectedStudentId, test_id: selectedTestId },
        {
          headers: {
              "x-user-id": user?.id,
              "x-user-role": user?.role,
          },
        }
      );
      setSuccess(true);
    } catch {
      setError("Failed to assign test.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleAssign}>
      <label>
        Select Student:
        <select
          value={selectedStudentId ?? ""}
          onChange={(e) => setSelectedStudentId(Number(e.target.value))}
          required
        >
          <option value="" disabled>
            -- Select a student --
          </option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.username}
            </option>
          ))}
        </select>
      </label>

      <label>
        Select Test:
        <select
          value={selectedTestId ?? ""}
          onChange={(e) => setSelectedTestId(Number(e.target.value))}
          required
        >
          <option value="" disabled>
            -- Select a test --
          </option>
          {tests.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Assigning..." : "Assign Test"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>Test assigned successfully!</p>}
    </form>
  );
}
