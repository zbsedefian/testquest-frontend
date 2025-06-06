import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth-context";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Determine destination path based on role
  const rolePath =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "teacher"
      ? "/teacher"
      : user?.role === "student"
      ? "/student"
      : "/"; // fallback

  const handleLogout = () => {
    logout();
    localStorage.clear();
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <Link to={rolePath} className="text-xl font-bold text-blue-600">
        TestQuest
      </Link>

      {user && (
        <div className="flex items-center gap-6 text-sm">
          {/* Role-based navigation */}
          {user.role === "student" && (
            <>
              <Link to="/student" className="hover:text-blue-600">
                Tests
              </Link>
              <Link
                to={`/student/${user?.id}/history`}
                className="hover:text-blue-600"
              >
                Results
              </Link>
            </>
          )}
          {user.role === "teacher" && (
            <>
              <Link to="/teacher/tests" className="hover:text-blue-600">
                Manage Assignments
              </Link>
              <Link to="/teacher/my-students" className="hover:text-blue-600">
                My Students
              </Link>
            </>
          )}
          {user.role === "admin" && (
            <>
              <Link to="/admin/tests" className="hover:text-blue-600">
                Assignments
              </Link>
              <Link to="/admin/classrooms" className="hover:text-blue-600">
                Classrooms
              </Link>
              <Link to="/admin/users" className="hover:text-blue-600">
                Users
              </Link>
            </>
          )}

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
            >
              <span className="font-medium">{user.username}</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-md z-10">
                <Link
                  to="/profile"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  View Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
