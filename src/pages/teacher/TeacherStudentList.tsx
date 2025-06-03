import { useEffect, useState } from "react";
import { useAuth } from "../../auth-context";
import axios from "axios";
import { Link } from "react-router-dom";

type Student = {
  id: number;
  username: string;
};

export default function TeacherStudentList() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  useEffect(() => {
    axios
      .get("/api/teacher/students", {
        headers: { "x-user-id": user?.id, "x-user-role": user?.role },
      })
      .then((res) => setStudents(res.data))
      .catch(console.error);
  }, [user?.id, user?.role]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Assigned Students</h2>
      <ul className="space-y-2">
        {students.map((s) => (
          <li key={s.id}>
            <Link
              to={`/teacher/student/${s.id}/results`}
              className="text-blue-600 underline"
            >
              {s.username}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
