import { useState } from "react";
import { useAuth } from "@clerk/react";
import api from "./utils/api";

export default function ClerkApiTest() {
  const { getToken } = useAuth();
  const [result, setResult] = useState(null);

  const testApi = async () => {
    try {
      const token = await getToken();

      console.log(
        "Clerk token available:",
        !!token
      );

      const response = await api.get(
        "/tenant-test",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "API STATUS:",
        response.status
      );

      console.log(
        "API BODY:",
        response.data
      );

      setResult(response.data);
    } catch (error) {
      console.error(
        "API TEST ERROR:",
        error
      );

      setResult(
        error.response?.data ||
          error.message
      );
    }
  };

  return (
    <div
      style={{
        padding: "30px",
        fontFamily: "Arial",
      }}
    >
      <h2>Clerk API Test</h2>

      <button
        onClick={testApi}
        style={{
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        Test Tenant API
      </button>

      {result && (
        <pre
          style={{
            marginTop: "20px",
            padding: "20px",
            background: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          {JSON.stringify(
            result,
            null,
            2
          )}
        </pre>
      )}
    </div>
  );
}