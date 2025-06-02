import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../auth";

// Types
type Role = "student" | "teacher" | "admin";

type User = {
  id: number;
  username: string;
  role: Role;
};

type PaginatedResponse = {
  users: User[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

type RelatedUsers = {
  students?: User[];
  teacher?: User | null;
};

function Spinner() {
  return (
    <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-6 w-6"></div>
  );
}

// Focus trap hook
function useFocusTrap(ref: React.RefObject<HTMLDivElement>, active: boolean) {
  useEffect(() => {
    if (!active || !ref.current) return;

    const focusableElements = ref.current.querySelectorAll<HTMLElement>(
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
    );
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        // Optionally close modal on Escape, but modal component controls that
      }
    }
    document.addEventListener("keydown", handleKeyDown);

    // Focus first element on mount
    firstElement.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, ref]);
}

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUserSaved: () => void;
  editingUser?: User | null;
};

function UserModal({ isOpen, onClose, onUserSaved, editingUser }: ModalProps) {
  const { user } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const [username, setUsername] = useState(editingUser?.username || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(editingUser?.role || "student");
  const [loading, setLoading] = useState(false);

  useFocusTrap(modalRef, isOpen);

  useEffect(() => {
    if (editingUser) {
      setUsername(editingUser.username);
      setRole(editingUser.role);
    } else {
      setUsername("");
      setRole("student");
      setPassword("");
    }
  }, [editingUser, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || (!editingUser && !password)) {
      alert("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      if (editingUser) {
        // Edit user
        await axios.put(
          `/api/admin/user/${editingUser.id}`,
          { username, role, ...(password ? { password } : {}) },
          {
            headers: { "x-user-id": user?.id, "x-user-role": user?.role },
          }
        );
        alert("User updated!");
      } else {
        // Create user
        await axios.post(
          "/api/admin/user",
          { username, password, role },
          {
            headers: { "x-user-id": user?.id, "x-user-role": user?.role },
          }
        );
        alert("User created!");
      }
      onUserSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save user.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 id="modal-title" className="text-2xl font-semibold mb-4">
          {editingUser ? "Edit User" : "Create New User"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block font-medium mb-1">
              Username <span className="text-red-600">*</span>
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              required
            />
          </div>

          {!editingUser && (
            <div>
              <label htmlFor="password" className="block font-medium mb-1">
                Password <span className="text-red-600">*</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {editingUser && (
            <div>
              <label htmlFor="password" className="block font-medium mb-1">
                New Password (optional)
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Leave empty to keep current password"
              />
            </div>
          )}

          <div>
            <label htmlFor="role" className="block font-medium mb-1">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              disabled={loading}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Spinner />}
              {editingUser ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUserListPanel() {
  const { user } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [loadingUsers, setLoadingUsers] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // For expanded user details showing teacher/students
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [relatedUsers, setRelatedUsers] = useState<RelatedUsers | null>(null);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Fetch users
  async function fetchUsers() {
    console.log("Fetching users page:", page);
    setLoadingUsers(true);
    try {
      const res = await axios.get<PaginatedResponse>("/api/admin/users", {
        params: {
          role: roleFilter || undefined,
          search: searchTerm || undefined,
          page,
          per_page: 20,
        },
        headers: { "x-user-id": user?.id, "x-user-role": user?.role },
      });
      setUsers(res.data.users);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      console.error(err);
      alert("Failed to load users.");
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    fetchUsers();
    setExpandedUserId(null);
    setRelatedUsers(null);
  }, [roleFilter, searchTerm, page]);

  // Fetch related users for expanded row
  async function fetchRelatedUsers(userId: number) {
    setLoadingRelated(true);
    setRelatedUsers(null);
    try {
      const res = await axios.get<RelatedUsers>(
        `/api/admin/users/${userId}/related`,
        {
          headers: { "x-user-id": user?.id, "x-user-role": user?.role },
        }
      );
      setRelatedUsers(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load related users.");
    } finally {
      setLoadingRelated(false);
    }
  }

  // Toggle expanded user detail
  function toggleExpand(user: User) {
    if (expandedUserId === user.id) {
      setExpandedUserId(null);
      setRelatedUsers(null);
    } else {
      setExpandedUserId(user.id);
      fetchRelatedUsers(user.id);
    }
  }

  async function handleDelete(userId: number) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`/api/admin/user/${userId}`, {
        headers: { "x-user-id": user?.id, "x-user-role": user?.role },
      });
      alert("User deleted");
      // Refresh list and close expanded if deleted user was expanded
      if (expandedUserId === userId) {
        setExpandedUserId(null);
        setRelatedUsers(null);
      }
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
  }

  // Open modal for edit
  function openEdit(user: User) {
    setEditingUser(user);
    setModalOpen(true);
  }

  // Open modal for create
  function openCreate() {
    setEditingUser(null);
    setModalOpen(true);
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b bg-white shadow-sm">
        <h1 className="text-3xl font-bold">User Management</h1>
      </header>

      {/* Filters */}
      <div className="flex gap-4 p-4 border-b bg-gray-50">
        <select
          value={roleFilter}
          onChange={(e) => {
            setPage(1);
            setRoleFilter(e.target.value);
          }}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>

        <input
          type="text"
          placeholder="Search username"
          value={searchTerm}
          onChange={(e) => {
            setPage(1);
            setSearchTerm(e.target.value);
          }}
          className="border border-gray-300 rounded px-3 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* User table + loading spinner */}
      <div className="flex-grow overflow-auto bg-white">
        {loadingUsers ? (
          <div className="flex justify-center items-center h-full">
            <Spinner />
          </div>
        ) : (
          <table className="min-w-full border-collapse table-auto">
            <thead className="bg-gray-200 sticky top-0 z-10">
              <tr>
                <th className="border px-4 py-2 text-left">ID</th>
                <th className="border px-4 py-2 text-left">Username</th>
                <th className="border px-4 py-2 text-left">Role</th>
                <th className="border px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u, i) => (
                  <React.Fragment key={u.id}>
                    <tr
                      onClick={() => toggleExpand(u)}
                      className={`cursor-pointer ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50`}
                    >
                      <td className="border px-4 py-2">{u.id}</td>
                      <td className="border px-4 py-2">{u.username}</td>
                      <td className="border px-4 py-2">{u.role}</td>
                      <td className="border px-4 py-2 text-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(u);
                          }}
                          className="text-blue-600 hover:underline focus:outline-none"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(u.id);
                          }}
                          className="text-red-600 hover:underline focus:outline-none"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>

                    {/* Expanded related users row */}
                    {expandedUserId === u.id && (
                      <tr className="bg-gray-100">
                        <td colSpan={4} className="p-4">
                          {loadingRelated ? (
                            <div className="flex justify-center items-center">
                              <Spinner />
                            </div>
                          ) : relatedUsers ? (
                            u.role === "student" ? (
                              relatedUsers.teacher ? (
                                <div>
                                  <h3 className="font-semibold mb-2">
                                    Teacher:
                                  </h3>
                                  <div className="p-2 border rounded bg-white">
                                    <div>ID: {relatedUsers.teacher.id}</div>
                                    <div>
                                      Username: {relatedUsers.teacher.username}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div>No teacher assigned.</div>
                              )
                            ) : u.role === "teacher" ? (
                              relatedUsers.students &&
                              relatedUsers.students.length > 0 ? (
                                <div>
                                  <h3 className="font-semibold mb-2">
                                    Students:
                                  </h3>
                                  <ul className="list-disc pl-5 space-y-1 max-h-40 overflow-auto border rounded bg-white p-2">
                                    {relatedUsers.students.map((stu) => (
                                      <li key={stu.id}>
                                        {stu.username} (ID: {stu.id})
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ) : (
                                <div>No students assigned.</div>
                              )
                            ) : (
                              <div>No related users to display.</div>
                            )
                          ) : (
                            <div>No related users loaded.</div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <footer className="p-4 border-t bg-white flex justify-center gap-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="pt-1">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </footer>

      <button
        onClick={openCreate}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        + Create New User
      </button>
      {/* User modal */}
      <UserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onUserSaved={fetchUsers}
        editingUser={editingUser}
      />
    </div>
  );
}
