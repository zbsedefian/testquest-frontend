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
import TeacherStudentList from "./pages/teacher/TeacherStudentList";
import StudentResultsPage from "./pages/student/StudentResultsPage";
import TestsList from "./pages/student/TestsList";
import { CreateTest } from "./pages/teacher/CreateTest";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAssignmentPanel from "./pages/admin/AdminAssignmentPanel";
import TestResults from "./pages/student/TestResults";
import { AddQuestion } from "./pages/teacher/AddQuestion";
import { AssignTest } from "./pages/teacher/AssignTest";
import AdminUserListPanel from "./pages/admin/AdminUserListPanel";
import "./App.css";
import StyleGuide from "./pages/StyleGuide";

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
                <Route path="tests" element={<TestsList />} />
                <Route path="tests/create" element={<CreateTest />} />
                <Route
                  path="tests/:testId/add-question"
                  element={<AddQuestion />}
                />
                <Route path="tests/:testId/assign" element={<AssignTest />} />
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
