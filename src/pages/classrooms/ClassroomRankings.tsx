import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth-context";

type Attempt = {
  test_id: number;
  score: number;
  completed_at: string;
};

type RankedStudent = {
  student_id: number;
  username: string;
  average_score: number;
  attempts: Attempt[];
};

export default function ClassroomRankings() {
  const { classroomId } = useParams<{ classroomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [rankings, setRankings] = useState<RankedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  useEffect(() => {
    if (!classroomId || !user) return;

    axios
      .get(`/api/classroom/${classroomId}/rankings`, {
        headers: { "x-user-id": user.id, "x-user-role": user.role },
      })
      .then((res) => {
        setRankings(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch rankings", err);
        alert("Failed to load rankings.");
      })
      .finally(() => setLoading(false));
  }, [classroomId, user]);

  if (loading) return <p className="p-6 text-center">Loading rankings...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-blue-600 hover:underline"
      >
        ← Back to Dashboard
      </button>

      <h1 className="text-2xl font-bold mb-4">Classroom Rankings</h1>

      <table className="w-full border border-gray-300 rounded">
        <thead className="bg-gray-100 text-sm">
          <tr>
            <th className="p-2 border">Rank</th>
            <th className="p-2 border text-left">Student</th>
            <th className="p-2 border">Avg. Score</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((r, i) => (
            <tr key={r.student_id} className="text-center hover:bg-gray-50">
              <td className="p-2 border">{i + 1}</td>
              <td className="p-2 border text-left">{r.username}</td>
              <td
                className="p-2 border text-blue-600 hover:underline cursor-pointer relative"
                onClick={() =>
                  setSelectedStudent(
                    selectedStudent === r.student_id ? null : r.student_id
                  )
                }
              >
                {r.average_score.toFixed(2)}%
                {selectedStudent === r.student_id && (
                  <div className="absolute z-10 mt-1 left-1/2 transform -translate-x-1/2 bg-white border rounded shadow-lg p-2 w-64 text-sm">
                    <div className="font-semibold mb-1">Test Attempts:</div>
                    <ul className="max-h-40 overflow-auto text-left">
                      {r.attempts.map((a, idx) => (
                        <li key={idx} className="border-t py-1">
                          Test {a.test_id}: {a.score}%<br />
                          <span className="text-xs text-gray-500">
                            {new Date(a.completed_at).toLocaleString()}
                          </span>
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
