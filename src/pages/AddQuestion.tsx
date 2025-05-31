import { useState } from "react";
import axios from "axios";
import { useAuth } from "../auth";
import { useParams } from "react-router-dom";

export function AddQuestion() {
  const { user } = useAuth();
  const { testId } = useParams<{ testId: string }>();
  const userId = user?.id;
  const [questionText, setQuestionText] = useState("");
  const [choices, setChoices] = useState(
    '{ "A": "", "B": "", "C": "", "D": "" }'
  );
  const [correctChoice, setCorrectChoice] = useState("A");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await axios.post(
        `/api/teacher/tests/${testId}/questions`,
        {
          question_text: questionText,
          choices,
          correct_choice: correctChoice,
          explanation,
          order: 1, // You can make this dynamic if you want
        },
        {
          headers: {
            "x-user-id": userId?.toString(),
            "x-user-role": user?.role,
          },
        }
      );
      setSuccess(true);
      setQuestionText("");
      setChoices('{ "A": "", "B": "", "C": "", "D": "" }');
      setCorrectChoice("A");
      setExplanation("");
    } catch (err) {
      setError("Failed to add question.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleAddQuestion}>
      <label>
        Question Text:
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          required
        />
      </label>
      <label>
        Choices (JSON):
        <textarea
          value={choices}
          onChange={(e) => setChoices(e.target.value)}
          required
          rows={4}
        />
      </label>
      <label>
        Correct Choice:
        <select
          value={correctChoice}
          onChange={(e) => setCorrectChoice(e.target.value)}
          required
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
      </label>
      <label>
        Explanation:
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={3}
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Question"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>Question added!</p>}
    </form>
  );
}
