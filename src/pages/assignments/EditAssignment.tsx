import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../auth-context";
import { Link, useParams } from "react-router-dom";
import { AssignClassroomsPanel } from "./AssignClassroomsPanel";

// Define the shape of the test form explicitly
interface TestForm {
  name: string;
  description?: string;
  is_timed: boolean;
  duration_minutes?: number;
  max_attempts: number;
  available_from?: string;
  available_until?: string;
  graded_by: "auto" | "manual";
}

export default function EditAssignment() {
  const { user } = useAuth();
  const { id } = useParams();
  const testId = Number(id);
  const [form, setForm] = useState<TestForm | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "saving" | "success" | "error"
  >("idle");

  function toUTCString(local: string | undefined): string | undefined {
    return local ? new Date(local).toISOString() : undefined;
  }

  useEffect(() => {
    async function fetchTest() {
      try {
        setStatus("loading");
        const res = await axios.get(`/api/tests/${testId}`, {
          headers: { "x-user-id": user?.id, "x-user-role": user?.role },
        });
        setForm(res.data);
        setStatus("idle");
      } catch {
        setStatus("error");
      }
    }
    fetchTest();
  }, [testId, user]);

  const updateForm = <K extends keyof TestForm>(
    field: K,
    value: TestForm[K]
  ) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setStatus("saving");
    try {
      await axios.put(
        `/api/tests/${testId}`,
        {
          ...form,
          available_from: toUTCString(form.available_from),
          available_until: toUTCString(form.available_until),
        },
        {
          headers: { "x-user-id": user?.id, "x-user-role": user?.role },
        }
      );
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (!form) return <p className="p-6">Loading test info...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Edit Test Info</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-medium">Test Name:</label>
          <input
            value={form.name || ""}
            onChange={(e) => updateForm("name", e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Description:</label>
          <textarea
            value={form.description || ""}
            onChange={(e) => updateForm("description", e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <div className="flex items-center mb-2 space-x-2">
            <input
              type="checkbox"
              checked={form.is_timed}
              onChange={(e) => updateForm("is_timed", e.target.checked)}
            />
            <label>Timed Test (minutes)</label>
          </div>
          <input
            type="number"
            value={form.duration_minutes || ""}
            onChange={(e) =>
              updateForm(
                "duration_minutes",
                Math.max(1, Number(e.target.value))
              )
            }
            disabled={!form.is_timed}
            placeholder="Duration in minutes"
            className={`w-full px-3 py-2 rounded border ${
              !form.is_timed
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : ""
            }`}
          />
        </div>

        <div>
          <label className="block font-medium">Maximum Attempts:</label>
          <input
            type="number"
            min={1}
            value={form.max_attempts}
            onChange={(e) =>
              updateForm("max_attempts", Math.max(1, Number(e.target.value)))
            }
            className="w-full px-3 py-2 rounded border"
          />
        </div>

        <div>
          <label className="block font-medium">Available From:</label>
          <input
            type="datetime-local"
            value={form.available_from || ""}
            onChange={(e) => updateForm("available_from", e.target.value)}
            className="w-full px-3 py-2 rounded border"
          />
        </div>

        <div>
          <label className="block font-medium">Available Until:</label>
          <input
            type="datetime-local"
            value={form.available_until || ""}
            onChange={(e) => updateForm("available_until", e.target.value)}
            className="w-full px-3 py-2 rounded border"
          />
        </div>

        <label className="block font-medium">Graded By:</label>
        <select
          value={form.graded_by || "auto"}
          onChange={(e) =>
            updateForm("graded_by", e.target.value as "auto" | "manual")
          }
          className="w-full px-3 py-2 rounded border"
        >
          <option value="auto">Auto</option>
          <option value="manual">Manual</option>
        </select>

        <div className="flex justify-end mt-6 space-x-4">
          <Link
            to="/admin/tests"
            className="px-4 py-2 bg-gray-300 text-black rounded inline-flex items-center justify-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={status === "saving"}
          >
            {status === "saving" ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {status === "success" && <p className="text-green-600">✅ Saved!</p>}
        {status === "error" && (
          <p className="text-red-600">❌ Error saving changes</p>
        )}
      </form>

      <div className="mt-8">
        <AssignClassroomsPanel testId={testId} />
      </div>
    </div>
  );
}
