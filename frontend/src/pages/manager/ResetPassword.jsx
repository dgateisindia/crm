import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ResetPassword() {

  const { token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] =
    useState("");

  const [confirmPassword,
    setConfirmPassword] =
    useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (
      password !== confirmPassword
    ) {

      alert(
        "Passwords do not match"
      );

      return;
    }

    try {

      const response =
      await axios.post(

        "http://localhost:5000/api/auth/reset-password",

        {
          token,
          password,
        }

      );

      alert(response.data.message);

      navigate("/");

    } catch (error) {

      alert(
        error.response?.data?.message
      );

    }
  };

  return (

    <div className="login-container">

      <div className="login-right">

        <div className="login-card">

          <h2 className="text-3xl font-bold mb-4">
            Reset Password
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="form-input"
              required
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              className="form-input"
              required
            />

            <button
              type="submit"
              className="login-btn"
            >
              Update Password
            </button>

          </form>

        </div>

      </div>

    </div>

  );
}