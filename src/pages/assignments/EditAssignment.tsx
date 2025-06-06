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

  function toDatetimeLocal(value: string | null | undefined) {
    if (!value) return "";
    const date = new Date(value);
    return date.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
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
      await axios.put(`/api/tests/${testId}`, form, {
        headers: { "x-user-id": user?.id, "x-user-role": user?.role },
      });
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

        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={form.is_timed}
              onChange={(e) => updateForm("is_timed", e.target.checked)}
            />
            <span>Timed</span>
          </label>
          <input
            type="number"
            disabled={!form.is_timed}
            value={form.duration_minutes || ""}
            onChange={(e) =>
              updateForm("duration_minutes", Number(e.target.value))
            }
            className="w-full border px-3 py-2 rounded"
            placeholder="Duration (min)"
          />
        </div>

        <input
          type="number"
          value={form.max_attempts || 1}
          onChange={(e) => updateForm("max_attempts", Number(e.target.value))}
          className="w-full border px-3 py-2 rounded"
          placeholder="Max Attempts"
        />

        <input
          type="datetime-local"
          value={toDatetimeLocal(form.available_from)}
          onChange={(e) => updateForm("available_from", e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />

        <input
          type="datetime-local"
          value={toDatetimeLocal(form.available_until)}
          onChange={(e) => updateForm("available_until", e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />

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
