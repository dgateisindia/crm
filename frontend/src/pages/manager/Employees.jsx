import axios from "axios";
import { Trash2 } from "lucide-react";
import {useState,useEffect,} from "react";
import ManagerLayout from "../../layouts/ManagerLayout";
import { useNavigate } from "react-router-dom";


export default function Employees() {

  const navigate =
    useNavigate();

  const [employees,
    setEmployees] =
    useState([]);

  useEffect(() => {

    axios.get(
      "http://localhost:5000/api/employee/employees"
    )
    .then((res) => {

      setEmployees(
        res.data
      );

    })
    .catch((err) => {

      console.log(err);

    });

  }, []);
  const handleDelete =
async (id) => {

  const confirmDelete =
  window.confirm(
    "Are you sure you want to delete this employee?"
  );

  if (
    !confirmDelete
  ) return;

  try {

    await axios.delete(
      `http://localhost:5000/api/employee/delete/${id}`
    );

    alert(
      "Employee Deleted"
    );

    setEmployees(
      employees.filter(
        (emp) =>
        emp.id !== id
      )
    );

  } catch (error) {

    console.log(error);

    alert(
      "Delete Failed"
    );
  }
};

  return (

    <ManagerLayout>

      <div className="p-6">

        {/* Header */}
        <div className="mb-6">

          <h1 className="text-3xl font-bold text-[#071739]">
            Employees
          </h1>

          <p className="text-gray-500">
            View all employees
          </p>

        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">

          <table className="w-full">

            <thead>

              <tr className="bg-gray-100 border-b">

                <th className="text-left p-4">
                  Name
                </th>

                <th className="text-left p-4">
                  Email
                </th>

                <th className="text-left p-4">
                  Role
                </th>

                <th className="text-center p-4">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {
                employees.map(
                (employee) => (

                <tr
                  key={employee.id}
                  onClick={() =>
                    navigate(
                    `/manager/employee/${employee.id}`
                    )
                  }
                  className="border-b hover:bg-gray-50 cursor-pointer transition"
                >

                  <td className="p-4 font-medium">

                    {employee.name}

                  </td>

                  <td className="p-4 text-gray-500">

                    {employee.email}

                  </td>

                  <td className="p-4">

                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">

                      {employee.role}

                    </span>

                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(employee.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td> 
                </tr>

              ))
            }

            </tbody>

          </table>

        </div>

      </div>

    </ManagerLayout>
  );
}