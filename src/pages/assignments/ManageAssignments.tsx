import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../auth-context";
import { CreateAssignment } from "./CreateAssignment";
import { AssignTestModal } from "./AssignTestModal";
import { AddQuestionModal } from "./AddQuestionModal";
import { Link } from "react-router-dom";

export default function ManageAssignments() {
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [tab, setTab] = useState<"list" | "create">("list");
  const [mode, setMode] = useState<"edit" | "assign" | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [allTests, setAllTests] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchTests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get("/api/tests", {
        headers: { "x-user-id": user.id, "x-user-role": user.role },
      });
      setAllTests(res.data);
    } catch (err) {
      console.error("Failed to load tests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "list") {
      fetchTests();
    }
  }, [tab, user]);

  const filteredTests = allTests.filter((test) =>
    test.name.toLowerCase().includes(search.toLowerCase())
  );
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const displayedTests = filteredTests.slice(start, end);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Manage Assignments</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setTab("list")}
          className={`px-4 py-2 border-b-2 font-medium ${
            tab === "list"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-black"
          }`}
        >
          Assignments List
        </button>
        <button
          onClick={() => setTab("create")}
          className={`ml-4 px-4 py-2 border-b-2 font-medium ${
            tab === "create"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-black"
          }`}
        >
          Create Assignment
        </button>
      </div>

      {tab === "list" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search tests..."
              className="border px-3 py-1 rounded w-full max-w-sm"
            />
          </div>

          {loading ? (
            <p className="text-gray-500">Loading tests...</p>
          ) : (
            <ul className="space-y-4">
              {displayedTests.map((test) => (
                <li key={test.id} className="border p-4 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <strong>{test.name}</strong>
                    <div className="space-x-2">
                      <Link
                        to={`/admin/tests/${test.id}/edit`}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded inline-block text-center"
                      >
                        Edit Info
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedTestId(test.id);
                          setMode("edit");
                        }}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded"
                      >
                        Add Questions
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTestId(test.id);
                          setMode("assign");
                        }}
                        className="px-3 py-1 text-sm bg-yellow-500 text-white rounded"
                      >
                        Assigned Classes
                      </button>
                      <Link
                        to={`/admin/tests/${test.id}/ranking`}
                        className="px-3 py-1 text-sm bg-purple-600 text-white rounded inline-block text-center"
                      >
                        Rankings
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex justify-center items-center mt-6 gap-4">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>Page {page}</span>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={end >= filteredTests.length}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {tab === "create" && (
        <CreateAssignment
          onBack={() => setTab("list")}
          onAssignmentCreated={() => {
            fetchTests();
            setTab("list");
          }}
        />
      )}

      {mode === "edit" && selectedTestId && (
        <AddQuestionModal
          testId={selectedTestId}
          onClose={() => {
            setMode(null);
            fetchTests();
          }}
        />
      )}

      {mode === "assign" && selectedTestId && (
        <AssignTestModal
          testId={selectedTestId}
          onClose={() => {
            setMode(null);
            fetchTests();
          }}
        />
      )}
    </div>
  );
}
