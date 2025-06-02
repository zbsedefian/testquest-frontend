import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../auth";

type Result = {
  id: number;
  test_id: number;
  score: number;
  completed_at: string;
  test_name: string;
};

export default function StudentResultsPage() {
  const { user } = useAuth();
  const { studentId } = useParams();
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    axios
      .get(`/api/teacher/student/${studentId}/results`, {
        headers: { "x-user-id": user?.id, "x-user-role": user?.role },
      })
      .then((res) => setResults(res.data))
      .catch(console.error);
  }, [studentId]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        Student #{studentId}'s Test Results
      </h2>
      {results.length === 0 ? (
        <p>No results yet.</p>
      ) : (
        <ul className="space-y-2">
          {results.map((r) => (
            <li key={r.id} className="border-b pb-2">
              <strong>{r.test_name}</strong> <br />
              Score: {r.score} <br />
              Completed: {new Date(r.completed_at).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
