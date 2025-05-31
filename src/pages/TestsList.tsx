import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export interface Test {
  id: number;
  name: string;
  created_by: number;
}

export default function TestsList() {
  const { user } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    axios
      .get<Test[]>("/api/teacher/tests", {
        headers: { "x-user-id": String(user.id) },
      })
      .then((res) => {
        setTests(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load tests");
        setLoading(false);
        console.error(err);
      });
  }, [user]);

  if (loading) return <p>Loading tests...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h3>Your Tests</h3>
      <button onClick={() => navigate("create")}>Create New Test</button>
      <ul>
        {tests.map((test) => (
          <li key={test.id}>
            {test.name}{" "}
            <Link to={`${test.id}/add-question`}>Add Questions</Link> |{" "}
            <Link to={`${test.id}/assign`}>Assign to Students</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
