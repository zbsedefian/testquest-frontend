import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../auth-context";
import CreateStudent from "./CreateStudent";
import ManageStudentClassrooms from "./ManageStudentClassrooms";

type User = {
  id: number;
  username: string;
};

type Classroom = {
  id: number;
  name: string;
};

export default function StudentManagement() {
  const { user } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [showCreateStudent, setShowCreateStudent] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

  const fetchStudents = async () => {
    const res = await axios.get("/api/admin/users", {
      params: { role: "student" },
      headers: { "x-user-id": user?.id, "x-user-role": user?.role },
    });
    setStudents(res.data.users);
  };

  const fetchClassrooms = async () => {
    const res = await axios.get("/api/classrooms", {
      headers: { "x-user-id": user?.id, "x-user-role": user?.role },
    });
    console.log(res.data);
    setClassrooms(res.data);
  };

  useEffect(() => {
    fetchStudents();
    fetchClassrooms();
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Student Management</h2>
      <table className="min-w-full table-auto border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">ID</th>
            <th className="border p-2 text-left">Username</th>
            <th className="border p-2 text-left">Assign to Classroom</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr
              key={student.id}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="border px-4 py-2">{student.id}</td>
              <td className="border px-4 py-2">{student.username}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => {
                    setSelectedStudent(student);
                    setShowClassModal(true);
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Manage Classrooms
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={() => setShowCreateStudent(true)}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        + Create Student
      </button>

      <CreateStudent
        isOpen={showCreateStudent}
        onClose={() => setShowCreateStudent(false)}
        onStudentCreated={fetchStudents}
      />

      <ManageStudentClassrooms
        isOpen={showClassModal}
        onClose={() => setShowClassModal(false)}
        student={selectedStudent}
        classrooms={classrooms}
        onUpdated={fetchStudents}
      />
    </div>
  );
}
