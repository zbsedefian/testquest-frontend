import { TimerRing } from "../../components/TimerRing";
import { type JSX } from "react";

interface TimerOverlayProps {
  timeLeft: number;
  duration: number;
  showTimer: boolean;
  setShowTimer: (v: boolean) => void;
}

export function TimerOverlay({
  timeLeft,
  duration,
  showTimer,
  setShowTimer,
}: TimerOverlayProps): JSX.Element | null {
  if (!duration || timeLeft <= 0) return null;

  return showTimer ? (
    <div className="fixed top-20 right-20 z-50 flex items-center gap-2 bg-white p-2 rounded shadow-lg">
      <TimerRing timeLeft={timeLeft} duration={duration} />
      <button
        onClick={() => setShowTimer(false)}
        className="text-sm text-gray-500 hover:text-gray-800"
      >
        Hide
      </button>
    </div>
  ) : (
    <button
      onClick={() => setShowTimer(true)}
      className="fixed top-20 right-20 z-50 bg-gray-600 text-white px-3 py-1 rounded shadow"
    >
      Show Timer
    </button>
  );
}
