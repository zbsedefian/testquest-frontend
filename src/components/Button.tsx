type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
};

export function Button({ label, className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition ${className}`}
    >
      {label}
    </button>
  );
}
