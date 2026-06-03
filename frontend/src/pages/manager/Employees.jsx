import axios from "axios";
import {

Trash2,

Users,

UserCheck,

UserX,

CalendarDays

}
from "lucide-react";
import {
  useState,
  useEffect
} from "react";

import ManagerLayout
from "../../layouts/ManagerLayout";

import "../../styles/employees.css";

export default function Employees() {

  const [
    employees,
    setEmployees
  ] = useState([]);

  // ==========================
  // Fetch Employees
  // ==========================
  useEffect(() => {

  const fetchEmployees =
  async () => {

    try {

      console.log(
        "Fetching employees..."
      );

      const response =
      await axios.get(
        "http://localhost:5000/api/employee/all"
      );

      console.log(
        "API Response:",
        response.data
      );

      setEmployees(
        response.data
      );

    }

    catch (error) {

      console.log(
        "Fetch Error:",
        error
      );

    }

  };

  fetchEmployees();

}, []);
  // ==========================
  // Delete Employee
  // ==========================
  const handleDelete =
  async (employee_id) => {

    const confirmDelete =
    window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmDelete)

      
    return;

    try {

      await axios.delete(
        `http://localhost:5000/api/employee/delete/${employee_id}`
      );

      alert(
        "Employee Deleted Successfully"
      );

      setEmployees(

        employees.filter(

          (emp) =>

          emp.employee_id !==
          employee_id

        )

      );

    }

    catch (error) {

      console.log(error);

      alert(
        "Delete Failed"
      );

    }

  };
  const updateEmployeeStatus = async (
  employeeId,
  status
) => {

  try {

    await axios.put(
      `http://localhost:5000/api/employee/status/${employeeId}`,
      { status }
    );

    setEmployees(
      employees.map((emp) =>
        emp.employee_id === employeeId
          ? {
              ...emp,
              status
            }
          : emp
      )
    );

  } catch (error) {

    console.log(error);

    alert(
      "Failed to update status"
    );

  }

};

  return (

    <ManagerLayout>

      <div className="employeesPage">

        <div className="employeesHeader">

          <div>

            <h1>
              Employees
            </h1>

            <p>
              View all employees
            </p>

          </div>

        </div>
        {/* Top Cards */}
        <div className="dashboard-grid">

          {/* Total Employees */}
          <div className="crm-card blue-card">

            <div className="crm-card-top">

              <div className="icon-circle blue-bg">

                <Users
                  size={20}
                />

              </div>

            </div>

            <h3>

              Total Employees

            </h3>

            <h2>

              {
                employees.length
              }

            </h2>

          </div>


          {/* Active Employees */}
          <div className="crm-card green-card">

            <div className="crm-card-top">

              <div className="icon-circle green-bg">

                <UserCheck
                  size={20}
                />

              </div>

            </div>

            <h3>

              Active Employees

            </h3>

            <h2>

              {

        employees.filter(
        emp =>
        emp.status ===
        "active"
        ).length

              }

            </h2>

          </div>


         {/* Inactive Employees */}
          <div className="crm-card orange-card">

            <div className="crm-card-top">

              <div className="icon-circle orange-bg">

                <UserX size={20} />

              </div>

            </div>

            <h3>
              Inactive Employees
            </h3>

            <h2>
              {
                employees.filter(
                  emp =>
                    emp.status?.toLowerCase() ===
                    "inactive"
                ).length
              }
            </h2>

          </div>

          {/* On Leave Employees */}
          <div className="crm-card purple-card">

            <div className="crm-card-top">

              <div className="icon-circle purple-bg">

                <CalendarDays size={20} />

              </div>

            </div>

            <h3>
              On Leave
            </h3>

            <h2>
              {
                employees.filter(
                  emp =>
                    emp.status?.toLowerCase() ===
                    "leave"
                ).length
              }
            </h2>

          </div>
        </div>

        <div className="employeesTableCard">

          <div className="employeesTableWrapper">

            <table className="employeesTable">

              <thead>

                <tr>

                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Status</th>
                  <th>Action</th>

                </tr>

              </thead>

              <tbody>

                {

                  employees.length > 0 ? (

                    employees.map(
                      (employee) => (

                      <tr
                        key={
                          employee.employee_id
                        }
                      >

                        <td>
                          {
                            employee.employee_code
                          }
                        </td>

                        <td className="employeeName">

                          {
                            employee.full_name
                          }

                        </td>

                        <td>

                          {
                            employee.email
                          }

                        </td>

                        <td>

                          {
                            employee.phone
                          }

                        </td>

                        <td>

                          {
                            employee.department
                          }

                        </td>

                        <td>

                          {
                            employee.designation
                          }

                        </td>
{/*
                       <td>

                          <span
                            className={

                        `px-3 py-1

                        rounded-full

                        text-xs font-semibold

                        ${
                        employee.role ===
                        "manager"

                        ? "bg-purple-100 text-purple-700"

                        : "bg-emerald-100 text-emerald-700"

                        }`

                            }

                          >

                            {

                        employee.role ||

                        "Employee"

                            }

                          </span>

                        </td>
*/}
                        <td>

                        <select
                          value={
                            employee.status ||
                            "active"
                          }
                          className="statusSelect"
                          onChange={(e) =>
                            updateEmployeeStatus(
                              employee.employee_id,
                              e.target.value
                            )
                          }
                        >

                          <option value="active">
                            Active
                          </option>

                          <option value="inactive">
                            Inactive
                          </option>

                          <option value="leave">
                            Leave
                          </option>

                        </select>

                      </td>

                        <td className="actionCell">

                          <button
                            onClick={() =>
                              handleDelete(
                                employee.employee_id
                              )
                            }
                            className="deleteBtn"
                          >

                            <Trash2
                              size={18}
                            />

                          </button>

                        </td>

                      </tr>

                    ))

                  ) : (

                    <tr>

                      <td
                        colSpan="9"
                        className="noData"
                      >

                        No Employees Found

                      </td>

                    </tr>

                  )

                }

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </ManagerLayout>

  );

}