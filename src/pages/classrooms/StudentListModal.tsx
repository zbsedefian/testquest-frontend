import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../auth-context";

type User = {
  id: number;
  username: string;
};

type Classroom = {
  id: number;
  name: string;
};

export default function StudentListModal({
  classroom,
  onClose,
}: {
  classroom: Classroom;
  onClose: () => void;
}) {
  const [students, setStudents] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await axios.get(
          `/api/classrooms/${classroom.id}/students`,
          {
            headers: { "x-user-id": user?.id, "x-user-role": user?.role },
          }
        );
        setStudents(res.data);
      } catch (err) {
        console.error("Failed to fetch students", err);
      }
    }

    fetchStudents();
  }, [classroom.id, user]);

  const filtered = students.filter((s) =>
    s.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded shadow-lg max-w-lg w-full max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            Students in {classroom.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-xl"
          >
            ✕
          </button>
        </div>
        <div className="p-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="border px-2 py-1 rounded mb-3 w-full"
          />
          <ul className="max-h-[50vh] overflow-y-auto divide-y">
            {filtered.map((s) => (
              <li key={s.id} className="py-2">
                {s.username}
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="text-gray-500 text-sm py-2 text-center">
                No results
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
