import { Link } from "react-router-dom";

export default function Error500() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-red-700">500</h1>

        <h2 className="text-3xl font-semibold mt-4">
          Internal Server Error
        </h2>

        <p className="text-gray-600 mt-2">
          Something went wrong on our server.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}