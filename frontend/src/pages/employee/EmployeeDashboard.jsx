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
      connected: 0,
      interested: 0,
      converted: 0,
      recentLeads: [],
    });

  const userId =
  localStorage.getItem(
    "userId"
  );

  useEffect(() => {


    console.log(
"User ID:",
userId
);

console.log(
"Calling:",
`http://localhost:5000/api/dashboard/employee/${userId}`
);

    axios.get(
      `http://localhost:5000/api/dashboard/employee/${userId}`
    )
    .then((res) => {


      console.log("Dashboard data:", res.data);

      setStats(
        res.data
      );

    })
    .catch((err) => {

      console.log(err);

    });

  }, [userId]);

  return (

    <EmployeeLayout>

      <h1 className="text-3xl font-bold text-[#071739] mb-6">

        Employee Dashboard

      </h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">

        <div className="bg-white rounded-2xl shadow-md p-6">

          <h2 className="text-gray-500 text-sm">

            My Leads

          </h2>

          <p className="text-4xl font-bold text-[#071739] mt-2">

            {
              stats.totalLeads
            }

          </p>

        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">

          <h2 className="text-gray-500 text-sm">

            Connected

          </h2>

          <p className="text-4xl font-bold text-[#071739] mt-2">

            {
              stats.connected
            }

          </p>

        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">

          <h2 className="text-gray-500 text-sm">

            Interested

          </h2>

          <p className="text-4xl font-bold text-[#071739] mt-2">

            {
              stats.interested
            }

          </p>

        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">

          <h2 className="text-gray-500 text-sm">

            Converted

          </h2>

          <p className="text-4xl font-bold text-[#071739] mt-2">

            {
              stats.converted
            }

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

              <tr className="border-b">

                <th className="text-left p-4">
                  Company
                </th>

                <th className="text-left p-4">
                  Contact
                </th>

                <th className="text-left p-4">
                  Status
                </th>

                <th className="text-left p-4">
                  Event
                </th>

              </tr>

            </thead>

            <tbody>

              {
                stats.recentLeads
                ?.map((lead) => (

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
                      lead.contact_person
                    }

                  </td>

                  <td className="p-4">

                    {
                      lead.lead_status
                    }

                  </td>

                  <td className="p-4">

                    {
                      lead.special_event
                    }

                  </td>

                </tr>

              ))
            }

            </tbody>

          </table>

        </div>

      </div>

    </EmployeeLayout>
  );
}