import { useEffect, useState } from "react";
import axios from "axios";

type TestResult = {
  test_id: number;
  score: number;
  total_questions: number;
  test_name?: string; // optional, if your API returns test metadata
};

export default function TestResults() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get("/api/student/results", {
        headers: {
          "x-user-id": "3", // replace with dynamic user info
          "x-user-role": "student",
        },
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
  }, []);

  if (loading) return <p>Loading results...</p>;
  if (error) return <p>{error}</p>;
  if (results.length === 0) return <p>No test results found.</p>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Your Test Results</h2>
      <ul>
        {results.map((result) => (
          <li key={result.test_id} className="mb-2 border-b pb-2">
            <strong>Test ID:</strong> {result.test_id}{" "}
            {result.test_name && `- ${result.test_name}`} <br />
            <strong>Score:</strong> {result.score} / {result.total_questions}
          </li>
        ))}
      </ul>
    </div>
  );
}
