import { useState,useEffect } from "react";
import axios from "axios";
import { useParams,useNavigate } from "react-router-dom";
import ManagerLayout from "../../layouts/ManagerLayout";
import "../../styles/createEmployee.css";

export default function CreateEmployee() {
  const initialState = {
    manager_id: 1,
    role_id: 1,
    full_name: "",
    email: "",
    phone: "",
    password: "",
    department: "",
    designation: "",
    status: "active",
  };

  const [employee, setEmployee] =
    useState(initialState);


    const { id } = useParams();

    const navigate = useNavigate();
    useEffect(() => {

  if (id) {

    axios.get(

      `http://localhost:5000/api/employee/${id}`

    )

    .then((res) => {

      console.log(
        "Employee Data:",
        res.data
      );

      setEmployee({

        ...res.data,

        password: ""

      });

    })

    .catch((err) => {

      console.log(err);

      alert(
        "Failed to fetch employee details"
      );

    });

  }

}, [id]);

  // ==========================
  // Handle Input Change
  // ==========================
  const handleChange = (e) => {
    setEmployee({
      ...employee,
      [e.target.name]:
        e.target.value,
    });
  };

  // ==========================
  // Submit
  // ==========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (id) {

  await axios.put(

    `http://localhost:5000/api/employee/update/${id}`,

    employee

  );

  alert(
    "Employee Updated Successfully"
  );

}

else {

  const response =
    await axios.post(

      "http://localhost:5000/api/employee/create",

      employee

    );

  alert(

    `${response.data.message}

Employee ID:
${response.data.employee_code}`

  );

}
navigate("/manager/employees");

      setEmployee(initialState);

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
         <h1>

          {

            id

            ? "Edit Employee"

            : "Create Employee Login"

          }

        </h1>

          <p>
            Create an account for a new employee and
            send login credentials.
          </p>
        </div>

        {/* Main Layout */}
        <div className="createEmployeeGrid">

          {/* LEFT SIDE */}
          <div className="employeeFormCard">

            <h2>
              Employee Information
            </h2>

            <form
              onSubmit={handleSubmit}
              className="employeeForm"
            >

              {/* Row 1 */}
              <div className="formRow">

                <div className="formGroup">
                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="full_name"
                    value={
                      employee.full_name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="formGroup">
                  <label>
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      employee.email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter email address"
                    required
                  />
                </div>

              </div>

              {/* Row 2 */}
              <div className="formRow">

                <div className="formGroup">
                  <label>
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={
                      employee.phone
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="formGroup">
                  <label>
                    Department
                  </label>

                  <input
                    type="text"
                    name="department"
                    value={
                      employee.department
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter department"
                  />
                </div>

              </div>

              {/* Row 3 */}
              <div className="formRow">

                <div className="formGroup">
                  <label>
                    Designation
                  </label>

                  <input
                    type="text"
                    name="designation"
                    value={
                      employee.designation
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter designation"
                  />
                </div>

                <div className="formGroup">
                  <label>
                    Employee ID
                  </label>

                  <input
                    type="text"
                    value={

                      id

                      ? employee.employee_code || ""

                      : "Auto Generated"

                    }
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>

              </div>

              {/* Login Credentials */}
              <div className="loginSection">

                <h2>
                  Login Credentials
                </h2>

                <div className="formGroup">
                  <label>
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={
                      employee.password
                    }
                    onChange={
                      handleChange
                    }
                    placeholder={

                      id

                      ? "Leave blank to keep current password"

                      : "Enter password"

                    }
                    required={!id}
                  />
                </div>

              </div>

              {/* Buttons */}
              <div className="buttonRow">

                <button
                  type="button"
                  className="cancelBtn"
                  onClick={() =>

                    navigate("/manager/employees")

                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submitBtn"
                >
                 {

                    id

                    ? "Update Employee"

                    : "Create Employee"

                  }
                </button>

              </div>

            </form>

          </div>

          {/* RIGHT SIDE */}
          <div className="previewCard">

            <h2>
              Login Preview
            </h2>

            <div className="previewProfile">

              <div className="profileCircle">
                👤
              </div>

              <h3>
                {
                  employee.full_name ||
                  "Employee Name"
                }
              </h3>

              <p>
                {
                  employee.designation ||
                  "Designation"
                }
              </p>

              <p>
                {
                  employee.department ||
                  "Department"
                }
              </p>

              <p>

                Employee ID:

                {

                  id

                  ? employee.employee_code || ""

                  : "Auto Generated"

                }

              </p>

            </div>

          </div>

        </div>

      </div>
    </ManagerLayout>
  );
}