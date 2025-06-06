import type { JSX } from "react";

interface Question {
  id: number;
  question_text: string;
}

interface Answer {
  question_id: number;
  selected_choice: string;
}

interface ReviewScreenProps {
  testName: string;
  questions: Question[];
  answers: Answer[];
  markedForReview: number[];
  setCurrentIndex: (index: number) => void;
  setShowReviewScreen: (show: boolean) => void;
  setShowSubmitModal: (show: boolean) => void;
}

export function ReviewScreen({
  testName,
  questions,
  answers,
  markedForReview,
  setCurrentIndex,
  setShowReviewScreen,
  setShowSubmitModal,
}: ReviewScreenProps): JSX.Element {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Review Your Answers
      </h1>
      <h3>{testName}</h3>
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
                <div>
                  <span className="font-semibold">Question {i + 1}:</span>{" "}
                  {q.question_text}
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
    </div>
  );
}
