import { useState } from "react";
import ManagerLayout from "../../layouts/ManagerLayout";
import axios from "axios";

export default function CreateEmployee() {
  const [employee, setEmployee] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const handleChange = (e) => {
    setEmployee({
      ...employee,
      [e.target.name]: e.target.value,
    });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  const { name, email, password, role } =
    employee;

  // Validation
  if (
    !name ||
    !email ||
    !password ||
    !role
  ) {
    return alert(
      "Please fill all fields"
    );
  }

  // Email validation
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return alert(
      "Enter valid email address"
    );
  }

  // Password length
  if (password.length < 6) {
    return alert(
      "Password must be at least 6 characters"
    );
  }

  try {
    const response =
      await axios.post(
        "http://localhost:5000/api/employee/create-employee",
        employee
      );

    alert(response.data.message);

    setEmployee({
      name: "",
      email: "",
      password: "",
      role: "",
    });

  } catch (error) {
    alert(
      error.response?.data?.message ||
      "Failed to create employee"
    );
  }
};

  return (
    <ManagerLayout>

      <div className="bg-white p-8 rounded-2xl shadow max-w-2xl">

        <h1 className="text-3xl font-bold mb-6">
          Create Employee Login
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div>
            <label className="block mb-2 font-medium">
              Employee Name
            </label>

            <input
              type="text"
              name="name"
              value={employee.name}
              onChange={handleChange}
              placeholder="Enter Name"
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={employee.email}
              onChange={handleChange}
              placeholder="Enter Email"
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={employee.password}
              onChange={handleChange}
              placeholder="Enter Password"
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Role
            </label>

            <select
              name="role"
              value={employee.role}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
            >
              <option value="">
                Select Role
              </option>

              <option value="employee">
                Employee
              </option>

              <option value="sales">
                Sales Executive
              </option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Create Employee
          </button>

        </form>

      </div>

    </ManagerLayout>
  );
}