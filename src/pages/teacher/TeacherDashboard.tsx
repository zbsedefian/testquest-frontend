import { Link } from "react-router-dom";

const TeacherDashboard = () => {
  return (
    <div>
      <h2>Teacher Dashboard</h2>
      <p>Here you can view your assigned students, create tests, and review results.</p>
      <ul>
        <li><Link to="students">View Students</Link></li>
        <li><Link to="tests">Manage Tests</Link></li>
        <li><Link to="tests/create">Create Test</Link></li>
      </ul>
    </div>
  );
};

export default TeacherDashboard;
