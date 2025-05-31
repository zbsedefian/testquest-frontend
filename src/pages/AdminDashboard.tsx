import { Link } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Manage all users, system settings, and global configurations.</p>
      {/* Example Links */}
      <ul>
        <li><Link to="/admin/users">Manage Users</Link></li>
      </ul>
    </div>
  );
};

export default AdminDashboard;
