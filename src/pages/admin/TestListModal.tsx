import { useEffect, useState } from "react";
import axios from "axios";
import type { Classroom, Test } from "../../types";
import { useAuth } from "../../auth-context";

type Props = {
  classroom: Classroom;
  onClose: () => void;
};

export default function TestListModal({ classroom, onClose }: Props) {
  const { user } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTests() {
      try {
        const res = await axios.get(`/api/classrooms/${classroom.id}/tests`, {
          headers: { "x-user-id": user?.id, "x-user-role": user?.role },
        });
        setTests(res.data);
      } catch {
        setError("Failed to load tests.");
      }
    }
    fetchTests();
  }, [classroom.id, user]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">
          Tests Assigned to "{classroom.name}"
        </h2>

        {error && <p className="text-red-500">{error}</p>}

        {tests.length === 0 ? (
          <p>No tests assigned.</p>
        ) : (
          <ul className="list-disc list-inside">
            {tests.map((t) => (
              <li key={t.id}>{t.name}</li>
            ))}
          </ul>
        )}

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 border rounded text-sm text-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
