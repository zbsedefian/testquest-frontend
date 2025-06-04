import { useState } from "react";
import TestsList from "./TestsList";
import { CreateTest } from "./CreateTest";
import { AddQuestion } from "./AddQuestion";
import { AssignTestModal } from "./AssignTestModal";

export default function ManageTests() {
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [mode, setMode] = useState<"list" | "create" | "edit" | "assign">(
    "list"
  );

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

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
                setPage(1); // reset to page 1 when search changes
              }}
              placeholder="Search tests..."
              className="border px-3 py-1 rounded w-full max-w-sm"
            />
            <button
              className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => setMode("create")}
            >
              + Create New Test
            </button>
          </div>

          <TestsList
            search={search}
            page={page}
            perPage={perPage}
            onSelectTest={(id) => setSelectedTestId(id)}
            onSetMode={(m) => setMode(m)}
          />

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
              className="px-3 py-1 border rounded"
            >
              Next
            </button>
          </div>
        </>
      )}

      {mode === "create" && <CreateTest />}

      {mode === "edit" && selectedTestId && (
        <AddQuestion testId={selectedTestId} />
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
