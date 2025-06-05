import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth-context";

export default function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("/api/auth/signup", {
        username,
        password,
        role,
      });
      setUser(res.data);
      navigate(`/${res.data.role}`);
    } catch (err: unknown) {
      console.error(err);

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          setError(err.response.data?.detail || "Invalid input");
        } else {
          setError("Signup failed");
        }
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
          Create Account
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
          >
            Sign up
          </button>
        </form>
      </div>
    </div>
  );
}
