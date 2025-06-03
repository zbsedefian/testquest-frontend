import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../auth";

type Classroom = {
  id: number;
  name: string;
};

const ClassroomManagement = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [teacherId, setTeacherId] = useState<number>(1); // Default teacherId, replace with auth-based value
  const { user } = useAuth();

  const fetchClassrooms = async () => {
    const res = await axios.get(`/api/classrooms`, {
      headers: { "x-user-id": user?.id, "x-user-role": user?.role },
    });
    console.log(res.data);
    setClassrooms(res.data);
  };

  const createClassroom = async () => {
    if (!newClassName) return;
    await axios.post(
      "/api/classrooms/",
      { name: newClassName },
      {
        headers: {
          "x-user-id": user?.id,
          "x-user-role": user?.role,
        },
      }
    );
    setNewClassName("");
    fetchClassrooms();
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Manage Classrooms</h2>
      <div className="mb-6">
        <input
          type="text"
          className="border p-2 mr-2"
          placeholder="New classroom name"
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={createClassroom}
        >
          Create Classroom
        </button>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Your Classrooms:</h3>
        <ul className="space-y-2">
          {Array.isArray(classrooms) && classrooms.length > 0 ? (
            classrooms.map((cls) => (
              <li key={cls.id} className="p-3 border rounded shadow">
                {cls.name}
              </li>
            ))
          ) : (
            <p className="text-gray-500 italic">
              No classrooms yet. Create one above.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ClassroomManagement;
