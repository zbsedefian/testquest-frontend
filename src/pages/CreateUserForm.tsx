// frontend/src/components/CreateUserForm.tsx
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../auth";

type Role = "student" | "teacher";

type CreateUserFormProps = {
  onUserCreated?: (newUser?: any) => void;
};

export default function CreateUserForm({ onUserCreated }: CreateUserFormProps) {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) return alert("Fill all fields");

    try {
      await axios.post(
        "/api/admin/user",
        { username, password, role },
        {
          headers: {
            "x-user-id": user?.id,
            "x-user-role": user?.role,
          },
        }
      );
      alert("User created!");
      setUsername("");
      setPassword("");
      if (onUserCreated) onUserCreated();
    } catch (err) {
      console.error(err);
      alert("Failed to create user");
    }
  }

  return (
    <section className="mb-6 border p-4 rounded">
      <h2 className="text-xl mb-2">Create User</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Username:{" "}
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="border px-2 py-1"
          />
        </label>
        <br />
        <label>
          Password:{" "}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border px-2 py-1"
          />
        </label>
        <br />
        <label>
          Role:{" "}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="border px-2 py-1"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <br />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Create User
        </button>
      </form>
    </section>
  );
}
