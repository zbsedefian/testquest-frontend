import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../auth-context";
import type { ClassroomWithUsers } from "../../types";

type Props = {
  testId: number;
  onClose: () => void;
};

export function AssignTestModal({ testId, onClose }: Props) {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState<ClassroomWithUsers[]>([]);
  const [assignedClassroomIds, setAssignedClassroomIds] = useState<Set<number>>(
    new Set()
  );
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [user, testId]);

  const fetchData = async () => {
    try {
      const [classroomRes, assignedRes] = await Promise.all([
        axios.get("/api/classrooms", {
          headers: { "x-user-id": user?.id, "x-user-role": user?.role },
        }),
        axios.get(`/api/tests/${testId}/assigned-classrooms`, {
          headers: { "x-user-id": user?.id, "x-user-role": user?.role },
        }),
      ]);

      setClassrooms(classroomRes.data);

      const ids = Array.isArray(assignedRes.data.classroom_ids)
        ? assignedRes.data.classroom_ids.map(Number)
        : [];
      setAssignedClassroomIds(new Set(ids));
    } catch {
      setMessage("Failed to load data.");
    }
  };

  const handleAssign = async (classroomId: number) => {
    try {
      setLoadingId(classroomId);
      await axios.post(
        "/api/assign-test-to-classroom",
        { classroom_id: classroomId, test_id: testId },
        {
          headers: { "x-user-id": user?.id, "x-user-role": user?.role },
        }
      );
      await fetchData(); // refresh assignment state
    } catch {
      setMessage("❌ Failed to assign test.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleUnassign = async (classroomId: number) => {
    try {
      setLoadingId(classroomId);
      await axios.post(
        "/api/unassign-test-from-classroom",
        { classroom_id: classroomId, test_id: testId },
        {
          headers: { "x-user-id": user?.id, "x-user-role": user?.role },
        }
      );
      await fetchData(); // refresh assignment state
    } catch {
      setMessage("❌ Failed to unassign test.");
    } finally {
      setLoadingId(null);
    }
  };

  const filtered = classrooms.filter((c) =>
    c.classroom.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow max-w-md w-full">
        <h2 className="text-lg font-bold mb-3">Assign Test to Classroom</h2>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search classrooms..."
          className="border px-2 py-1 mb-3 w-full"
        />

        <ul className="max-h-64 overflow-y-auto border rounded p-2 divide-y">
          {filtered.map((cls) => {
            const id = Number(cls.classroom.id);
            const isAssigned = assignedClassroomIds.has(id);
            const isLoading = loadingId === id;

            return (
              <li key={id} className="py-2 flex justify-between items-center">
                <span>{cls.classroom.name}</span>
                {isAssigned ? (
                  <button
                    onClick={() => handleUnassign(id)}
                    disabled={isLoading}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    {isLoading ? "Unassigning..." : "Unassign"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleAssign(id)}
                    disabled={isLoading}
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-sm"
                  >
                    {isLoading ? "Assigning..." : "Assign"}
                  </button>
                )}
              </li>
            );
          })}

          {filtered.length === 0 && (
            <li className="text-center text-gray-400 py-4">No results</li>
          )}
        </ul>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-sm text-gray-600"
          >
            Close
          </button>
        </div>

        {message && <p className="text-sm mt-2">{message}</p>}
      </div>
    </div>
  );
}
