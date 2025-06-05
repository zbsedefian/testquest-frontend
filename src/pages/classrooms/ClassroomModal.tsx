import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../auth-context";
import UserMultiSelectList from "../../components/UserMultiSelectList";
import type { User, Classroom } from "../../types";

type Props = {
  isOpen: boolean;
  classroom?: Classroom;
  onClose: () => void;
  onSaved: () => void;
};

export default function ClassroomModal({
  isOpen,
  classroom,
  onClose,
  onSaved,
}: Props) {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [teacherIds, setTeacherIds] = useState<number[]>([]);
  const [studentIds, setStudentIds] = useState<number[]>([]);
  const [className, setClassName] = useState("");
  const [saving, setSaving] = useState(false);

  const isEditMode = !!classroom;

  useEffect(() => {
    if (!isOpen) return;

    async function fetchData() {
      try {
        const res = await axios.get("/api/admin/users/all", {
          headers: { "x-user-id": user?.id, "x-user-role": user?.role },
        });
        const users: User[] = res.data;
        setAllUsers(users);

        if (isEditMode && classroom) {
          const details = await axios.get(`/api/classrooms/${classroom.id}`, {
            headers: { "x-user-id": user?.id, "x-user-role": user?.role },
          });

          setClassName(details.data.name);
          setTeacherIds(details.data.teachers.map((t: User) => t.id));
          setStudentIds(details.data.students.map((s: User) => s.id));
        } else {
          setClassName("");
          setTeacherIds([]);
          setStudentIds([]);
        }
      } catch (err) {
        console.error("Failed to fetch users/classroom", err);
      }
    }

    fetchData();
  }, [user, isOpen, classroom]);

  const toggleId = (list: number[], id: number) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  const handleSubmit = async () => {
    if (!className.trim()) return alert("Enter classroom name");
    setSaving(true);

    try {
      const payload = {
        name: className,
        teacher_ids: teacherIds,
        student_ids: studentIds,
      };

      if (isEditMode && classroom) {
        await axios.put(`/api/classrooms/${classroom.id}`, payload, {
          headers: { "x-user-id": user?.id, "x-user-role": user?.role },
        });
        alert("Classroom updated!");
      } else {
        await axios.post("/api/classrooms", {
          classroom_name: className,
          teacher_ids: teacherIds,
          student_ids: studentIds,
        }, {
          headers: { "x-user-id": user?.id, "x-user-role": user?.role },
        });
        alert("Classroom created!");
      }

      onSaved();
    } catch (err) {
      alert(isEditMode ? "Failed to update classroom." : "Failed to create classroom.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const teachers = allUsers.filter((u) => u.role === "teacher");
  const students = allUsers.filter((u) => u.role === "student");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl font-bold"
          title="Close"
        >
          ×
        </button>

        <h3 className="text-2xl font-bold mb-4">
          {isEditMode ? "Edit Classroom" : "Create New Classroom"}
        </h3>

        <input
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="Classroom name"
          className="border px-3 py-2 w-full mb-4 rounded"
        />

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <UserMultiSelectList
            label="Select Teachers:"
            users={teachers}
            selectedIds={teacherIds}
            onToggle={(id) => setTeacherIds(toggleId(teacherIds, id))}
          />
          <UserMultiSelectList
            label="Select Students:"
            users={students}
            selectedIds={studentIds}
            onToggle={(id) => setStudentIds(toggleId(studentIds, id))}
          />
        </div>

        <div className="flex justify-end gap-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {saving
              ? isEditMode
                ? "Saving..."
                : "Creating..."
              : isEditMode
              ? "Save Changes"
              : "Create Classroom"}
          </button>
        </div>
      </div>
    </div>
  );
}
