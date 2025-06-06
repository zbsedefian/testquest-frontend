import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../auth-context";

type TopStudent = {
  student_id: number;
  username: string;
  average_score: number;
};

export function TopStudentsPreview() {
  const { user } = useAuth();
  const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/admin/rankings/top", {
        headers: { "x-user-id": user?.id, "x-user-role": user?.role },
      })
      .then((res) => setTopStudents(res.data))
      .catch((err) => {
        console.error("Failed to load top students", err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <p>Loading top students...</p>;
  if (topStudents.length === 0) return <p>No student scores yet.</p>;

  return (
    <div className="bg-white border rounded p-4 shadow-sm">
      <h2 className="text-lg font-bold mb-2">Top Performing Students</h2>
      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-1">Rank</th>
            <th className="border p-1 text-left">Username</th>
            <th className="border p-1">Average</th>
          </tr>
        </thead>
        <tbody>
          {topStudents.map((s, i) => (
            <tr key={s.student_id}>
              <td className="border p-1 text-center">{i + 1}</td>
              <td className="border p-1">{s.username}</td>
              <td className="border p-1 text-center">{s.average_score}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
