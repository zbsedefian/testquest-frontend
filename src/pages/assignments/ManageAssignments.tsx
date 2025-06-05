import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../auth-context";
import { CreateAssignment } from "./CreateAssignment";
import { AssignTestModal } from "./AssignTestModal";
import { AddQuestionModal } from "./AddQuestionModal";

export default function ManageAssignments() {
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [mode, setMode] = useState<"list" | "create" | "edit" | "assign">(
    "list"
  );
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
    if (mode === "list") {
      fetchTests();
    }
  }, [mode, user]);

  const filteredTests = allTests.filter((test) =>
    test.name.toLowerCase().includes(search.toLowerCase())
  );
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const displayedTests = filteredTests.slice(start, end);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Manage Assignments</h1>

      {mode === "list" && (
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
            <button
              className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => setMode("create")}
            >
              + Create New Assignment
            </button>
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

      {mode === "create" && (
        <CreateAssignment
          onBack={() => setMode("list")}
          onAssignmentCreated={() => {
            fetchTests();
            setMode("list");
          }}
        />
      )}
      {mode === "edit" && selectedTestId && (
        <AddQuestionModal
          testId={selectedTestId}
          onClose={() => setMode("list")}
        />
      )}
      {mode === "assign" && selectedTestId && (
        <AssignTestModal
          testId={selectedTestId}
          onClose={() => setMode("list")}
        />
      )}
    </div>
  );
}
