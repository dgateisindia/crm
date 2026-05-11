import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = () => {

    if (
      email === "admin@gmail.com" &&
      password === "admin123"
    ) {

      navigate("/dashboard");

    }

    else {

      alert("Invalid Credentials");

    }

  };

  return (

    <div className="min-h-screen flex">

      {/* LEFT SIDE */}

      <div className="w-1/2 bg-[#051432] text-white flex flex-col justify-center px-16">

        <h1 className="text-5xl font-bold mb-6">
          DGATE CRM
        </h1>

        <p className="text-lg leading-8 mb-8 text-gray-200">
          Manage leads, employees, follow-ups, reports,
          and customer relationships efficiently with our
          modern CRM platform.
        </p>

        <div className="space-y-4">

          <div className="flex items-center gap-3">
            <span className="text-2xl">•</span>
            <p>Lead Management System</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl">•</span>
            <p>Employee Dashboard</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl">•</span>
            <p>Analytics & Reports</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl">•</span>
            <p>Customer Follow-up Tracking</p>
          </div>

        </div>

      </div>


      {/* RIGHT SIDE */}

      <div className="w-1/2 bg-gray-100 flex items-center justify-center">

        {/* LOGIN CARD */}

        <div className="bg-white p-10 rounded-2xl shadow-xl w-[400px]">

          <h2 className="text-3xl font-bold text-center mb-2">
            Welcome Back
          </h2>

          <p className="text-center text-gray-500 mb-8">
            Login to continue
          </p>


          {/* EMAIL */}

          <div className="mb-5">

            <label className="block mb-2 font-medium">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-600"
            />

          </div>


          {/* PASSWORD */}

          <div className="mb-6">

            <label className="block mb-2 font-medium">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-600"
            />

          </div>


          {/* FORGOT PASSWORD */}

          <div className="text-right mb-4">

            <p className="text-sm text-blue-600 cursor-pointer hover:underline">
              Forgot Password?
            </p>

          </div>


          {/* LOGIN BUTTON */}

          <button
            onClick={handleLogin}
            className="w-full bg-[#051432] text-white p-3 rounded-lg hover:bg-blue-800 transition duration-300"
          >

            Login

          </button>


          {/* FOOTER */}

          <p className="text-center text-sm text-gray-500 mt-6">

            © 2026 DGATE CRM System

          </p>

        </div>

      </div>

    </div>

  )
}

export default Login;