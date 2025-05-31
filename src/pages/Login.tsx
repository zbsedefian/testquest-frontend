import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth"; // your auth context hook

const Login = () => {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<"student" | "teacher" | "admin">("student");
  const user = useAuth();
  const navigate = useNavigate();

  if (!user?.setUser) return null;

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // Simple mock login, real backend login later
    user.setUser({ username, role, id: 1 });
    if (role === "student") navigate("/student");
    else if (role === "teacher") navigate("/teacher");
    else if (role === "admin") navigate("/admin");
  }

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <label>
        Username:{" "}
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </label>
      <br />
      <label>
        Role:{" "}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "student" | "teacher" | "admin")}
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <br />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
