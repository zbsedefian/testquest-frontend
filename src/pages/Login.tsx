import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<"student" | "teacher" | "admin">("student");
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // If already logged in, redirect to their dashboard
      navigate(`/${user.role}`, { replace: true });
    }
  }, [user, navigate]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setUser({ username, role, id: 1 });
    navigate(`/${role}`);
  }

  // If logged in, this component redirects anyway, so show form by default
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
          onChange={(e) =>
            setRole(e.target.value as "student" | "teacher" | "admin")
          }
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
