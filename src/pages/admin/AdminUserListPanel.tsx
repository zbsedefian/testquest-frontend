import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../auth-context";
import type { RelatedUsers, User, PaginatedResponse } from "../../types";
import { UserModal } from "./UserModal";
import { Spinner } from "../../components/Spinner";

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
  const fetchUsers = useCallback(async () => {
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
  }, [page, roleFilter, searchTerm, user?.id, user?.role]);

  useEffect(() => {
    fetchUsers();
    setExpandedUserId(null);
    setRelatedUsers(null);
  }, [fetchUsers]);

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
    <div className="flex flex-col">
      {/* Header */}
      <header className="shrink-0 p-6 border-b bg-white shadow-sm">
        {" "}
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          User Management
        </h2>
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
        <button
          onClick={openCreate}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 whitespace-nowrap"
        >
          + Create User
        </button>
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
      <UserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onUserSaved={fetchUsers}
        editingUser={editingUser}
      />
    </div>
  );
}
