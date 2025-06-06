import { useEffect, useRef, useState, type JSX } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../auth-context";
import { TimerOverlay } from "./TimerOverlay";
import { QuestionView } from "./QuestionView";
import { ReviewScreen } from "./ReviewScreen";
import { SubmitModal } from "./SubmitModal";
import type { Question, RawQuestion, TestWithQuestions } from "../../types";

type Answer = {
  question_id: number;
  selected_choice: string;
};

export default function TestPage(): JSX.Element {
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
  const [duration, setDuration] = useState<number | null>(null);
  const [showTimer, setShowTimer] = useState(true);
  const hasSubmittedRef = useRef(false);

  const timerKey = `test_timer_${testId}`;

  const setTimer = (test: TestWithQuestions) => {
    if (test.is_timed && test.duration_minutes) {
      const stored = localStorage.getItem(timerKey);
      if (stored) {
        const storedEnd = parseInt(stored);
        const now = Date.now();
        const secondsLeft = Math.floor((storedEnd - now) / 1000);
        if (secondsLeft <= 0) {
          submitTest();
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

  useEffect(() => {
    if (!testId) return;
    const started = localStorage.getItem(`test_started_${testId}`);
    if (!started) navigate(`/student/test/${testId}/begin`);
  }, [testId, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          submitTest();
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
        setTimer(res.data);
        setDuration(res.data.duration_minutes || null);
        const parsedQuestions: Question[] = res.data.questions.map(
          (q: RawQuestion) => ({
            ...q,
            choices: JSON.parse(q.choices),
          })
        );
        setQuestions(parsedQuestions);
        setLoading(false);
      });
  }, [testId, user?.id, user?.role]);

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers.find(
    (a) => a.question_id === currentQuestion?.id
  )?.selected_choice;
  const isMarked = currentQuestion
    ? markedForReview.includes(currentQuestion.id)
    : false;

  const handleAnswer = (choice: string) => {
    if (!currentQuestion) return;
    const updatedAnswers = [
      ...answers.filter((a) => a.question_id !== currentQuestion.id),
      { question_id: currentQuestion.id, selected_choice: choice },
    ];
    setAnswers(updatedAnswers);
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
    if (currentIndex + 1 < questions.length) setCurrentIndex(currentIndex + 1);
  };

  const goToPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const submitTest = () => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    localStorage.removeItem(timerKey);
    localStorage.removeItem(`test_started_${testId}`);
    axios
      .post(
        "/api/student/submit",
        { test_id: Number(testId), answers },
        { headers: { "x-user-id": user?.id, "x-user-role": user?.role } }
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

  return (
    <>
      <TimerOverlay
        timeLeft={timeLeft}
        duration={duration ?? 0}
        showTimer={showTimer}
        setShowTimer={setShowTimer}
      />

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">{testName}</h1>

        {showReviewScreen ? (
          <ReviewScreen
            testName={testName}
            questions={questions}
            answers={answers}
            markedForReview={markedForReview}
            setCurrentIndex={setCurrentIndex}
            setShowReviewScreen={setShowReviewScreen}
            setShowSubmitModal={setShowSubmitModal}
          />
        ) : currentQuestion ? (
          <QuestionView
            question={currentQuestion}
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            selectedAnswer={selectedAnswer}
            handleAnswer={handleAnswer}
            isMarked={isMarked}
            toggleMarkForReview={toggleMarkForReview}
            goToNext={goToNext}
            goToPrev={goToPrev}
            openReview={() => setShowReviewScreen(true)}
          />
        ) : null}
      </div>

      {showSubmitModal && (
        <SubmitModal
          onClose={() => setShowSubmitModal(false)}
          onSubmit={submitTest}
        />
      )}
    </>
  );
}
