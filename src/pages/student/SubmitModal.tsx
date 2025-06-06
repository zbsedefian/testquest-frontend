import { type JSX } from "react";

interface SubmitModalProps {
  onClose: () => void;
  onSubmit: () => void;
}

export function SubmitModal({
  onClose,
  onSubmit,
}: SubmitModalProps): JSX.Element {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4 text-center">Submit Test?</h2>
        <p className="text-gray-700 mb-6 text-center">
          Are you sure you want to submit your answers? You will not be able to
          change them afterward.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
