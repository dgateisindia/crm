import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../utils/api";
import "../styles/login.css";
import { Link } from "react-router-dom";

export default function Login() {

  const navigate =
  useNavigate();

  const [showPassword, setShowPassword] =
useState(false);


  const [email,
    setEmail] =
    useState("");


  const [password,
    setPassword] =
    useState("");
    


  // ==========================
  // Handle Login
  // ==========================
  const handleLogin =
  async (e) => {

    e.preventDefault();


    try {

      const response =
      await api.post(

        "/auth/login",
        {

          email,

          password,

        }

      );


      const {

        token,

        role,

        user,

      } = response.data;


      console.log(role);


      // ==========================
      // Save Login Data
      // ==========================
      localStorage.setItem(

        "token",

        token

      );


      localStorage.setItem(

        "role",

        role

      );


      // Save User ID
      localStorage.setItem(

        "userId",

        role === "manager"

        ? user.manager_id

        : user.employee_id

      );


      // Optional:
      // Save Full User Data
      localStorage.setItem(

        "user",

        JSON.stringify(user)

      );


      // ==========================
      // Role Based Redirect
      // ==========================
      if (role === "manager") {

        navigate(

          "/manager/dashboard",

          {

            replace: true,

          }

        );

      }

      else if (
        role === "employee"
      ) {

        navigate(

          "/employee/dashboard",

          {

            replace: true,

          }

        );

      }

    }

    catch (error) {

      console.log(error);

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

                <div style={{ position: "relative" }}>

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingRight: "50px" }}
                    required
                    minLength="5"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>
            {/* Forgot Password Link */}
            <div className="text-right">

              <Link
                to="/forgot-password"
                className="text-blue-500 text-sm"
              >
                Forgot Password?
              </Link>

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