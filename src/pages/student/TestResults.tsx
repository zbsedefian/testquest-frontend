import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../auth-context";

type TestResult = {
  id: number;
  test_id: number;
  score: number;
  test_name: string;
  completed_at?: string;
};

const groupByTest = (results: TestResult[]) => {
  return results.reduce((acc, result) => {
    const { test_id, test_name } = result;
    if (!acc[test_id]) {
      acc[test_id] = { test_name, results: [] };
    }
    acc[test_id].results.push(result);
    return acc;
  }, {} as Record<number, { test_name: string; results: TestResult[] }>);
};

export default function TestResults() {
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  const classroomId = searchParams.get("classroomId");

  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !studentId) return;

    const endpoint = `/api/teacher/student/${studentId}/history${
      classroomId ? `?classroom_id=${classroomId}` : ""
    }`;

    axios
      .get(endpoint, {
        headers: { "x-user-id": user?.id, "x-user-role": user?.role },
      })
      .then((res) => {
        setResults(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load test results.");
        setLoading(false);
        console.error(err);
      });
  }, [user, studentId, classroomId]);

  if (!user) return <p className="text-center text-gray-500">Please log in.</p>;
  if (loading)
    return <p className="text-center text-gray-500">Loading results...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (results.length === 0)
    return <p className="text-center text-gray-500">No test results found.</p>;

  const grouped = groupByTest(results);

  return (
    <div className="w-full max-w-2xl mx-auto px-8 py-8">
      <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">
        📊 Test Results
      </h2>

      <div className="space-y-6">
        {Object.entries(grouped).map(([testId, group]) => (
          <div
            key={testId}
            className="bg-white shadow-sm border border-slate-200 rounded-lg p-6"
          >
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              {group.test_name}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              {group.results.length} result
              {group.results.length !== 1 ? "s" : ""} for this test.
            </p>

            <ul className="space-y-2">
              {group.results.map((r) => (
                <li
                  key={r.id}
                  className="flex justify-between items-center bg-slate-50 px-4 py-2 rounded-md border"
                >
                  <span className="text-slate-700 font-medium">
                    Score: {r.score}%
                  </span>
                  {r.completed_at && (
                    <span className="text-sm text-slate-500">
                      {new Date(r.completed_at + "Z").toLocaleString()}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
