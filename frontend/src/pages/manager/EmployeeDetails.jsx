import {useParams} from "react-router-dom";
import axios from "axios";
import {useState,useEffect} from "react";
import ManagerLayout from "../../layouts/ManagerLayout";
export default function EmployeeDetails() {

  const { id } =
    useParams();

  const [employee,
    setEmployee] =
    useState(null);

  useEffect(() => {

    axios.get(
      `http://localhost:5000/api/employee/${id}`
    )
    .then((res) => {

      setEmployee(
        res.data
      );

    });

  }, [id]);

  if (!employee) {
    return (
      <p className="p-5">
        Loading...
      </p>
    );
  }

  return (

    <ManagerLayout>

      <div className="p-6">

        <div className="bg-white rounded-2xl shadow-md p-6">

          <div className="flex items-center gap-5 mb-5">

            <div className="w-20 h-20 rounded-full bg-[#071739] text-white flex items-center justify-center text-3xl font-bold">

              {
                employee.name?.charAt(0)
              }

            </div>

            <div>

              <h1 className="text-3xl font-bold text-[#071739]">

                {employee.name}

              </h1>

              <p className="text-gray-500">

                {employee.email}

              </p>

            </div>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>

              <h3 className="font-semibold">
                Role
              </h3>

              <p>
                {employee.role}
              </p>

            </div>

            <div>

              <h3 className="font-semibold">
                Employee ID
              </h3>

              <p>
                #{employee.id}
              </p>

            </div>

          </div>

        </div>

      </div>

    </ManagerLayout>
  );
}