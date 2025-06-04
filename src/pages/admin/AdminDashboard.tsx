import { Link } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Admin Dashboard</h2>
      <p className="text-gray-600 mb-6">
        Manage all users, system settings, and global configurations.
      </p>

      <ul className="space-y-4">
        <li>
          <Link
            to="/admin/tests"
            className="block bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-900 transition"
          >
            📝 Manage Assignments
          </Link>
        </li>
        <li>
          <Link
            to="/admin/classrooms"
            className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-900 transition"
          >
            📝 Manage Classrooms
          </Link>
        </li>
        <li>
          <Link
            to="/admin/users"
            className="block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-900 transition"
          >
            👤 Manage Users
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminDashboard;
