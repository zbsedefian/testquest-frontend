import type { JSX } from "react";
import { InlineMath } from "react-katex";
import type { Question } from "../../types";

interface QuestionViewProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: string | undefined;
  handleAnswer: (choice: string) => void;
  isMarked: boolean;
  toggleMarkForReview: () => void;
  goToNext: () => void;
  goToPrev: () => void;
  openReview: () => void;
}

export function QuestionView({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  handleAnswer,
  isMarked,
  toggleMarkForReview,
  goToNext,
  goToPrev,
  openReview,
}: QuestionViewProps): JSX.Element {
  function parseRichText(text: string): JSX.Element[] {
    const parts = text.split(/(\$.*?\$)/g);
    return parts.map((part, index) => {
      if (part.startsWith("$") && part.endsWith("$")) {
        return <InlineMath key={`math-${index}`} math={part.slice(1, -1)} />;
      } else {
        return (
          <span key={`text-${index}`} suppressHydrationWarning>
            {part}
          </span>
        );
      }
    });
  }

  function renderImage(currentQuestion: Question) {
    const fileName = currentQuestion.image_url?.split("/").pop() || "";
    const imageUrl = `http://localhost:8000/uploaded_images/${encodeURIComponent(
      fileName
    )}`;

    return (
      currentQuestion.image_url && (
        <img
          src={imageUrl}
          alt="Question Illustration"
          className="mb-4 max-w-full"
        />
      )
    );
  }

  return (
    <div>
      <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
        <div
          className="bg-blue-500 h-3 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      <div className="mb-2 text-lg font-medium">
        Question {currentIndex + 1} of {totalQuestions}
      </div>

      {renderImage(question)}

      <div className="mb-4 text-gray-800 text-lg leading-relaxed">
        {parseRichText(question.question_text)}
      </div>

      <div className="grid gap-4 mb-6">
        {Object.entries(question.choices).map(([key, value]) => {
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

          {currentIndex + 1 < totalQuestions ? (
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
    </div>
  );
}
