import axios from "axios";
import {
  useEffect,
  useState,
} from "react";

import ManagerLayout
from "../../layouts/ManagerLayout";

import "../../styles/managerDashboard.css";

export default function ManagerDashboard() {

  const [stats,
    setStats] =
    useState({
      totalLeads: 0,
      totalEmployees: 0,
      newLeads: 0,
      convertedLeads: 0,
      recentLeads: [],
    });

  // Fetch Dashboard Data
  useEffect(() => {

    axios.get(
      "http://localhost:5000/api/dashboard/stats"
    )
    .then((res) => {

      setStats(
        res.data
      );

    })
    .catch((err) => {

      console.log(err);

    });

  }, []);

  return (

    <ManagerLayout>

      <h1 className="dashboard-title">
        Manager Dashboard
      </h1>

      {/* Top Cards */}
      <div className="dashboard-grid">

        <div className="dashboard-card">

          <h2>
            Total Leads
          </h2>

          <p className="dashboard-number">
            {
              stats.totalLeads
            }
          </p>

        </div>

        <div className="dashboard-card">

          <h2>
            Employees
          </h2>

          <p className="dashboard-number">
            {
              stats.totalEmployees
            }
          </p>

        </div>

        <div className="dashboard-card">

          <h2>
            New Leads
          </h2>

          <p className="dashboard-number">
            {
              stats.newLeads
            }
          </p>

        </div>

        <div className="dashboard-card">

          <h2>
            Converted Leads
          </h2>

          <p className="dashboard-number">
            {
              stats.convertedLeads
            }
          </p>

        </div>

      </div>

      {/* Recent Leads */}
      <div className="recent-leads-card">

        <div className="flex justify-between items-center mb-5">

          <h2 className="text-xl font-semibold text-[#071739]">

            Recent Leads

          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b">

                <th className="table-head">
                  Company
                </th>

                <th className="table-head">
                  Contact
                </th>

                <th className="table-head">
                  Status
                </th>

                <th className="table-head">
                  Event
                </th>

              </tr>

            </thead>

            <tbody>

              {
                stats.recentLeads
                .map((lead) => (

                <tr
                  key={lead.id}
                  className="table-row"
                >

                  <td className="table-data">

                    {
                      lead.company_name
                    }

                  </td>

                  <td className="table-data">

                    {
                      lead.contact_person
                    }

                  </td>

                  <td className="table-data">

                    {
                      lead.lead_status
                    }

                  </td>

                  <td className="table-data">

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

    </ManagerLayout>
  );
}