import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../auth-context";
import type { Role, User } from "../../types";
import { Spinner } from "../../components/Spinner";

export type UserCreate = {
  username: string;
  password?: string; // Optional in TS, only used when creating
  role: "admin" | "teacher" | "student";
  first_name?: string;
  last_name?: string;
  email?: string;
  created_at?: string; // ISO string format in TS
};

function useFocusTrap(
  ref: React.RefObject<HTMLDivElement | null>,
  active: boolean
) {
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
      }
    }
    document.addEventListener("keydown", handleKeyDown);
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

export function UserModal({
  isOpen,
  onClose,
  onUserSaved,
  editingUser,
}: ModalProps) {
  const { user } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const [username, setUsername] = useState(editingUser?.username || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(editingUser?.role || "student");
  const [firstName, setFirstName] = useState(editingUser?.first_name || "");
  const [lastName, setLastName] = useState(editingUser?.last_name || "");
  const [email, setEmail] = useState(editingUser?.email || "");
  const [loading, setLoading] = useState(false);

  useFocusTrap(modalRef, isOpen);

  useEffect(() => {
    if (editingUser) {
      setUsername(editingUser.username);
      setRole(editingUser.role);
      setFirstName(editingUser.first_name || "");
      setLastName(editingUser.last_name || "");
      setEmail(editingUser.email || "");
    } else {
      setUsername("");
      setRole("student");
      setPassword("");
      setFirstName("");
      setLastName("");
      setEmail("");
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
      const payload: UserCreate = {
        username,
        role,
        email,
        first_name: firstName,
        last_name: lastName,
      };
      if (!editingUser) payload.password = password;
      else if (password) payload.password = password;

      await axios[editingUser ? "put" : "post"](
        editingUser ? `/api/admin/user/${editingUser.id}` : "/api/admin/user",
        payload,
        {
          headers: { "x-user-id": user?.id, "x-user-role": user?.role },
        }
      );
      alert(editingUser ? "User updated!" : "User created!");
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

          <div>
            <label htmlFor="firstName" className="block font-medium mb-1">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={loading}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block font-medium mb-1">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={loading}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="email" className="block font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
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
