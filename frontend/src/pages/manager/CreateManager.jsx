import { useState } from "react";

import ManagerLayout
from "../../layouts/ManagerLayout";

import api from "../../utils/api";

import "../../styles/createEmployee.css";

export default function CreateManager() {

  const [manager, setManager] =
  useState({

    full_name: "",
    email: "",
    phone: "",
    password: "",
    department: "",
    designation: "Manager",
    status: "active"

  });

  const handleChange =
  (e) => {

    setManager({

      ...manager,

      [e.target.name]:
      e.target.value,

    });

  };

  const handleSubmit =
  async (e) => {

    e.preventDefault();

    try {

      const response =
      await  api.post(

        "/managers/create",

        manager

      );

      alert(
        response.data.message
      );

      // Reset Form
      setManager({

        full_name: "",
        email: "",
        phone: "",
        password: "",
        department: "",
        designation: "Manager",
        status: "active"

      });

    }

    catch (error) {

      alert(

        error.response?.data
        ?.message ||

        "Failed to create manager"

      );

    }

  };

  return (

    <ManagerLayout>

      <div className="createEmployeePage">

        {/* Header */}
        <div className="createEmployeeHeader">

          <h1>
            Create Manager Login
          </h1>

          <p>

            Create a new manager account
            with CRM access.

          </p>

        </div>

        {/* Main Layout */}
        <div className="createEmployeeGrid">

          {/* LEFT */}
          <div className="employeeFormCard">

            <h2>
              Manager Information
            </h2>

            <form
              onSubmit={
                handleSubmit
              }
              className="employeeForm"
            >

              {/* Row */}
              <div className="formRow">

                <div className="formGroup">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="full_name"
                    value={
                      manager.full_name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter full name"
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
                      manager.email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter email address"
                  />

                </div>

              </div>

              {/* Row */}
              <div className="formRow">

                <div className="formGroup">

                  <label>
                    Phone Number
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={
                      manager.phone
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
                      manager.department
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter department"
                  />

                </div>

              </div>

              {/* Row */}
              <div className="formRow">

                <div className="formGroup">

                  <label>
                    Designation
                  </label>

                  <input
                    type="text"
                    name="designation"
                    value={
                      manager.designation
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Manager"
                  />

                </div>

              </div>

              {/* Credentials */}
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
                      manager.password
                    }
                    onChange={
                      handleChange
                    }
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

                  Create Manager

                </button>

              </div>

            </form>

          </div>

          {/* RIGHT */}
          <div className="previewCard">

            <h2>
              Manager Preview
            </h2>

            <div className="previewProfile">

              <div className="profileCircle">

                👨‍💼

              </div>

              <h3>

                {

                  manager.full_name ||

                  "Manager Name"

                }

              </h3>

              <p>

                {

                  manager.designation ||

                  "Manager"

                }

              </p>

              <p>

                {

                  manager.department ||

                  "Department"

                }

              </p>

            </div>

          </div>

        </div>

      </div>

    </ManagerLayout>

  );

}