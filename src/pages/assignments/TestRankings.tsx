import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAuth } from "../../auth-context";

type Attempt = {
  score: number;
  completed_at: string;
};

type RankedResult = {
  student_id: number;
  username: string;
  attempts: Attempt[];
};

export default function TestRankings() {
  const { testId } = useParams();
  const { user } = useAuth();
  const [rankings, setRankings] = useState<RankedResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    if (!testId || !user) return;

    axios
      .get(`/api/test/${testId}/rankings`, {
        headers: { "x-user-id": user.id, "x-user-role": user.role },
      })
      .then((res) => {
        setRankings(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load rankings", err);
        setLoading(false);
      });
  }, [testId, user]);

  if (loading) return <p className="p-6 text-center">Loading rankings...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Test Rankings</h1>
      <table className="w-full border border-gray-300 rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Rank</th>
            <th className="p-2 border">Student</th>
            <th className="p-2 border">Avg. Score</th>
          </tr>
        </thead>
        <tbody>
          {rankings
            .map((r) => ({
              ...r,
              averageScore:
                r.attempts.reduce((sum, a) => sum + a.score, 0) /
                r.attempts.length,
            }))
            .sort((a, b) => b.averageScore - a.averageScore)
            .map((r, i) => (
              <tr key={r.student_id} className="text-center">
                <td className="p-2 border">{i + 1}</td>
                <td className="p-2 border">{r.username}</td>
                <td
                  className="p-2 border text-blue-600 hover:underline cursor-pointer relative"
                  onClick={() =>
                    setSelectedUserId(
                      selectedUserId === r.student_id ? null : r.student_id
                    )
                  }
                >
                  {r.averageScore.toFixed(2)}%
                  {selectedUserId === r.student_id && (
                    <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-white border rounded shadow-lg z-10 w-64 p-2 text-sm">
                      <div className="font-semibold mb-1">Score History:</div>
                      <ul className="max-h-48 overflow-auto">
                        {r.attempts.map((a, idx) => (
                          <li key={idx} className="border-t py-1">
                            {new Date(a.completed_at).toLocaleString()}:{" "}
                            {a.score}%
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
