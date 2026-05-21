import axios from "axios";

import {
  useState,
  useEffect,
} from "react";

import EmployeeLayout
from "../../layouts/EmployeeLayout";

export default function EmployeeDashboard() {

  const [stats,
    setStats] =
    useState({

      totalLeads: 0,
      contacted: 0,
      qualified: 0,
      converted: 0,
      recentLeads: [],

    });


  // ==========================
  // Get Logged In User
  // ==========================
  const user =
  JSON.parse(

    localStorage.getItem(
      "user"
    )

  );

  const userId =

    user?.employee_id ||

    user?.id;


  // ==========================
  // Fetch Dashboard Data
  // ==========================
  useEffect(() => {

    if (!userId)
    return;

    console.log(
      "User ID:",
      userId
    );

    console.log(
      "Calling API:",
      `http://localhost:5000/api/dashboard/employee/${userId}`
    );

    axios.get(

      `http://localhost:5000/api/dashboard/employee/${userId}`

    )

    .then((res) => {

      console.log(
        "Dashboard Data:",
        res.data
      );

      setStats(
        res.data
      );

    })

    .catch((err) => {

      console.log(
        "Dashboard Error:",
        err
      );

    });

  }, [userId]);


  return (

    <EmployeeLayout>

      {/* Header */}
      <h1 className="text-3xl font-bold text-[#071739] mb-6">

        Employee Dashboard

      </h1>


      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">

        {/* My Leads */}
        <div className="bg-white rounded-2xl shadow-md p-6">

          <h2 className="text-gray-500 text-sm">

            My Leads

          </h2>

          <p className="text-4xl font-bold text-[#071739] mt-2">

            {stats.totalLeads}

          </p>

        </div>


        {/* Contacted */}
        <div className="bg-white rounded-2xl shadow-md p-6">

          <h2 className="text-gray-500 text-sm">

            Contacted

          </h2>

          <p className="text-4xl font-bold text-[#071739] mt-2">

            {stats.contacted}

          </p>

        </div>


        {/* Qualified */}
        <div className="bg-white rounded-2xl shadow-md p-6">

          <h2 className="text-gray-500 text-sm">

            Qualified

          </h2>

          <p className="text-4xl font-bold text-[#071739] mt-2">

            {stats.qualified}

          </p>

        </div>


        {/* Converted */}
        <div className="bg-white rounded-2xl shadow-md p-6">

          <h2 className="text-gray-500 text-sm">

            Converted

          </h2>

          <p className="text-4xl font-bold text-[#071739] mt-2">

            {stats.converted}

          </p>

        </div>

      </div>


      {/* Recent Leads */}
      <div className="bg-white rounded-2xl shadow-md p-6">

        <h2 className="text-xl font-semibold text-[#071739] mb-5">

          Recent Leads

        </h2>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b text-gray-600">

                <th className="text-left p-4">

                  Company

                </th>

                <th className="text-left p-4">

                  Contact Person

                </th>

                <th className="text-left p-4">

                  Phone

                </th>

                <th className="text-left p-4">

                  Status

                </th>

                <th className="text-left p-4">

                  Lead Mode

                </th>

              </tr>

            </thead>


            <tbody>

              {

                stats.recentLeads
                ?.length > 0

                ? (

                  stats.recentLeads
                  .map((lead) => (

                    <tr

                      key={lead.id}

                      className="border-b hover:bg-gray-50 transition"

                    >

                      <td className="p-4">

                        {
                          lead.company_name
                        }

                      </td>

                      <td className="p-4">

                        {
                          lead.contact_person_name
                        }

                      </td>

                      <td className="p-4">

                        {
                          lead.phone
                        }

                      </td>

                      <td className="p-4 capitalize">

                        {
                          lead.lead_status
                        }

                      </td>

                      <td className="p-4 capitalize">

                        {
                          lead.lead_mode
                          ?.replace(
                            "_",
                            " "
                          )
                        }

                      </td>

                    </tr>

                  ))

                )

                : (

                  <tr>

                    <td
                      colSpan="5"
                      className="text-center p-8 text-gray-400"
                    >

                      No Leads Found

                    </td>

                  </tr>

                )

              }

            </tbody>

          </table>

        </div>

      </div>

    </EmployeeLayout>

  );

}