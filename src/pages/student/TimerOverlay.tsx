import { useEffect, useRef, useState } from "react";
import { TimerRing } from "../../components/TimerRing";

type Props = {
  endTime: number | null;
  duration: number;
  showTimer: boolean;
  setShowTimer: (v: boolean) => void;
  onExpire: () => void;
};

export function TimerOverlay({
  endTime,
  duration,
  showTimer,
  setShowTimer,
  onExpire,
}: Props) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 80, y: 80 });
  const posRef = useRef(position);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!endTime) return;
    const updateTime = () => {
      const seconds = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(seconds);
      if (seconds <= 0) onExpire();
    };
    updateTime(); // Sync right away
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [endTime, onExpire]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const newX = e.clientX - offsetRef.current.x;
      const newY = e.clientY - offsetRef.current.y;
      setPosition({ x: newX, y: newY });
      posRef.current = { x: newX, y: newY };
    };

    const handleMouseUp = () => setDragging(false);

    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  if (!endTime) return null;

  return (
    <div
      className="z-50"
      style={{
        position: "fixed",
        top: position.y,
        left: position.x,
        cursor: dragging ? "grabbing" : "grab",
      }}
      onMouseDown={(e) => {
        offsetRef.current = {
          x: e.clientX - posRef.current.x,
          y: e.clientY - posRef.current.y,
        };
        setDragging(true);
      }}
    >
      {" "}
      {showTimer ? (
        <div className="bg-white px-4 py-2 shadow rounded flex flex-col items-center space-y-2">
          <TimerRing timeLeft={timeLeft} duration={duration} />
          <button
            onClick={() => setShowTimer(false)}
            className="text-xs text-blue-600"
          >
            Hide
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowTimer(true)}
          className="bg-white px-3 py-1 shadow rounded text-xs text-blue-600"
        >
          Show Timer
        </button>
      )}
    </div>
  );
}
