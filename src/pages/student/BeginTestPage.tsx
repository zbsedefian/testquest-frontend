import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../auth-context";
import type { Test } from "../../types";

export default function BeginTestPage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [test, setTest] = useState<Test | null>(null);
  const [attemptCount, setAttemptCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testRes, attemptRes] = await Promise.all([
          axios.get(`/api/student/test/${testId}/meta`, {
            headers: { "x-user-id": user?.id, "x-user-role": user?.role },
          }),
          axios.get(`/api/student/tests/attempts/${testId}`, {
            headers: { "x-user-id": user?.id, "x-user-role": user?.role },
          }),
        ]);
        setTest(testRes.data);
        setAttemptCount(attemptRes.data.attempt_count);
      } catch (err) {
        console.error("Error fetching test or attempt count", err);
      } finally {
        setLoading(false);
      }
    };

    if (user && testId) {
      fetchData();
    }
  }, [testId, user, user?.id, user?.role]);

  if (loading) return <p className="text-center mt-10">Loading test info...</p>;
  if (!test) return <p className="text-center mt-10">Test not found.</p>;

  const attemptsExceeded =
    test.max_attempts !== null &&
    attemptCount !== null &&
    attemptCount >= test.max_attempts;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">{test.name}</h1>
      <p className="text-gray-700 mb-4 whitespace-pre-wrap">
        {test.description}
      </p>

      <ul className="mb-6 space-y-2 text-gray-800">
        {test.is_timed && (
          <li>
            <strong>Duration:</strong> {test.duration_minutes} minutes
          </li>
        )}
        {test.max_attempts !== null && (
          <li>
            <strong>Max Attempts:</strong> {test.max_attempts}
          </li>
        )}
        {test.pass_score !== null && (
          <li>
            <strong>Passing Score:</strong> {test.pass_score}%
          </li>
        )}
        {/* <li>
          <strong>Grading:</strong>{" "}
          {test.graded_by === "manual" ? "Manual" : "Auto"}
        </li>
        <li>
          <strong>Back Navigation:</strong>{" "}
          {test.allow_back_navigation ? "Allowed" : "Not Allowed"}
        </li>
        <li>
          <strong>Results:</strong>{" "}
          {test.show_results_immediately
            ? "Shown immediately"
            : "Delayed or Manual"}
        </li> */}
      </ul>

      <div className="text-center">
        {attemptsExceeded ? (
          <p className="text-red-600 font-semibold">
            You have reached the maximum number of attempts for this test.
          </p>
        ) : (
          <button
            onClick={() => {
              navigate(`/student/test/${testId}`);
              localStorage.setItem(`test_started_${testId}`, "true");
            }}
            className="px-6 py-3 bg-blue-600 text-white text-lg rounded hover:bg-blue-700"
          >
            Begin Test
          </button>
        )}
      </div>

      <div className="mt-4 text-center">
        <Link to="/student" className="text-blue-500 hover:underline">
          Cancel and Go Back
        </Link>
      </div>
    </div>
  );
}
