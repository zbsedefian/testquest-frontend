import { Link } from "react-router-dom";

const TeacherDashboard = () => {
  return (
    <div>
      <h2>Teacher Dashboard</h2>
      <p>Here you can view your assigned students, create tests, and review results.</p>
      {/* Example Links */}
      <ul>
        <li><Link to="/teacher/students">View Students</Link></li>
        <li><Link to="/teacher/tests">Manage Tests</Link></li>
      </ul>
    </div>
  );
};

export default TeacherDashboard;
