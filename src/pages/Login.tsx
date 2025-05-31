import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // If already logged in, redirect to their dashboard
      navigate(`/${user.role}`, { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("api/auth/login", { username, password });
      const user = res.data;
      setUser(user);
      navigate(`/${user.role}`);
    } catch (err) {
      alert("Login failed");
      console.error(err);
    }
  };

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
        Password:{" "}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <br />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
