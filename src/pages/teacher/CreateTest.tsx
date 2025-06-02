import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../auth";

export function CreateTest() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleCreateTest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
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
      setSuccess(true);
      setName("");
    } catch {
      setError("Failed to create test.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleCreateTest}>
      <label>
        Test Name:
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Test"}
      </button>
      {error && <p>{error}</p>}
      {success && <p>Test created successfully!</p>}
    </form>
  );
}
