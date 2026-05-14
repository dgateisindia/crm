import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response =
        await axios.post(
          "http://localhost:5000/api/auth/login",
          {
            email,
            password,
          }
        );

      const {
        token,
        role,
      } = response.data;

      console.log(role);

      // Save login data
      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "role",
        role
      );

      // Role-based login
      if (role === "manager") {
        navigate(
          "/manager/dashboard",
          {
            replace: true,
          }
        );
      } else if (
        role === "employee"
      ) {
        navigate(
          "/employee/dashboard",
          {
            replace: true,
          }
        );
      }

    } catch (error) {
      alert(
        error.response?.data
          ?.message ||
          "Invalid Email or Password"
      );
    }
  };

  return (
    <div className="login-container">

      {/* Left Side */}
      <div className="login-left">

        <h1 className="text-5xl font-bold mb-6">
          DGATE CRM
        </h1>

        <p className="text-lg text-gray-300 leading-8">
          Manage leads, follow-ups
          and sales with a powerful
          internal CRM.
        </p>

      </div>

      {/* Right Side */}
      <div className="login-right">

        <div className="login-card">

          <h2 className="text-3xl font-bold mb-2">
            Login
          </h2>

          <p className="text-gray-500 mb-8">
            Welcome back
          </p>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* Email */}
            <div>

              <label className="block mb-2 font-medium">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                className="form-input"
                required
              />

            </div>

            {/* Password */}
            <div>

              <label className="block mb-2 font-medium">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                className="form-input"
                required
                minLength="5"
              />

            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="login-btn"
            >
              Login
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}