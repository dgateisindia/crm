import { useState } from "react";
import ManagerLayout from "../../layouts/ManagerLayout";
import axios from "axios";

import "../../styles/createEmployee.css";

export default function CreateEmployee() {

  const [employee, setEmployee] = useState({

    manager_id: 1,
    role_id: 1,
    full_name: "",
    email: "",
    phone: "",
    password: "",
    department: "",
    designation: "",
    status: "active"

  });

  const handleChange = (e) => {

    setEmployee({

      ...employee,
      [e.target.name]: e.target.value,

    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const response = await axios.post(
        "http://localhost:5000/api/employee/create",
        employee
      );

      alert(response.data.message);

      setEmployee({
          manager_id: 1,
          role_id: 1,
          full_name: "",
          email: "",
          phone: "",
          password: "",
          department: "",
          designation: "",
          status: "active"
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

      <div className="createEmployeePage">

        {/* Header */}
        <div className="createEmployeeHeader">

          <h1>Create Employee Login</h1>

          <p>
            Create an account for a new employee and send login credentials.
          </p>

        </div>

        {/* Main Layout */}
        <div className="createEmployeeGrid">

          {/* LEFT */}
          <div className="employeeFormCard">

            <h2>Employee Information</h2>

            <form
              onSubmit={handleSubmit}
              className="employeeForm"
            >

              {/* Row */}
              <div className="formRow">

                <div className="formGroup">

                  <label>Full Name</label>

                  <input
                    type="text"
                    name="full_name"
                    value={employee.full_name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                  />

                </div>

                <div className="formGroup">

                  <label>Email Address</label>

                  <input
                    type="email"
                    name="email"
                    value={employee.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                  />

                </div>

              </div>

              {/* Row */}
              <div className="formRow">

                <div className="formGroup">

                  <label>Phone Number</label>

                  <input
                    type="text"
                    name="phone"
                    value={employee.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />

                </div>

                <div className="formGroup">

                  <label>Department</label>

                  <input
                    type="text"
                    name="department"
                    value={employee.department}
                    onChange={handleChange}
                    placeholder="Enter department"
                  />

                </div>

              </div>

              {/* Row */}
              <div className="formRow">

                <div className="formGroup">

                  <label>Designation</label>

                  <input
                    type="text"
                    name="designation"
                    value={employee.designation}
                    onChange={handleChange}
                    placeholder="Enter designation"
                  />

                </div>

              </div>

              {/* Credentials */}
              <div className="loginSection">

                <h2>Login Credentials</h2>

                <div className="formGroup">

                  <label>Password</label>

                  <input
                    type="password"
                    name="password"
                    value={employee.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                  />

                </div>

              </div>

              {/* Buttons */}
              <div className="buttonRow">

                <button
                  type="button"
                  className="cancelBtn"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submitBtn"
                >
                  Create & Send Login
                </button>

              </div>

            </form>

          </div>

          {/* RIGHT */}
          <div className="previewCard">

            <h2>Login Preview</h2>

            <div className="previewProfile">

              <div className="profileCircle">
                👤
              </div>

              <h3>
                {employee.full_name || "Employee Name"}
              </h3>

              <p>
                {employee.designation || "Designation"}
              </p>

              <p>
                {employee.department || "Department"}
              </p>

            </div>

          </div>

        </div>

      </div>

    </ManagerLayout>

  );

}