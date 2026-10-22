import { useState, useEffect } from "react";
import api from "../../utils/api";
import { useParams, useNavigate } from "react-router-dom";
import ManagerLayout from "../../layouts/ManagerLayout";
import "../../styles/createEmployee.css";

export default function CreateEmployee() {
  const initialState = {
    full_name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
  };

  const [employee, setEmployee] = useState(initialState);

  const { id } = useParams();
  const navigate = useNavigate();

  // ==========================
  // Fetch Employee for Edit
  // ==========================
  useEffect(() => {
    if (id) {
      api
        .get(`/employee/${id}`)
        .then((res) => {
          console.log("Employee Data:", res.data);

          setEmployee({
            full_name: res.data.full_name || "",
            email: res.data.email || "",
            phone: res.data.phone || "",
            department: res.data.department || "",
            designation: res.data.designation || "",
            employee_code: res.data.employee_code || "",
          });
        })
        .catch((err) => {
          console.log(err);
          alert("Failed to fetch employee details");
        });
    }
  }, [id]);

  // ==========================
  // Handle Input Change
  // ==========================
  const handleChange = (e) => {
    setEmployee({
      ...employee,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================
  // Submit
  // ==========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{10}$/.test(employee.phone)) {
      alert("Phone number must contain exactly 10 digits");
      return;
    }

    const employeeData = {
      full_name: employee.full_name.trim(),
      email: employee.email.trim().toLowerCase(),
      phone: employee.phone,
      department: employee.department?.trim() || "",
      designation: employee.designation?.trim() || "",
    };

    try {
      if (id) {
        await api.put(
          `/employee/update/${id}`,
          employeeData
        );

        alert("Employee Updated Successfully");
      } else {
        const response = await api.post(
          "/employee/create",
          employeeData
        );

        alert(
          `${response.data.message}\nEmployee ID: ${response.data.employee_code}`
        );
      }

      navigate("/manager/employees");
      setEmployee(initialState);
    } catch (error) {
      console.error("Employee submit error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to save employee"
      );
    }
  };

  return (
    <ManagerLayout>
      <div className="createEmployeePage">

        {/* Header */}
        <div className="createEmployeeHeader">
          <h1>
            {id
              ? "Edit Employee"
              : "Create Employee"}
          </h1>

          <p>
            {id
              ? "Update employee information."
              : "Add an employee and send them a secure invitation to join your CRM."}
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
              autoComplete="off"
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
                    autoComplete="off"
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
                    onChange={(e) => {
                      const value =
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);

                      setEmployee({
                        ...employee,
                        phone: value,
                      });
                    }}
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                    required
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

              {/* Buttons */}
              <div className="buttonRow">

                <button
                  type="button"
                  className="cancelBtn"
                  onClick={() =>
                    navigate(
                      "/manager/employees"
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submitBtn"
                >
                  {id
                    ? "Update Employee"
                    : "Create Employee"}
                </button>

              </div>

            </form>
          </div>

          {/* RIGHT SIDE */}
          <div className="previewCard">

            <h2>
              Employee Preview
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

              <p>
                {
                  employee.email ||
                  "employee@example.com"
                }
              </p>

            </div>

          </div>

        </div>
      </div>
    </ManagerLayout>
  );
}