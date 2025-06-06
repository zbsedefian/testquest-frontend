import { useState } from "react";
import type { User } from "../../types";

type Props = {
  label: string;
  users: User[];
  selectedIds: number[];
  onToggle: (id: number) => void;
};

export default function UserMultiSelectList({ label, users, selectedIds, onToggle }: Props) {
  const [filter, setFilter] = useState("");

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <p className="font-medium mb-1">{label}</p>
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search..."
        className="border px-2 py-1 w-full mb-2 rounded"
      />
      <div className="border rounded max-h-48 overflow-y-auto p-2 space-y-1">
        {filtered.map((u) => (
          <label key={u.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedIds.includes(u.id)}
              onChange={() => onToggle(u.id)}
            />
            <span>{u.username}</span>
          </label>
        ))}
        {filtered.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-2">No results</p>
        )}
      </div>
    </div>
  );
}
