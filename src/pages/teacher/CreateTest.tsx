import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../auth";

export function CreateTest() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      await axios.post(
        "/api/teacher/tests",
        { name },
        {
          headers: {
            "x-user-id": user?.id,
            "x-user-role": user?.role,
          },
        }
      );
      setName("");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleCreateTest} className="space-y-4">
      <label>
        Test Name:
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border px-2 py-1"
        />
      </label>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Creating..." : "Create Test"}
      </button>

      {status === "success" && <p>✅ Test created!</p>}
      {status === "error" && <p>❌ Failed to create test.</p>}
    </form>
  );
}
