import { useEffect, useState } from "react";
import axios from "axios";
import type { Classroom, User } from "../../types";
import { useAuth } from "../../auth-context";
import StudentListModal from "./StudentListModal";
import TestListModal from "./TestListModal";
import UserMultiSelectList from "./UserMultiSelectList";

type Props = {
  refreshKey: number;
};

export default function ClassroomSummaryList({ refreshKey }: Props) {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [expandedClassroomId, setExpandedClassroomId] = useState<number | null>(
    null
  );
  const [viewStudentsFor, setViewStudentsFor] = useState<Classroom | null>(
    null
  );
  const [viewTestsFor, setViewTestsFor] = useState<Classroom | null>(null);
  const [editClassroom, setEditClassroom] = useState<Classroom | null>(null);
  const [editTeacherIds, setEditTeacherIds] = useState<number[]>([]);
  const [editStudentIds, setEditStudentIds] = useState<number[]>([]);
  const [editName, setEditName] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchAllData();
  }, [user, refreshKey]);

  async function fetchAllData() {
    try {
      const [classroomRes, usersRes] = await Promise.all([
        axios.get("/api/classrooms-with-users", {
          headers: { "x-user-id": user?.id, "x-user-role": user?.role },
        }),
        axios.get("/api/admin/users/all", {
          headers: { "x-user-id": user?.id, "x-user-role": user?.role },
        }),
      ]);
      setClassrooms(classroomRes.data);

      const allUsers: User[] = usersRes.data;
      setTeachers(allUsers.filter((u) => u.role === "teacher"));
      setStudents(allUsers.filter((u) => u.role === "student"));
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  }

  async function handleDeleteClassroom(id: number) {
    if (!confirm("Are you sure you want to delete this classroom?")) return;

    try {
      await axios.delete(`/api/classrooms/${id}`, {
        headers: { "x-user-id": user?.id, "x-user-role": user?.role },
      });
      fetchAllData();
    } catch (err) {
      console.error("Failed to delete classroom", err);
      alert("Failed to delete classroom");
    }
  }

  function openEditModal(cls: Classroom) {
    setEditClassroom(cls);
    setEditName(cls.name);
    setEditTeacherIds(cls.teachers.map((t) => t.id));
    setEditStudentIds(cls.students.map((s) => s.id));
  }

  async function handleSaveEdit() {
    if (!editClassroom) return;
    try {
      await axios.put(
        `/api/classrooms/${editClassroom.id}`,
        {
          classroom_name: editName,
          teacher_ids: editTeacherIds,
          student_ids: editStudentIds,
        },
        {
          headers: { "x-user-id": user?.id, "x-user-role": user?.role },
        }
      );
      setEditClassroom(null);
      fetchAllData();
    } catch (err) {
      console.error("Failed to update classroom", err);
      alert("Failed to update classroom");
    }
  }

  function toggleId(list: number[], id: number): number[] {
    return list.includes(id) ? list.filter((v) => v !== id) : [...list, id];
  }

  const filtered = classrooms.filter((cls) =>
    cls.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mt-8 border-t pt-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search classrooms..."
        className="border px-2 py-1 rounded mb-4 w-full"
      />
      {filtered.map((cls: Classroom) => (
        <div key={cls.id} className="border rounded mb-2 p-3 bg-gray-50">
          <div className="flex justify-between items-center">
            <div
              className="flex-grow cursor-pointer"
              onClick={() =>
                setExpandedClassroomId(
                  expandedClassroomId === cls.id ? null : cls.id
                )
              }
            >
              <span className="font-semibold">{cls.name}</span>
              <span className="ml-2">
                {expandedClassroomId === cls.id ? "▲" : "▼"}
              </span>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => openEditModal(cls)}
                className="text-sm text-blue-600 underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteClassroom(cls.id)}
                className="text-sm text-red-600 underline"
              >
                Delete
              </button>
            </div>
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

      {editClassroom && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-3xl">
            <h3 className="text-xl font-semibold mb-4">Edit Classroom</h3>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Classroom name"
              className="border px-2 py-1 w-full mb-4"
            />
            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <UserMultiSelectList
                label="Select Teachers:"
                users={teachers}
                selectedIds={editTeacherIds}
                onToggle={(id) =>
                  setEditTeacherIds(toggleId(editTeacherIds, id))
                }
              />
              <UserMultiSelectList
                label="Select Students:"
                users={students}
                selectedIds={editStudentIds}
                onToggle={(id) =>
                  setEditStudentIds(toggleId(editStudentIds, id))
                }
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditClassroom(null)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
