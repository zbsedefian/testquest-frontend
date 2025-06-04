import { useState } from "react";
import ClassroomSummaryList from "./ClassroomSummaryList";
import ManageClassroomContent from "./ManageClassroomContent";

// Add tab options
type Tab = "manage" | "view";

export default function AdminClassroomManagement() {
  const [tab, setTab] = useState<Tab>("manage");

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setTab("manage")}
            className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-all duration-150 ${
              tab === "manage"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Manage Classrooms
          </button>
          <button
            onClick={() => setTab("view")}
            className={`ml-4 px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-all duration-150 ${
              tab === "view"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            View Classrooms
          </button>
        </div>
      </div>

      {/* Conditional tab content */}
      {tab === "manage" ? <ManageClassroomContent /> : <ClassroomSummaryList />}
    </div>
  );
}
