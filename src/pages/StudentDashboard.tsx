import { Link } from "react-router-dom";

const StudentDashboard = () => {
  return (
    <div>
      <h2>Student Dashboard</h2>
      <p>Welcome! From here you can take tests and view your results.</p>
      <ul>
        <li><Link to="/student/test/1">Start Test 1</Link></li>
        <li><Link to="/student/test/2">Start Test 2</Link></li>
        <li><Link to="/student/results">View My Test Results</Link></li>
      </ul>
    </div>
  );
};

export default StudentDashboard;
