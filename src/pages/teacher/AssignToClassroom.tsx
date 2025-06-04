import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../auth-context";

interface Classroom {
  id: number;
  name: string;
}

export default function AssignToClassroom() {
  const { user } = useAuth();
  const { testId } = useParams<{ testId: string }>();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(
    null
  );
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchClassrooms() {
      try {
        const res = await axios.get<Classroom[]>(`/api/classrooms`, {
          headers: {
            "x-user-id": user?.id,
            "x-user-role": user?.role,
          },
        });
        setClassrooms(res.data);
      } catch {
        setMessage("❌ Failed to load classrooms.");
      }
    }

    fetchClassrooms();
  }, [user]);

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClassroomId || !testId) {
      setMessage("❗ Please select a classroom.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await axios.post(
        "/api/assign-test-to-classroom",
        {
          classroom_id: selectedClassroomId,
          test_id: Number(testId),
        },
        {
          headers: {
            "x-user-id": user?.id,
            "x-user-role": user?.role,
          },
        }
      );
      setMessage("✅ Test assigned to classroom successfully.");
    } catch {
      setMessage("❌ Failed to assign test to classroom.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow bg-white">
      <h2 className="text-xl font-semibold mb-4">
        📚 Assign Test to Classroom
      </h2>

      <form onSubmit={handleAssign} className="space-y-4">
        <label className="block">
          <span className="text-gray-700">Select a classroom:</span>
          <select
            value={selectedClassroomId ?? ""}
            onChange={(e) => setSelectedClassroomId(Number(e.target.value))}
            className="mt-1 block w-full border rounded px-3 py-2"
            required
          >
            <option value="" disabled>
              -- Select classroom --
            </option>
            {classrooms.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Assigning..." : "Assign Test"}
        </button>

        {message && (
          <p
            className={`text-sm mt-2 ${
              message.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
