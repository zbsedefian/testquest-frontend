import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { RequireAuth } from "./auth";
import Login from "./pages/Login";
import StudentDashboard from "./pages/student/StudentDashboard";
import TestPage from "./pages/student/TestPage";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import StudentResultsPage from "./pages/student/StudentResultsPage";
import { CreateTest } from "./pages/teacher/CreateTest";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAssignmentPanel from "./pages/admin/AdminAssignmentPanel";
import TestResults from "./pages/student/TestResults";
import { AddQuestion } from "./pages/teacher/AddQuestion";
import { AssignTest } from "./pages/teacher/AssignTest";
import AdminUserListPanel from "./pages/admin/AdminUserListPanel";
import "./App.css";
import StyleGuide from "./pages/StyleGuide";
import NavBar from "./pages/NavBar";
import Profile from "./pages/Profile";
import ClassroomManagement from "./pages/teacher/ClassroomManagement";
import StudentManagement from "./pages/teacher/StudentManagement";
import ManageTests from "./pages/teacher/ManageTests";
import AssignToClassroom from "./pages/teacher/AssignToClassroom";

function App() {
  return (
    <Router>
      <NavBar></NavBar>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />

        <Route
          path="/student/*"
          element={
            <RequireAuth allowedRoles={["student", "admin"]}>
              <div className="flex flex-col min-h-screen">
                <Routes>
                  <Route path="" element={<StudentDashboard />} />
                  <Route path="test/:testId" element={<TestPage />} />
                  <Route path="results" element={<TestResults />} />
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
                {/* <Route path="students" element={<TeacherStudentList />} /> */}
                <Route
                  path="student/:studentId/results"
                  element={<StudentResultsPage />}
                />
                <Route path="tests" element={<ManageTests />} />
                <Route path="tests/create" element={<CreateTest />} />
                <Route
                  path="tests/:testId/add-question"
                  element={<AddQuestion />}
                />
                <Route path="tests/:testId/assign" element={<AssignTest />} />
                <Route path="students" element={<StudentManagement />} />
                <Route path="classrooms" element={<ClassroomManagement />} />
                <Route
                  path="tests/:testId/assign-classroom"
                  element={<AssignToClassroom />}
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
                <Route path="users" element={<AdminUserListPanel />} />
                <Route path="assignments" element={<AdminAssignmentPanel />} />
              </Routes>
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="style-guide" element={<StyleGuide />} />
      </Routes>
    </Router>
  );
}

export default App;
