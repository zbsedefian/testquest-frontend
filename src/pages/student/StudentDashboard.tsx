import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../auth";

interface Test {
  id: number;
  name: string;
}

const colors = [
  "#4caf50", // green
  "#2196f3", // blue
  "#ff9800", // orange
  "#9c27b0", // purple
  "#f44336", // red
  "#00bcd4", // cyan
];

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
      } catch {
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
    <div className="min-h-screen w-full px-4 py-6">
      <h2>Student Dashboard</h2>
      <p>Welcome! From here you can take tests and view your results.</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 20,
          marginTop: 20,
        }}
      >
        {tests.map((test, idx) => (
          <Link
            key={test.id}
            to={`/student/test/${test.id}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 100,
              backgroundColor: colors[idx % colors.length],
              color: "white",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: 18,
              borderRadius: 12,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 8px 12px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 4px 6px rgba(0,0,0,0.1)";
            }}
          >
            {test.name}
          </Link>
        ))}
      </div>
      <div style={{ marginTop: 30 }}>
        <Link to="/student/results" style={{ fontWeight: "bold" }}>
          View My Test Results →
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboard;
