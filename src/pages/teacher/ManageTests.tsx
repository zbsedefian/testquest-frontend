import React, { useState } from "react";
import TestsList from "./TestsList";
import { CreateTest } from "./CreateTest";
import { AddQuestion } from "./AddQuestion";
import { AssignTest } from "./AssignTest";

export default function ManageTests() {
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [mode, setMode] = useState<"list" | "create" | "edit" | "assign">(
    "list"
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Manage Tests</h1>

      {mode === "list" && (
        <>
          <TestsList
            onEdit={(testId) => {
              setSelectedTestId(testId);
              setMode("edit");
            }}
            onAssign={(testId) => {
              setSelectedTestId(testId);
              setMode("assign");
            }}
          />
          <button
            className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => setMode("create")}
          >
            + Create New Test
          </button>
        </>
      )}

      {mode === "create" && (
        <CreateTest
          onDone={() => {
            setMode("list");
          }}
        />
      )}

      {mode === "edit" && selectedTestId && (
        <AddQuestion
          testId={selectedTestId}
          onBack={() => {
            setMode("list");
            setSelectedTestId(null);
          }}
        />
      )}

      {mode === "assign" && selectedTestId && (
        <AssignTest
          testId={selectedTestId}
          onClose={() => {
            setMode("list");
            setSelectedTestId(null);
          }}
        />
      )}
    </div>
  );
}
