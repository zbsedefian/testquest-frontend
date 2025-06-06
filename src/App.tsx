import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { RequireAuth } from "./auth";
import Login from "./pages/login/Login";
import StudentDashboard from "./pages/dashboards/StudentDashboard";
import TestPage from "./pages/student/TestPage";
import TeacherDashboard from "./pages/dashboards/TeacherDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import TestResults from "./pages/student/TestResults";
import UserManagement from "./pages/users/UserManagement";
import "./App.css";
import NavBar from "./pages/NavBar";
import Profile from "./pages/login/Profile";
import ManageAssignments from "./pages/assignments/ManageAssignments";
import ClassroomManagement from "./pages/classrooms/ClassroomManagement";
import Signup from "./pages/login/Signup";
import MyStudentsPanel from "./pages/student/MyStudentsPanel";
import EditAssignment from "./pages/assignments/EditAssignment";
import BeginTestPage from "./pages/student/BeginTestPage";

import { useAuth } from "./auth-context";

function DefaultRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "admin":
      return <Navigate to="/admin" replace />;
    case "teacher":
      return <Navigate to="/teacher" replace />;
    case "student":
      return <Navigate to="/student" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <Router>
      <NavBar></NavBar>
      <Routes>
        <Route path="*" element={<DefaultRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />

        <Route
          path="/student/*"
          element={
            <RequireAuth allowedRoles={["student", "admin"]}>
              <div className="flex flex-col min-h-screen">
                <Routes>
                  <Route path="" element={<StudentDashboard />} />
                  <Route path="test/:testId" element={<TestPage />} />
                  <Route path=":studentId/history" element={<TestResults />} />
                  <Route
                    path="test/:testId/begin"
                    element={<BeginTestPage />}
                  />
                </Routes>
              </div>
            </RequireAuth>
          }
        />

        <Route
          path="/teacher/*"
          element={
            <RequireAuth allowedRoles={["teacher", "admin"]}>
              <Routes>
                <Route path="" element={<TeacherDashboard />} />
                <Route path="tests" element={<ManageAssignments />} />
                <Route path="my-students" element={<MyStudentsPanel />} />
                <Route
                  path="student/:studentId/history"
                  element={<TestResults />}
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
                <Route path="users" element={<UserManagement />} />
                <Route path="classrooms" element={<ClassroomManagement />} />
                <Route path="tests" element={<ManageAssignments />} />
                <Route path="tests/:id/edit" element={<EditAssignment />} />
              </Routes>
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
