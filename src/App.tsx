import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth } from "./auth";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import TestPage from "./pages/TestPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TestResults from "./pages/TestResults";

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
              <TeacherDashboard />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/*"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <AdminDashboard />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
