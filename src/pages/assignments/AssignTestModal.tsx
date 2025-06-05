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
  const [bulkLoading, setBulkLoading] = useState<"assign" | "unassign" | null>(
    null
  );
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
        {
          classroom_id: classroomId,
          test_id: testId,
        },
        {
          headers: { "x-user-id": user?.id, "x-user-role": user?.role },
        }
      );
      await fetchData();
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
        {
          classroom_id: classroomId,
          test_id: testId,
        },
        {
          headers: { "x-user-id": user?.id, "x-user-role": user?.role },
        }
      );
      await fetchData();
    } catch {
      setMessage("❌ Failed to unassign test.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleBulkAssign = async () => {
    try {
      setBulkLoading("assign");
      const unassigned = classrooms.filter(
        (c) => !assignedClassroomIds.has(c.classroom.id)
      );
      await Promise.all(
        unassigned.map((c) =>
          axios.post(
            "/api/assign-test-to-classroom",
            {
              classroom_id: c.classroom.id,
              test_id: testId,
            },
            {
              headers: { "x-user-id": user?.id, "x-user-role": user?.role },
            }
          )
        )
      );
      await fetchData();
    } catch {
      setMessage("❌ Failed to assign all.");
    } finally {
      setBulkLoading(null);
    }
  };

  const handleBulkUnassign = async () => {
    try {
      setBulkLoading("unassign");
      const assigned = classrooms.filter((c) =>
        assignedClassroomIds.has(c.classroom.id)
      );
      await Promise.all(
        assigned.map((c) =>
          axios.post(
            "/api/unassign-test-from-classroom",
            {
              classroom_id: c.classroom.id,
              test_id: testId,
            },
            {
              headers: { "x-user-id": user?.id, "x-user-role": user?.role },
            }
          )
        )
      );
      await fetchData();
    } catch {
      setMessage("❌ Failed to unassign all.");
    } finally {
      setBulkLoading(null);
    }
  };

  const filtered = classrooms
    .filter((c) =>
      c.classroom.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aAssigned = assignedClassroomIds.has(a.classroom.id);
      const bAssigned = assignedClassroomIds.has(b.classroom.id);
      return aAssigned === bAssigned ? 0 : aAssigned ? -1 : 1;
    });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Assign Test to Classrooms</h2>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search classrooms..."
          className="w-full px-3 py-2 mb-4 border rounded"
        />

        <div className="flex justify-between mb-3">
          <button
            onClick={handleBulkAssign}
            disabled={bulkLoading !== null}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            Assign All
          </button>
          <button
            onClick={handleBulkUnassign}
            disabled={bulkLoading !== null}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
          >
            Unassign All
          </button>
        </div>

        <ul className="divide-y border rounded">
          {filtered.map((cls) => {
            const id = cls.classroom.id;
            const isAssigned = assignedClassroomIds.has(id);
            const isLoading = loadingId === id;

            return (
              <li
                key={id}
                className="py-3 px-2 flex justify-between items-center"
              >
                <span className="text-lg">
                  {cls.classroom.name}
                  {isAssigned && (
                    <span className="text-green-600 ml-2">(Assigned)</span>
                  )}
                </span>
                <button
                  onClick={() =>
                    isAssigned ? handleUnassign(id) : handleAssign(id)
                  }
                  disabled={isLoading}
                  className={`px-4 py-1.5 text-sm text-white rounded ${
                    isAssigned
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {isLoading
                    ? isAssigned
                      ? "Unassigning..."
                      : "Assigning..."
                    : isAssigned
                    ? "Unassign"
                    : "Assign"}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>

        {message && <p className="text-sm mt-2 text-red-600">{message}</p>}
      </div>
    </div>
  );
}
