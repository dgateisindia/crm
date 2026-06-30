export default function Error503() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-purple-600">503</h1>

        <h2 className="text-3xl font-semibold mt-4">
          Service Unavailable
        </h2>

        <p className="text-gray-600 mt-2">
          The server is temporarily unavailable.
        </p>

        <p className="text-gray-500 mt-2">
          Please try again later.
        </p>
      </div>
    </div>
  );
}