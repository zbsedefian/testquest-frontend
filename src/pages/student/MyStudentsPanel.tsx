import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../auth-context";
import type { ClassroomWithStudents } from "../../types";
import { Link } from "react-router-dom";

export default function MyStudentsPanel() {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState<ClassroomWithStudents[]>([]);
  const [search, setSearch] = useState("");
  const [classroomFilter, setClassroomFilter] = useState<string>("All");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get("/api/teacher/students", {
          headers: {
            "x-user-id": user?.id,
            "x-user-role": user?.role,
          },
        });
        setClassrooms(res.data);
      } catch (err) {
        console.error("Failed to fetch students", err);
        alert("Error loading student list");
      }
    }
    fetchData();
  }, [user]);

  const allStudents = classrooms.flatMap((c) =>
    c.students.map((s) => ({
      ...s,
      classroom_id: c.classroom_id,
      classroom_name: c.classroom_name,
    }))
  );

  const filtered = allStudents.filter((s) => {
    const matchSearch = s.username.toLowerCase().includes(search.toLowerCase());
    const matchClass =
      classroomFilter === "All" || s.classroom_name === classroomFilter;
    return matchSearch && matchClass;
  });

  const uniqueClassrooms = classrooms.map((c) => c.classroom_name);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">My Students</h2>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search student by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
        <select
          value={classroomFilter}
          onChange={(e) => setClassroomFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="All">All Classrooms</option>
          {uniqueClassrooms.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <table className="min-w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">Student Name</th>
            <th className="border px-4 py-2 text-left">Classroom</th>
            <th className="border px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-4 text-gray-500">
                No matching students found.
              </td>
            </tr>
          ) : (
            filtered.map((s) => (
              <tr key={`${s.id}-${s.classroom_id}`}>
                <td className="border px-4 py-2">{s.username}</td>
                <td className="border px-4 py-2">{s.classroom_name}</td>
                <td className="border px-4 py-2 text-center">
                  <Link
                    to={`/teacher/student/${s.id}/history?classroomId=${s.classroom_id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View Test History
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
