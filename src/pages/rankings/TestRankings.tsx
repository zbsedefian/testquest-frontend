import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAuth } from "../../auth-context";

type RankedResult = {
  student_id: number;
  username: string;
  score: number;
};

export default function TestRankings() {
  const { testId } = useParams();
  const { user } = useAuth();
  const [rankings, setRankings] = useState<RankedResult[]>([]);
  const [loading, setLoading] = useState(true);

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
            <th className="p-2 border">Score</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((r, i) => (
            <tr key={r.student_id} className="text-center">
              <td className="p-2 border">{i + 1}</td>
              <td className="p-2 border">{r.username}</td>
              <td className="p-2 border">{r.score}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
