import { useAuth, useUser, UserButton } from "@clerk/react";
import { useState } from "react";

export default function ClerkTest() {

    console.log(
  "Frontend Clerk key:",
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
    ? import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.substring(0, 20) + "..."
    : "MISSING"
);
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();

  const [backendResult, setBackendResult] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Not signed in</div>;
  }

  const testBackend = async () => {
    try {
      setLoading(true);
      setBackendResult(null);

      const token = await getToken();
      console.log("CLERK TOKEN:", token ? "TOKEN RECEIVED" : "NO TOKEN");
      const payload = JSON.parse(
  atob(token.split(".")[1])
);

console.log("========== CLERK TOKEN CLAIMS ==========");
console.log("issuer (iss):", payload.iss);
console.log("subject (sub):", payload.sub);
console.log("authorized party (azp):", payload.azp);
console.log("session ID (sid):", payload.sid);
console.log("expiration (exp):", payload.exp);
console.log("issued at (iat):", payload.iat);
console.log("=========================================");

      const response = await fetch(
        "http://localhost:5000/api/clerk-test",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      setBackendResult(data);
    } catch (error) {
      console.error(error);

      setBackendResult({
        success: false,
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Clerk Authentication Working</h1>

      <p>
        <strong>Name:</strong>{" "}
        {user.fullName || "No name"}
      </p>

      <p>
        <strong>Email:</strong>{" "}
        {user.primaryEmailAddress?.emailAddress}
      </p>

      <UserButton />

      <hr style={{ margin: "30px 0" }} />

      <h2>Backend Authentication Test</h2>

      <button
        onClick={testBackend}
        disabled={loading}
        style={{
          padding: "10px 20px",
          cursor: "pointer",
          marginTop: "10px",
        }}
      >
        {loading
          ? "Testing..."
          : "Test Node.js Backend"}
      </button>

      {backendResult && (
        <pre
          style={{
            marginTop: "20px",
            padding: "20px",
            background: "#f4f4f4",
            borderRadius: "8px",
          }}
        >
          {JSON.stringify(
            backendResult,
            null,
            2
          )}
        </pre>
      )}
    </div>
  );
}