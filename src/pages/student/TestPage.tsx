import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";
import { useAuth } from "../../auth-context";
import type { Test } from "../../types";
import { TimerRing } from "../../components/TimerRing";

export interface Question {
  id: number;
  test_id: number;
  order: number;
  question_text: string;
  choices: Record<string, string>; // parsed JSON object like { A: "Option A", B: "Option B", ... }
  correct_choice: string;
  explanation: string;
}

export interface RawQuestion {
  id: number;
  test_id: number;
  order: number;
  question_text: string;
  choices: string; // raw JSON string
  correct_choice: string;
  explanation: string;
}

type Answer = {
  question_id: number;
  selected_choice: string;
};

function parseRichText(text: string) {
  const parts = text.split(/(\$[^$]+\$)/g);
  return parts.map((part, index) =>
    part.startsWith("$") && part.endsWith("$") ? (
      <InlineMath key={index} math={part.slice(1, -1)} />
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

export default function TestPage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [testName, setTestName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [markedForReview, setMarkedForReview] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showReviewScreen, setShowReviewScreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerKey = `test_timer_${testId}`;
  const [duration, setDuration] = useState<number | null>(null);

  const setTimer = (test: Test) => {
    if (test.is_timed && test.duration_minutes) {
      const stored = localStorage.getItem(timerKey);

      if (stored) {
        const storedEnd = parseInt(stored);
        const now = Date.now();
        const secondsLeft = Math.floor((storedEnd - now) / 1000);

        if (secondsLeft <= 0) {
          submitTest(); // already expired
        } else {
          setTimeLeft(secondsLeft);
        }
      } else {
        const endTime = Date.now() + test.duration_minutes * 60 * 1000;
        localStorage.setItem(timerKey, endTime.toString());
        setTimeLeft(test.duration_minutes * 60);
      }
    }
  };

  // Disallow navigation unless "test started" has been clicked.
  useEffect(() => {
    if (!testId) return;
    const started = localStorage.getItem(`test_started_${testId}`);
    if (!started) navigate(`/student/test/${testId}/begin`);
  });

  // Start countdown effect
  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          submitTest(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    axios
      .get(`/api/student/test/${testId}`, {
        headers: { "x-user-id": user?.id, "x-user-role": user?.role },
      })
      .then((res) => {
        setTestName(res.data.name);
        setTimer(res.data as Test);
        setDuration(res.data.duration_minutes || null);
        // Assume res.data has shape { name: string, questions: [...] }
        const questionsWithParsedChoices: Question[] = res.data.map(
          (q: RawQuestion) => ({
            ...q,
            choices: JSON.parse(q.choices),
          })
        );
        setQuestions(questionsWithParsedChoices);
        setLoading(false);
      });
  }, [testId, user?.id, user?.role]);

  const currentQuestion = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const isMarked = currentQuestion
    ? markedForReview.includes(currentQuestion.id)
    : false;
  const selectedAnswer = answers.find(
    (a) => a.question_id === currentQuestion?.id
  )?.selected_choice;

  // Inside the component, update handleAnswer to also advance:
  const handleAnswer = (choice: string) => {
    if (!currentQuestion) return;
    const updatedAnswers = [
      ...answers.filter((a) => a.question_id !== currentQuestion.id),
      { question_id: currentQuestion.id, selected_choice: choice },
    ];
    setAnswers(updatedAnswers);

    // Auto-advance after selection:
    // if (currentIndex + 1 < questions.length) {
    //   setCurrentIndex(currentIndex + 1);
    // } else {
    //   setShowReviewScreen(true);
    // }
  };

  const toggleMarkForReview = () => {
    if (!currentQuestion) return;
    setMarkedForReview((prev) =>
      prev.includes(currentQuestion.id)
        ? prev.filter((id) => id !== currentQuestion.id)
        : [...prev, currentQuestion.id]
    );
  };

  const goToNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const openReview = () => {
    setShowReviewScreen(true);
  };

  const submitTest = () => {
    setShowSubmitModal(false);
    localStorage.removeItem(timerKey);
    localStorage.removeItem(`test_started_${testId}`);
    axios
      .post(
        "/api/student/submit",
        {
          test_id: Number(testId),
          answers,
        },
        {
          headers: {
            "x-user-id": user?.id,
            "x-user-role": user?.role,
          },
        }
      )
      .then((res) => {
        alert(`Test complete! Score: ${res.data.score}`);
        navigate("/student");
      })
      .catch((err) => {
        alert("Failed to submit test");
        console.error(err);
      });
  };

  if (loading) return <p className="text-center mt-10">Loading test...</p>;
  if (!questions.length) return <p>No questions found.</p>;

  // === MAIN TEST VIEW ===
  if (!showReviewScreen)
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">{testName}</h1>
        {timeLeft > 0 && duration && (
          <TimerRing timeLeft={timeLeft} duration={duration} />
        )}

        <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mb-2 text-lg font-medium">
          Question {currentIndex + 1} of {questions.length}
        </div>

        <div className="mb-4 text-gray-800 text-lg leading-relaxed">
          {parseRichText(currentQuestion.question_text)}
        </div>

        <div className="grid gap-4 mb-6">
          {Object.entries(currentQuestion.choices).map(([key, value]) => {
            const isSelected = selectedAnswer === key;
            return (
              <button
                key={key}
                onClick={() => handleAnswer(key)}
                className={`relative rounded-lg p-4 text-left transition-all shadow-md
                  ${
                    isSelected
                      ? "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-lg"
                      : "bg-white hover:bg-purple-100 hover:text-purple-700"
                  }
                  focus:outline-none focus:ring-4 focus:ring-purple-300`}
              >
                <span className="font-bold mr-3 text-lg">{key}.</span>
                <span className="inline-block text-lg">
                  {parseRichText(value)}
                </span>
                {isSelected && (
                  <span className="absolute top-2 right-3 text-white font-bold text-xl select-none">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={toggleMarkForReview}
            className={`px-4 py-2 rounded font-medium ${
              isMarked
                ? "bg-yellow-200 text-yellow-800"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {isMarked ? "Marked for Review" : "Mark for Review"}
          </button>

          <div className="space-x-2">
            <button
              disabled={currentIndex === 0}
              onClick={goToPrev}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
            >
              Back
            </button>

            {currentIndex + 1 < questions.length ? (
              <button
                onClick={goToNext}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
              >
                Next
              </button>
            ) : (
              <button
                onClick={openReview}
                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded"
              >
                Finish Test
              </button>
            )}
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
              <h2 className="text-xl font-bold mb-4 text-center">
                Submit Test?
              </h2>
              <p className="text-gray-700 mb-6 text-center">
                Are you sure you want to submit your answers? You will not be
                able to change them afterward.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={submitTest}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );

  // === REVIEW SCREEN ===
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Review Your Answers
      </h1>
      <div className="mb-6">
        <p className="text-gray-700 mb-2">
          Click a question to jump to it and review or change your answer.
        </p>
        <p>
          <span className="font-semibold">Legend:</span>{" "}
          <span className="bg-green-200 text-green-800 px-2 rounded mr-2">
            Answered
          </span>
          <span className="bg-yellow-200 text-yellow-800 px-2 rounded mr-2">
            Marked for Review
          </span>
          <span className="bg-red-200 text-red-800 px-2 rounded">
            Unanswered
          </span>
        </p>
      </div>

      <ul className="space-y-3 max-h-[60vh] overflow-auto">
        {questions.map((q, i) => {
          const answer = answers.find((a) => a.question_id === q.id);
          const marked = markedForReview.includes(q.id);
          const answered = !!answer;
          return (
            <li
              key={q.id}
              onClick={() => {
                setCurrentIndex(i);
                setShowReviewScreen(false);
              }}
              className={`cursor-pointer p-3 border rounded ${
                marked
                  ? "bg-yellow-100 border-yellow-400"
                  : answered
                  ? "bg-green-100 border-green-400"
                  : "bg-red-100 border-red-400"
              } hover:opacity-80`}
            >
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold mb-4 text-center">
                  {testName}
                </h1>
                {timeLeft > 0 && (
                  <div className="text-center text-red-600 font-bold mb-4 text-lg">
                    Time Left: {Math.floor(timeLeft / 60)}:
                    {String(timeLeft % 60).padStart(2, "0")}
                  </div>
                )}
                <div>
                  <span className="font-semibold">Question {i + 1}:</span>{" "}
                  {parseRichText(q.question_text)}
                </div>
                <div>
                  {marked && (
                    <span className="text-yellow-800 font-semibold mr-2">
                      Marked
                    </span>
                  )}
                  {answered ? (
                    <span className="text-green-800 font-semibold">
                      Answered: {answer!.selected_choice}
                    </span>
                  ) : (
                    <span className="text-red-800 font-semibold">
                      Unanswered
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setShowReviewScreen(false)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Back to Test
        </button>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Submit Test
        </button>
      </div>

      {/* Submit Confirmation Modal on Review Screen */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4 text-center">Submit Test?</h2>
            <p className="text-gray-700 mb-6 text-center">
              Are you sure you want to submit your answers? You will not be able
              to change them afterward.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={submitTest}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
