import { useState } from "react";
import TestsList from "./TestsList";
import { CreateTest } from "./CreateTest";
import { AddQuestion } from "./AddQuestion";
import { AssignTest } from "./AssignTest";

export default function ManageTests() {
  const [selectedTestId] = useState<number | null>(null);
  const [mode, setMode] = useState<"list" | "create" | "edit" | "assign">(
    "list"
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Manage Tests</h1>

      {mode === "list" && (
        <>
          <TestsList />
          <button
            className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => setMode("create")}
          >
            + Create New Test
          </button>
        </>
      )}

      {mode === "create" && <CreateTest />}

      {mode === "edit" && selectedTestId && <AddQuestion />}

      {mode === "assign" && selectedTestId && <AssignTest />}
    </div>
  );
}
