import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../auth"; // Your auth hook

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
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    axios
      .get("/api/student/test-results", {
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
  }, [user]);

  if (!user) return <p>Please log in.</p>;
  if (loading) return <p>Loading results...</p>;
  if (error) return <p>{error}</p>;
  if (results.length === 0) return <p>No test results found.</p>;
  const grouped = groupByTest(results);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Test Results</h2>
      {Object.entries(grouped).map(([testId, group]) => (
        <div key={testId} className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{group.test_name}</h3>
          <h5>
            You have {group.results.length} result
            {group.results.length !== 1 ? "s" : ""} for this test.
          </h5>
          <ul className="ml-4 list-disc">
            {group.results.map((r) => (
              <li key={r.id}>
                Score: {r.score}
                {r.completed_at && (
                  <> (Completed: {new Date(r.completed_at).toLocaleString()})</>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
