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

  return (
    <div className="flex flex-col items-center mb-4">
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#ef4444"
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
      <div className="text-sm text-center text-red-600 font-semibold mt-2">
        {formatTime(timeLeft)} left
      </div>
    </div>
  );
};
