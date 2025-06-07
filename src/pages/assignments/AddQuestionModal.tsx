import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../auth-context";

type Props = {
  testId: number;
  onClose: () => void;
};

export function AddQuestionModal({ testId, onClose }: Props) {
  const { user } = useAuth();
  const [questionText, setQuestionText] = useState("");
  const [choices, setChoices] = useState({ A: "", B: "", C: "", D: "" });
  const [correctChoice, setCorrectChoice] = useState("A");
  const [explanation, setExplanation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleChangeChoice = (key: keyof typeof choices, value: string) => {
    setChoices((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      await axios.post(
        `/api/tests/${testId}/questions`,
        {
          question_text: questionText,
          choices: JSON.stringify(choices),
          correct_choice: correctChoice,
          explanation,
          order: 1,
          image_url: imageUrl,
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
      setTimeout(() => setStatus("idle"), 2000); // reset after success
    } catch {
      setStatus("error");
    }
  };

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      const formData = new FormData();
      formData.append("file", e.target.files[0]);
      const res = await axios.post("/api/upload-question-image", formData);
      setImageUrl(res.data.url); // use this when posting the full question
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
      <div className="bg-white w-full max-w-2xl p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Add a New Question</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Question</label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded"
              rows={3}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Related Image</label>
            <input type="file" onChange={handleImageUpload} />
          </div>

          {["A", "B", "C", "D"].map((letter) => (
            <div key={letter}>
              <label className="block font-semibold mb-1">
                Choice {letter}
              </label>
              <input
                value={choices[letter as keyof typeof choices]}
                onChange={(e) =>
                  handleChangeChoice(
                    letter as keyof typeof choices,
                    e.target.value
                  )
                }
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          ))}

          <div>
            <label className="block font-semibold mb-1">Correct Answer</label>
            <select
              value={correctChoice}
              onChange={(e) => setCorrectChoice(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              {["A", "B", "C", "D"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Explanation</label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              rows={2}
            />
          </div>

          {status === "success" && (
            <p className="text-green-600">✅ Question added!</p>
          )}
          {status === "error" && (
            <p className="text-red-600">❌ Failed to add question.</p>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Adding..." : "Add Question"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
