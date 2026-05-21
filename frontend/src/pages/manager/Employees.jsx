import axios from "axios";
import { Trash2 } from "lucide-react";
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
                  <th>Role</th>
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

                        <td>

                          <span className="statusBadge">

                            {
                              employee.status
                            }

                          </span>

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