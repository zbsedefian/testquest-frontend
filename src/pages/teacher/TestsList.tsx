import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth-context";

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

  useEffect(() => {
    if (!user) return;
    axios
      .get<Test[]>("/api/teacher/tests", {
        headers: { "x-user-id": String(user.id), "x-user-role": user.role },
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

  if (loading) return <p className="text-gray-600">Loading tests...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your Tests</h2>

      <div className="grid gap-4">
        {tests.map((test) => (
          <div
            key={test.id}
            className="border rounded-lg p-4 shadow hover:shadow-md transition"
          >
            <h3 className="text-lg font-medium text-gray-900">{test.name}</h3>
            <div className="mt-2 flex gap-4 text-sm text-blue-600 flex-wrap">
              <Link to={`${test.id}/add-question`} className="hover:underline">
                ➕ Add Questions
              </Link>
              <span>|</span>
              <Link to={`${test.id}/assign`} className="hover:underline">
                🎯 Assign to Students
              </Link>
              <span>|</span>
              <Link
                to={`${test.id}/assign-classroom`}
                className="hover:underline"
              >
                📚 Assign to Classrooms
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
