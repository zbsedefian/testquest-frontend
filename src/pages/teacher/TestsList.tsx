import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../auth-context";

type Test = {
  id: number;
  name: string;
};

type Props = {
  search: string;
  page: number;
  perPage: number;
  onSelectTest: (id: number) => void;
  onSetMode: (mode: "edit" | "assign") => void;
};

export default function TestsList({
  search,
  page,
  perPage,
  onSelectTest,
  onSetMode,
}: Props) {
  const [allTests, setAllTests] = useState<Test[]>([]);
  const [displayedTests, setDisplayedTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchTests() {
      setLoading(true);
      try {
        const res = await axios.get<Test[]>("/api/tests", {
          headers: { "x-user-id": user?.id, "x-user-role": user?.role },
        });
        setAllTests(res.data);
      } catch (err) {
        console.error("Failed to load tests", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTests();
  }, []);

  useEffect(() => {
    let filtered = allTests;
    if (search) {
      filtered = filtered.filter((test) =>
        test.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    const start = (page - 1) * perPage;
    const end = start + perPage;
    setDisplayedTests(filtered.slice(start, end));
  }, [search, page, perPage, allTests]);

  if (loading) return <p className="text-gray-500">Loading tests...</p>;

  return (
    <ul className="space-y-4">
      {displayedTests.map((test) => (
        <li key={test.id} className="border p-4 rounded">
          <div className="flex justify-between items-center mb-2">
            <strong>{test.name}</strong>
            <div className="space-x-2">
              <button
                onClick={() => {
                  onSelectTest(test.id);
                  onSetMode("edit");
                }}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded"
              >
                Add Questions
              </button>
              <button
                onClick={() => {
                  onSelectTest(test.id);
                  onSetMode("assign");
                }}
                className="px-3 py-1 text-sm bg-yellow-500 text-white rounded"
              >
                Assign
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
