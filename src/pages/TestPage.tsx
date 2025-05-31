import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

type Question = {
  id: number;
  question_text: string;
  choices: Record<string, string>;
};

type Answer = {
  question_id: number;
  selected_choice: string;
};

export default function TestPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/api/student/test/${testId}`, {
        headers: { "x-user-id": "3", "x-user-role": "student" }, // replace with dynamic headers
      })
      .then((res) => {
        setQuestions(res.data);
        setLoading(false);
      });
  }, [testId]);

  const handleAnswer = (choice: string) => {
    const q = questions[currentIndex];
    const updatedAnswers = [
      ...answers,
      { question_id: q.id, selected_choice: choice },
    ];
    setAnswers(updatedAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All questions answered
      axios
        .post(
          "/api/student/submit",
          {
            test_id: Number(testId),
            answers: updatedAnswers,
          },
          {
            headers: { "x-user-id": "3", "x-user-role": "student" },
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
    }
  };

  if (loading) return <p>Loading test...</p>;
if (!questions.length) return <p>No questions found.</p>;

// Defensive: check if currentIndex is valid and choices exist
const q = questions[currentIndex];

if (!q) return <p>Question not found.</p>;
if (!q.choices) return <p>Question choices missing.</p>;

return (
  <div className="p-4 max-w-xl mx-auto">
    <h2 className="text-xl font-bold mb-2">
      Question {currentIndex + 1} of {questions.length}
    </h2>
    <p className="mb-4">{q.question_text}</p>
    <div className="grid gap-2">
      {Object.entries(typeof q.choices === "string" ? JSON.parse(q.choices) : q.choices).map(([key, value]) => (
        <button
          key={key}
          className="border p-2 rounded hover:bg-gray-200"
          onClick={() => handleAnswer(key)}
        >
          {key}: {value}
        </button>
      ))}
    </div>
  </div>
);

}
