import { useEffect, useState } from "react";
import axios from "axios";
import type { Classroom } from "../../types";
import { useAuth } from "../../auth-context";
import StudentListModal from "./StudentListModal";
import TestListModal from "./TestListModal";

export default function ClassroomSummaryList() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [search, setSearch] = useState("");
  const [expandedClassroomId, setExpandedClassroomId] = useState<number | null>(
    null
  );
  const [viewStudentsFor, setViewStudentsFor] = useState<Classroom | null>(
    null
  );
  const [viewTestsFor, setViewTestsFor] = useState<Classroom | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchClassrooms() {
      try {
        const res = await axios.get("/api/classrooms-with-users", {
          headers: { "x-user-id": user?.id, "x-user-role": user?.role },
        });
        setClassrooms(res.data);
      } catch (err) {
        console.error("Failed to fetch classrooms", err);
      }
    }

    fetchClassrooms();
  }, [user]);

  const filtered = classrooms.filter((cls) =>
    cls.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mt-8 border-t pt-4">
      <h3 className="text-2xl font-bold mb-2">All Classrooms</h3>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search classrooms..."
        className="border px-2 py-1 rounded mb-4 w-full"
      />
      {filtered.map((cls: Classroom) => (
        <div key={cls.id} className="border rounded mb-2 p-3 bg-gray-50">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() =>
              setExpandedClassroomId(
                expandedClassroomId === cls.id ? null : cls.id
              )
            }
          >
            <span className="font-semibold">{cls.name}</span>
            <span>{expandedClassroomId === cls.id ? "▲" : "▼"}</span>
          </div>

          {expandedClassroomId === cls.id && (
            <div className="mt-2 pl-2">
              <p className="text-sm font-medium">Teachers:</p>
              <ul className="list-disc list-inside mb-2">
                {cls.teachers.map((t) => (
                  <li key={t.id}>{t.username}</li>
                ))}
              </ul>

              <p className="text-sm font-medium">Students:</p>
              {cls.total_students > 5 ? (
                <button
                  onClick={() => setViewStudentsFor(cls)}
                  className="text-blue-600 underline"
                >
                  View all {cls.total_students} students
                </button>
              ) : (
                <ul className="list-disc list-inside">
                  {cls.students.map((s) => (
                    <li key={s.id}>{s.username}</li>
                  ))}
                </ul>
              )}
              <p className="mt-2">
                <button
                  onClick={() => setViewTestsFor(cls)}
                  className="text-purple-600 underline"
                >
                  View assigned tests
                </button>
              </p>
            </div>
          )}
        </div>
      ))}

      {viewStudentsFor && (
        <StudentListModal
          classroom={viewStudentsFor}
          onClose={() => setViewStudentsFor(null)}
        />
      )}
      {viewTestsFor && (
        <TestListModal
          classroom={viewTestsFor}
          onClose={() => setViewTestsFor(null)}
        />
      )}
    </div>
  );
}
