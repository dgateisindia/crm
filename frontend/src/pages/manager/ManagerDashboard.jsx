import axios from "axios";
import {
  useEffect,
  useState,
} from "react";

import {
  FaUsers,
  FaUserTie,
  FaChartLine,
  FaCheckCircle,
} from "react-icons/fa";

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

      <div className="dashboard-container">

        <h1 className="dashboard-title">
          Manager Dashboard
        </h1>

        {/* Top Cards */}
        <div className="dashboard-grid">

          {/* Total Leads */}
          <div className="dashboard-card">

            <div className="card-icon blue">

              <FaUsers />

            </div>

            <div>

              <h2>
                Total Leads
              </h2>

              <p className="dashboard-number">
                {
                  stats.totalLeads
                }
              </p>

            </div>

          </div>

          {/* Employees */}
          <div className="dashboard-card">

            <div className="card-icon purple">

              <FaUserTie />

            </div>

            <div>

              <h2>
                Employees
              </h2>

              <p className="dashboard-number">
                {
                  stats.totalEmployees
                }
              </p>

            </div>

          </div>

          {/* New Leads */}
          <div className="dashboard-card">

            <div className="card-icon orange">

              <FaChartLine />

            </div>

            <div>

              <h2>
                New Leads
              </h2>

              <p className="dashboard-number">
                {
                  stats.newLeads
                }
              </p>

            </div>

          </div>

          {/* Converted Leads */}
          <div className="dashboard-card">

            <div className="card-icon green">

              <FaCheckCircle />

            </div>

            <div>

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

        </div>

        {/* Recent Leads */}
        <div className="recent-leads-card">

          <div className="recent-header">

            <h2>
              Recent Leads
            </h2>

          </div>

          <div className="table-wrapper">

            <table className="dashboard-table">

              <thead>

                <tr>

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

                      <span
                        className={`status-badge
                        ${
                          lead.lead_status === "Converted"
                          ? "status-converted"
                          : lead.lead_status === "New"
                          ? "status-new"
                          : "status-pending"
                        }`}
                      >

                        {
                          lead.lead_status
                        }

                      </span>

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

      </div>

    </ManagerLayout>
  );
}