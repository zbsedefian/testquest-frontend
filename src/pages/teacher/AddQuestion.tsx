import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../auth";
import { useParams } from "react-router-dom";

export function AddQuestion() {
  const { user } = useAuth();
  const { testId } = useParams();
  const [questionText, setQuestionText] = useState("");
  const [choices, setChoices] = useState({ A: "", B: "", C: "", D: "" });
  const [correctChoice, setCorrectChoice] = useState("A");
  const [explanation, setExplanation] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChangeChoice = (key: keyof typeof choices, value: string) => {
    setChoices((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      await axios.post(
        `/api/teacher/tests/${testId}/questions`,
        {
          question_text: questionText,
          choices: JSON.stringify(choices),
          correct_choice: correctChoice,
          explanation,
          order: 1,
        },
        {
          headers: {
            "x-user-id": user?.id,
            "x-user-role": user?.role,
          },
        }
      );
      setQuestionText("");
      setChoices({ A: "", B: "", C: "", D: "" });
      setCorrectChoice("A");
      setExplanation("");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label>
        Question:
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          required
          className="w-full border px-2 py-1"
        />
      </label>

      {["A", "B", "C", "D"].map((letter) => (
        <label key={letter}>
          Choice {letter}:
          <input
            value={choices[letter as keyof typeof choices]}
            onChange={(e) =>
              handleChangeChoice(letter as keyof typeof choices, e.target.value)
            }
            className="w-full border px-2 py-1"
          />
        </label>
      ))}

      <label>
        Correct Answer:
        <select
          value={correctChoice}
          onChange={(e) => setCorrectChoice(e.target.value)}
          className="border px-2 py-1"
        >
          {["A", "B", "C", "D"].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label>
        Explanation:
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          className="w-full border px-2 py-1"
        />
      </label>

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Adding..." : "Add Question"}
      </button>

      {status === "success" && <p>✅ Question added!</p>}
      {status === "error" && <p>❌ Failed to add question.</p>}
    </form>
  );
}
