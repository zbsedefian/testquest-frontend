const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

export const TimerRing = ({
  timeLeft,
  duration,
}: {
  timeLeft: number;
  duration: number;
}) => {
  const radius = 36;
  const stroke = 4;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = timeLeft / (duration * 60);
  const strokeDashoffset = circumference * (1 - progress);

  const isDanger = timeLeft <= 60;

  return (
    <div className="flex flex-col items-center mb-4">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={isDanger ? "#ef4444" : "#3b82f6"} // red or blue
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference + " " + circumference}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div
        className={`text-sm text-center font-semibold mt-2 ${
          isDanger ? "text-red-600" : "text-blue-600"
        }`}
      >
        {formatTime(timeLeft)} left
      </div>
    </div>
  );
};
