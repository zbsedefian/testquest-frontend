import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../auth-context";
import type { ClassroomWithUsers } from "../../types";

type Props = {
  onBack?: () => void;
  onAssignmentCreated?: () => void;
};

export function CreateAssignment({ onBack, onAssignmentCreated }: Props) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [classrooms, setClassrooms] = useState<ClassroomWithUsers[]>([]);
  const [assignedClassroomIds, setAssignedClassroomIds] = useState<Set<number>>(
    new Set()
  );
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClassrooms() {
      try {
        const res = await axios.get("/api/classrooms", {
          headers: { "x-user-id": user?.id, "x-user-role": user?.role },
        });
        setClassrooms(res.data);
      } catch {
        setMessage("Failed to fetch classrooms");
      }
    }
    fetchClassrooms();
  }, [user]);

  const toggleClassroom = (id: number) => {
    setAssignedClassroomIds((prev: Set<number>) => {
      const next: Set<number> = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await axios.post(
        "/api/teacher/tests",
        { name },
        {
          headers: {
            "x-user-id": user?.id,
            "x-user-role": user?.role,
          },
        }
      );

      const testId = res.data.id;

      await Promise.all(
        Array.from(assignedClassroomIds).map((id) =>
          axios.post(
            "/api/assign-test-to-classroom",
            { classroom_id: id, test_id: testId },
            {
              headers: {
                "x-user-id": user?.id,
                "x-user-role": user?.role,
              },
            }
          )
        )
      );

      setName("");
      setAssignedClassroomIds(new Set());
      setStatus("success");

      if (onAssignmentCreated) onAssignmentCreated();
    } catch {
      setStatus("error");
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
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto relative">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl font-bold"
            title="Close"
          >
            ×
          </button>
        )}
        <h2 className="text-2xl font-bold mb-4">Create New Assignment</h2>

        <form onSubmit={handleCreateAssignment} className="space-y-6">
          <div>
            <label htmlFor="testName" className="block mb-1 font-medium">
              Assignment Name:
            </label>
            <input
              id="testName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter assignment title..."
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Assign to Classrooms (Optional):
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search classrooms..."
              className="w-full px-3 py-2 mb-3 border rounded"
            />
            <ul className="divide-y border rounded">
              {filtered.map((cls) => {
                const id = cls.classroom.id;
                const isAssigned = assignedClassroomIds.has(id);

                return (
                  <li
                    key={id}
                    className="py-3 px-2 flex justify-between items-center"
                  >
                    <span className="text-lg">
                      {cls.classroom.name}
                      {isAssigned && (
                        <span className="text-green-600 ml-2">(Selected)</span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleClassroom(id)}
                      className={`px-4 py-1.5 text-sm text-white rounded ${
                        isAssigned
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      }`}
                    >
                      {isAssigned ? "Unselect" : "Select"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex justify-end gap-x-2">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Creating..." : "Create Assignment"}
            </button>
          </div>

          {status === "success" && (
            <p className="text-green-600">✅ Assignment created!</p>
          )}
          {status === "error" && (
            <p className="text-red-600">❌ Failed to create assignments.</p>
          )}
          {message && <p className="text-red-600">{message}</p>}
        </form>
      </div>
    </div>
  );
}
