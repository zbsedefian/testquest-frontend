import { useState } from "react";
import ClassroomSummaryList from "./ClassroomSummaryList";
import ClassroomModal from "./ClassroomModal";

export default function ClassroomManagement() {
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">
          Classroom Management
        </h2>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Create Classroom
        </button>
      </div>

      <ClassroomSummaryList refreshKey={refreshKey} />

      <ClassroomModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          setRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
}
