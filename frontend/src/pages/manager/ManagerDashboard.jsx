import axios from "axios";

import {
  useEffect,
  useState,
} from "react";

import ManagerLayout
from "../../layouts/ManagerLayout";

import "../../styles/managerDashboard.css";

import {
  Users,
  UserCheck,
  Briefcase,
  BadgeCheck,
} from "lucide-react";

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

      {/* Header */}
      <div className="dashboard-header">

        <div>

          <h1 className="dashboard-title">

            Manager Dashboard

          </h1>

          <p className="dashboard-subtitle">

            Welcome back,
            here's what is happening
            in your CRM today.

          </p>

        </div>

      </div>

      {/* Top Cards */}
      <div className="dashboard-grid">

        {/* Total Leads */}
        <div className="crm-card blue-card">

          <div className="crm-card-top">

            <div className="icon-circle blue-bg">

              <Briefcase
                size={26}
              />

            </div>

          </div>

          <h3>
            Total Leads
          </h3>

          <h2>
            {
              stats.totalLeads
            }
          </h2>

        </div>

        {/* Employees */}
        <div className="crm-card green-card">

          <div className="crm-card-top">

            <div className="icon-circle green-bg">

              <Users
                size={26}
              />

            </div>

          </div>

          <h3>
            Employees
          </h3>

          <h2>
            {
              stats.totalEmployees
            }
          </h2>

        </div>

        {/* New Leads */}
        <div className="crm-card orange-card">

          <div className="crm-card-top">

            <div className="icon-circle orange-bg">

              <UserCheck
                size={26}
              />

            </div>

          </div>

          <h3>
            New Leads
          </h3>

          <h2>
            {
              stats.newLeads
            }
          </h2>

        </div>

        {/* Converted */}
        <div className="crm-card purple-card">

          <div className="crm-card-top">

            <div className="icon-circle purple-bg">

              <BadgeCheck
                size={26}
              />

            </div>

          </div>

          <h3>
            Converted
          </h3>

          <h2>
            {
              stats.convertedLeads
            }
          </h2>

        </div>

      </div>

      {/* Recent Leads */}
      <div className="recent-card">

        <div className="recent-header">

          <h2>
            Recent Leads
          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr>

                <th>
                  Company
                </th>

                <th>
                  Contact
                </th>

                <th>
                  Phone
                </th>

                <th>
                  Status
                </th>

                <th>
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
                >

                  <td>
                    {
                      lead.company_name
                    }
                  </td>

                  <td>
                    {
                      lead.contact_person
                    }
                  </td>

                  <td>
                    {
                      lead.phone
                    }
                  </td>

                  <td>

                    <span
                      className={`status-badge ${
                      lead.lead_status ===
                      "Converted"

                      ? "converted"

                      : lead.lead_status ===
                      "New Lead"

                      ? "new"

                      : "connected"
                    }`}
                    >

                      {
                        lead.lead_status
                      }

                    </span>

                  </td>

                  <td>
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