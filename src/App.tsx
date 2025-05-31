import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { RequireAuth } from "./auth";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import TestPage from "./pages/TestPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherStudentList from "./pages/TeacherStudentList";
import StudentResultsPage from "./pages/StudentResultsPage";
import TestResults from "./pages/TestResults";
import AdminUserManagement from "./pages/AdminUserManagement";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/student/*"
          element={
            <RequireAuth allowedRoles={["student", "admin"]}>
              <Routes>
                <Route path="" element={<StudentDashboard />} />
                <Route path="test/:testId" element={<TestPage />} />
                <Route path="results" element={<TestResults />} />
              </Routes>
            </RequireAuth>
          }
        />

        <Route
          path="/teacher/*"
          element={
            <RequireAuth allowedRoles={["teacher", "admin"]}>
              <Routes>
                <Route path="" element={<TeacherDashboard />} />
                <Route path="students" element={<TeacherStudentList />} />
                <Route
                  path="student/:studentId/results"
                  element={<StudentResultsPage />}
                />
              </Routes>
            </RequireAuth>
          }
        />

        <Route
          path="/admin/*"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <Routes>
                <Route path="" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUserManagement />} />
              </Routes>
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
