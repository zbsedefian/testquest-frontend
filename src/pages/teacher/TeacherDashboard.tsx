import { Link } from "react-router-dom";

const TeacherDashboard = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Teacher Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="tests"
          className="p-4 border rounded shadow hover:bg-gray-100"
        >
          Manage Tests
        </Link>
        <Link
          to="/teacher/students"
          className="p-4 border rounded shadow hover:bg-gray-100"
        >
          Manage Students
        </Link>
        <Link
          to="classrooms"
          className="p-4 border rounded shadow hover:bg-gray-100"
        >
          Manage Classrooms
        </Link>
      </div>
    </div>
  );
};

export default TeacherDashboard;
