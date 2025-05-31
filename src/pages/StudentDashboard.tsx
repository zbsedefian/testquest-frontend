import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../auth";

interface Test {
  id: number;
  name: string;
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTests() {
      try {
        setLoading(true);
        const res = await axios.get<Test[]>("/api/student/tests", {
          headers: {
            "x-user-id": user?.id.toString(),
            "x-user-role": user?.role,
          },
        });
        setTests(res.data);
      } catch (err) {
        setError("Failed to load tests");
      } finally {
        setLoading(false);
      }
    }
    fetchTests();
  }, []);

  if (loading) return <p>Loading tests...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Student Dashboard</h2>
      <p>Welcome! From here you can take tests and view your results.</p>
      <ul>
        {tests.map((test) => (
          <li key={test.id}>
            <Link to={`/student/test/${test.id}`}>Start {test.name}</Link>
          </li>
        ))}
        <li>
          <Link to="/student/results">View My Test Results</Link>
        </li>
      </ul>
    </div>
  );
};

export default StudentDashboard;
