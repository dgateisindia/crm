import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ForgotPassword() {

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const response = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );

      setMessage(response.data.message);
      setResetLink(response.data.resetLink);

    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        "Something went wrong"
      );

    }
  };

  return (

    <div className="login-container">

      <div className="login-right">

        <div className="login-card">

          <h2 className="text-3xl font-bold mb-2">
            Forgot Password
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="form-input"
              required
            />

            <button
              type="submit"
              className="login-btn"
            >
              Send Reset Link
            </button>

          </form>

          {message && (
            <p className="mt-4">
              {message}
            </p>
          )}

          {resetLink && (
            <a
              href={resetLink}
              className="text-blue-500 break-all"
            >
              {resetLink}
            </a>
          )}

          <Link
            to="/"
            className="text-blue-500 block mt-4"
          >
            Back To Login
          </Link>

        </div>

      </div>

    </div>

  );
}