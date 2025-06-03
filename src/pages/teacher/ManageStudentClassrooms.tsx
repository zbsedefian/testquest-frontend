import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../auth";

type Classroom = {
  id: number;
  name: string;
};

type Student = {
  id: number;
  username: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  classrooms: Classroom[];
  onUpdated?: () => void;
};

export default function ManageStudentClassrooms({
  isOpen,
  onClose,
  student,
  classrooms,
  onUpdated,
}: Props) {
  const { user } = useAuth();
  const [assigned, setAssigned] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!student) return;

    const fetchAssigned = async () => {
      try {
        const res = await axios.get(`/api/student/${student.id}/classrooms`, {
          headers: { "x-user-id": user?.id, "x-user-role": user?.role },
        });

        const data = Array.isArray(res.data) ? res.data : [];
        setAssigned(data.map((cls: Classroom) => cls.id));
      } catch (err) {
        console.error(err);
        alert("Failed to load student classrooms.");
        setAssigned([]); // fallback in case of error
      }
    };

    fetchAssigned();
  }, [student]);

  const handleToggle = (id: number) => {
    setAssigned((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!student) return;
    setLoading(true);
    try {
      await axios.post(`/api/student/${student.id}/classrooms`, assigned, {
        headers: { "x-user-id": user?.id, "x-user-role": user?.role },
      });
      alert("Classrooms updated.");
      onClose();
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error(err);
      alert("Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
        >
          ✕
        </button>
        <h2 className="text-2xl font-semibold mb-4">
          Manage Classrooms for{" "}
          <span className="text-blue-600">{student.username}</span>
        </h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {classrooms.map((cls) => {
            const isSelected = assigned.includes(cls.id);
            return (
              <div
                key={cls.id}
                onClick={() => handleToggle(cls.id)}
                className={`cursor-pointer px-4 py-2 rounded border transition-all ${
                  isSelected
                    ? "bg-blue-100 text-blue-800 font-semibold border-blue-400"
                    : "bg-white text-gray-800 hover:bg-gray-50 border-gray-300"
                }`}
              >
                {cls.name}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-sm hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
