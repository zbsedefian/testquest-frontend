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
  const [description, setDescription] = useState("");
  const [isTimed, setIsTimed] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [availableFrom, setAvailableFrom] = useState<string | null>(null);
  const [availableUntil, setAvailableUntil] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [showResultsImmediately, setShowResultsImmediately] = useState(true);
  const [allowBackNavigation, setAllowBackNavigation] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [passScore, setPassScore] = useState<number | null>(null);
  const [gradedBy, setGradedBy] = useState("auto");

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
    setAssignedClassroomIds((prev) => {
      const next = new Set(prev);
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
        "/api/tests",
        {
          name,
          description,
          is_timed: isTimed,
          duration_minutes: isTimed ? duration : null,
          max_attempts: maxAttempts,
          available_from: availableFrom || null,
          available_until: availableUntil || null,
          is_published: isPublished,
          show_results_immediately: showResultsImmediately,
          allow_back_navigation: allowBackNavigation,
          shuffle_questions: shuffleQuestions,
          pass_score: passScore,
          graded_by: gradedBy,
        },
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
    <div className="p-6 max-w-5xl mx-auto">
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

      <form onSubmit={handleCreateAssignment} className="space-y-5">
        <div>
          <label className="block font-medium">Assignment Name:</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter test title"
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Timed Test:</label>
          <div className="flex items-center mb-2 space-x-2">
            <input
              type="checkbox"
              checked={isTimed}
              onChange={(e) => setIsTimed(e.target.checked)}
            />
            <label>Enable timer</label>
          </div>
          <input
            type="number"
            value={duration ?? ""}
            onChange={(e) => setDuration(Number(e.target.value))}
            disabled={!isTimed}
            placeholder="Duration in minutes"
            className={`w-full px-3 py-2 rounded border ${
              !isTimed ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
            }`}
          />
        </div>

        <div>
          <label className="block font-medium">Maximum Attempts:</label>
          <input
            type="number"
            min={1}
            value={maxAttempts}
            onChange={(e) => setMaxAttempts(Number(e.target.value))}
            className="w-full px-3 py-2 rounded border"
          />
        </div>

        <div>
          <label className="block font-medium">Available From:</label>
          <input
            type="datetime-local"
            value={availableFrom ?? ""}
            onChange={(e) => setAvailableFrom(e.target.value)}
            className="w-full px-3 py-2 rounded border"
          />
        </div>

        <div>
          <label className="block font-medium">Available Until:</label>
          <input
            type="datetime-local"
            value={availableUntil ?? ""}
            onChange={(e) => setAvailableUntil(e.target.value)}
            className="w-full px-3 py-2 rounded border"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-medium">Other Settings:</label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              <span>Published</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showResultsImmediately}
                onChange={(e) => setShowResultsImmediately(e.target.checked)}
              />
              <span>Show Results Immediately</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={allowBackNavigation}
                onChange={(e) => setAllowBackNavigation(e.target.checked)}
              />
              <span>Allow Back Navigation</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
              />
              <span>Shuffle Questions</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block font-medium">Pass Score (%):</label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={passScore ?? ""}
            onChange={(e) => setPassScore(Number(e.target.value))}
            className="w-full px-3 py-2 rounded border"
            placeholder="e.g., 70.0"
          />
        </div>

        <div>
          <label className="block font-medium">Graded By:</label>
          <select
            value={gradedBy}
            onChange={(e) => setGradedBy(e.target.value)}
            className="w-full px-3 py-2 rounded border"
          >
            <option value="auto">Auto</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Assign to Classrooms:
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

        <div className="flex justify-end gap-x-2 pt-2">
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
          <p className="text-red-600">❌ Failed to create assignment.</p>
        )}
        {message && <p className="text-red-600">{message}</p>}
      </form>
    </div>
  );
}
