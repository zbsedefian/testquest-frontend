import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../auth";

export function AssignTest() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | "">("");
  const [selectedTestId, setSelectedTestId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, testsRes] = await Promise.all([
          axios.get("/api/teacher/students", {
            headers: { "x-user-id": user?.id, "x-user-role": user?.role },
          }),
          axios.get("/api/teacher/tests", {
            headers: { "x-user-id": user?.id, "x-user-role": user?.role },
          }),
        ]);
        setStudents(studentsRes.data);
        setTests(testsRes.data);
      } catch {
        setMessage("Failed to load students or tests.");
      }
    };
    fetchData();
  }, [user]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedTestId) {
      setMessage("Please select both a student and a test.");
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
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
      setMessage("✅ Test assigned successfully.");
    } catch (err: any) {
      if (err.response?.status === 409) {
        setMessage("❌ This student has already been assigned to that test.");
      } else {
        setMessage("❌ Failed to assign test.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAssign} className="space-y-4">
      <div>
        <label className="block font-medium">Student:</label>
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(Number(e.target.value))}
          disabled={loading}
          className="border rounded px-2 py-1"
        >
          <option value="">-- Select --</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.username}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium">Test:</label>
        <select
          value={selectedTestId}
          onChange={(e) => setSelectedTestId(Number(e.target.value))}
          disabled={loading}
          className="border rounded px-2 py-1"
        >
          <option value="">-- Select --</option>
          {tests.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Assigning..." : "Assign Test"}
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}
