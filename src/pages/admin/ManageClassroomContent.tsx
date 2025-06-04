import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../auth-context";
import UserMultiSelectList from "../../components/UserMultiSelectList";
import type { Classroom, User } from "../../types";

export default function ManageClassroomContent() {
  const { user } = useAuth();

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);

  const [newClassName, setNewClassName] = useState("");
  const [newClassTeacherIds, setNewClassTeacherIds] = useState<number[]>([]);
  const [newClassStudentIds, setNewClassStudentIds] = useState<number[]>([]);

  const [assignTeacherId, setAssignTeacherId] = useState<number | null>(null);
  const [assignTeacherClassId, setAssignTeacherClassId] = useState<
    number | null
  >(null);

  const [assignStudentIds, setAssignStudentIds] = useState<number[]>([]);
  const [assignStudentClassId, setAssignStudentClassId] = useState<
    number | null
  >(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const classRes = await axios.get<Classroom[]>("/api/classrooms", {
          headers: { "x-user-id": user?.id, "x-user-role": user?.role },
        });
        setClassrooms(classRes.data);

        const usersRes = await axios.get("/api/admin/users/all", {
          headers: { "x-user-id": user?.id, "x-user-role": user?.role },
        });

        const allUsers: User[] = usersRes.data;
        setTeachers(allUsers.filter((u) => u.role === "teacher"));
        setStudents(allUsers.filter((u) => u.role === "student"));
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();
  }, [user]);

  function toggleId(list: number[], id: number): number[] {
    return list.includes(id) ? list.filter((v) => v !== id) : [...list, id];
  }

  async function handleCreateClassroom() {
    if (!newClassName.trim()) return alert("Enter classroom name");

    try {
      await axios.post(
        "/api/classrooms",
        {
          classroom_name: newClassName,
          teacher_ids: newClassTeacherIds,
          student_ids: newClassStudentIds,
        },
        { headers: { "x-user-id": user?.id, "x-user-role": user?.role } }
      );

      alert("Classroom created!");
      setNewClassName("");
      setNewClassTeacherIds([]);
      setNewClassStudentIds([]);

      const res = await axios.get("/api/classrooms", {
        headers: { "x-user-id": user?.id, "x-user-role": user?.role },
      });
      setClassrooms(res.data);
    } catch {
      alert("Failed to create classroom");
    }
  }

  async function handleAssignTeacher() {
    if (!assignTeacherId || !assignTeacherClassId)
      return alert("Select teacher & class");

    try {
      await axios.post(
        "/api/admin/assign-teachers-to-classroom",
        {
          teacher_ids: [assignTeacherId],
          classroom_id: assignTeacherClassId,
        },
        { headers: { "x-user-id": user?.id, "x-user-role": user?.role } }
      );
      alert("Teacher assigned!");
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        alert(err.response.data.detail); // 👈 shows "already assigned" message
      } else {
        alert("Failed to assign teacher");
      }
    }
  }

  async function handleAssignStudents() {
    if (assignStudentIds.length === 0 || !assignStudentClassId)
      return alert("Select students & class");

    try {
      await axios.post(
        "/api/admin/assign-students-to-classroom",
        {
          student_ids: assignStudentIds,
          classroom_id: assignStudentClassId,
        },
        { headers: { "x-user-id": user?.id, "x-user-role": user?.role } }
      );
      alert("Students assigned!");
      setAssignStudentIds([]);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        alert(err.response.data.detail); // 👈 shows "All students already assigned"
      } else {
        alert("Failed to assign students");
      }
    }
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Classroom Management
      </h2>

      {/* Create classroom */}
      <section className="mb-6 border p-4 rounded">
        <h3 className="text-xl font-semibold mb-2">Create Classroom</h3>
        <input
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
          placeholder="Classroom name"
          className="border px-2 py-1 w-full mb-2"
        />
        <div className="grid md:grid-cols-2 gap-6 mb-4">
          <UserMultiSelectList
            label="Select Teachers:"
            users={teachers}
            selectedIds={newClassTeacherIds}
            onToggle={(id) =>
              setNewClassTeacherIds(toggleId(newClassTeacherIds, id))
            }
          />
          <UserMultiSelectList
            label="Select Students:"
            users={students}
            selectedIds={newClassStudentIds}
            onToggle={(id) =>
              setNewClassStudentIds(toggleId(newClassStudentIds, id))
            }
          />
        </div>

        <button
          onClick={handleCreateClassroom}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Create Classroom
        </button>
      </section>

      {/* Assign teacher */}
      <section className="mb-6 border p-4 rounded">
        <h3 className="text-xl mb-2">Assign Teacher to Existing Classroom</h3>
        <select
          value={assignTeacherId ?? ""}
          onChange={(e) => setAssignTeacherId(Number(e.target.value))}
          className="border px-2 py-1 mr-2"
        >
          <option value="">Select Teacher</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.username}
            </option>
          ))}
        </select>
        <select
          value={assignTeacherClassId ?? ""}
          onChange={(e) => setAssignTeacherClassId(Number(e.target.value))}
          className="border px-2 py-1"
        >
          <option value="">Select Classroom</option>
          {classrooms.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleAssignTeacher}
          className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Assign Teacher
        </button>
      </section>

      {/* Assign students */}
      <section className="mb-6 border p-4 rounded">
        <h3 className="text-xl mb-2">Assign Students to Existing Classroom</h3>
        <div className="grid grid-cols-2 gap-4">
          <ul className="border max-h-48 overflow-y-auto divide-y p-2">
            {students.map((s) => (
              <li key={s.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={assignStudentIds.includes(s.id)}
                  onChange={() =>
                    setAssignStudentIds(toggleId(assignStudentIds, s.id))
                  }
                  className="mr-2"
                />
                {s.username}
              </li>
            ))}
          </ul>
          <div>
            <select
              value={assignStudentClassId ?? ""}
              onChange={(e) => setAssignStudentClassId(Number(e.target.value))}
              className="border px-2 py-1"
            >
              <option value="">Select Classroom</option>
              {classrooms.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAssignStudents}
              className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Assign Students
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
