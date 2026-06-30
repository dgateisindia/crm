import { Link } from "react-router-dom";

export default function Error403() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-orange-500">403</h1>

        <h2 className="text-3xl font-semibold mt-4">
          Access Forbidden
        </h2>

        <p className="text-gray-600 mt-2">
          You don't have permission to access this page.
        </p>

        <Link
          to="/dashboard"
          className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </Link>
      </div>
    </div>
  );
}