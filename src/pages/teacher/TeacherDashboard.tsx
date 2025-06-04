import { Link } from "react-router-dom";

const TeacherDashboard = () => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Teacher Dashboard
      </h2>
      <p className="text-gray-600 mb-6">
        Manage your classes, students, and test assignments.
      </p>

      <ul className="space-y-4">
        <li>
          <Link
            to="/teacher/tests"
            className="block bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-900 transition"
          >
            📝 Manage Assignments
          </Link>
        </li>
        <li>
          <Link
            to="/teacher/students"
            className="block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-900 transition"
          >
            👥 Manage Students
          </Link>
        </li>
        <li>
          <Link
            to="/teacher/classrooms"
            className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-900 transition"
          >
            🏫 Manage Classrooms
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default TeacherDashboard;
