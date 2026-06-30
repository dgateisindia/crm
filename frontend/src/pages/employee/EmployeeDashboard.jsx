
import api from "../../utils/api";

import {useState,useEffect,} from "react";

import {useNavigate} from "react-router-dom";

import EmployeeLayout from "../../layouts/EmployeeLayout";

import "../../styles/managerDashboard.css";

import LeadStatusChart
from "../../components/charts/LeadStatusChart";

import LeadTrendChart
from "../../components/charts/LeadTrendChart";

import EmployeePerformanceChart
from "../../components/charts/EmployeePerformanceChart";

import {

  Briefcase,
  UserPlus,
  BadgeCheck,
  UserX

}
from "lucide-react";

export default function EmployeeDashboard() {

  const navigate =
  useNavigate();

  const [stats,
    setStats] =
    useState({

      totalLeads: 0,
      connected: 0,
      new: 0,
      converted: 0,
      recentLeads: [],

    });
    const [leadStatus, setLeadStatus] =
    useState([]);

    const [leadTrend, setLeadTrend] =
    useState([]);

    const [followupChart, setFollowupChart] =
    useState([]);


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

  if (!userId) return;

  // Dashboard Cards
  api.get(`/dashboard/employee/${userId}`)
    .then((res) => {
      setStats(res.data);
    })
    .catch(console.error);

  // Lead Status Chart
  api.get(`/dashboard/employee/${userId}/lead-status`)
    .then((res) => {
      setLeadStatus(res.data);
    })
    .catch(console.error);

  // Lead Trend Chart
  api.get(`/dashboard/employee/${userId}/lead-trend`)
    .then((res) => {
      setLeadTrend(res.data);
    })
    .catch(console.error);

  // Follow-up Chart
  api.get(`/dashboard/employee/${userId}/followup-chart`)
    .then((res) => {
      setFollowupChart(res.data);
    })
    .catch(console.error);

}, [userId]);


  return (

    <EmployeeLayout>

      {/* Header */}
      <div className="dashboard-header">

        

      </div>


      {/* Top Cards */}
      <div className="dashboard-grid">

        {/* My Leads */}
        <div

          className="crm-card blue-card cursor-pointer"

          onClick={() =>
            navigate(
              "/employee/my-leads"
            )
          }

        >

          <div className="crm-card-top">

            <div className="icon-circle blue-bg">

              <Briefcase
                size={18}
              />

            </div>

          </div>

          <h3>

            My Leads

          </h3>

          <h2>

            {
              stats.totalLeads
            }

          </h2>

        </div>


        {/* New Leads */}
        <div

          className="crm-card green-card cursor-pointer"

          onClick={() =>
            navigate(
              "/employee/my-leads"
            )
          }

        >

          <div className="crm-card-top">

            <div className="icon-circle green-bg">

              <UserPlus
                size={18}
              />

            </div>

          </div>

          <h3>

            Connected

          </h3>

          <h2>

            {
              stats.connected
            }

          </h2>

        </div>


        {/* Qualified */}
        <div

          className="crm-card orange-card cursor-pointer"

          onClick={() =>
            navigate(
              "/employee/my-leads"
            )
          }

        >

          <div className="crm-card-top">

            <div className="icon-circle orange-bg">

              <UserX
                size={18}
              />

            </div>

          </div>

          <h3>

            Followup

          </h3>

          <h2>

            {
              stats.new
            }

          </h2>

        </div>


        {/* Converted */}
        <div

          className="crm-card purple-card cursor-pointer"

          onClick={() =>
            navigate(
              "/employee/converted-leads"
            )
          }

        >

          <div className="crm-card-top">

            <div className="icon-circle purple-bg">

              <BadgeCheck
                size={18}
              />

            </div>

          </div>

          <h3>

            Converted

          </h3>

          <h2>

            {
              stats.converted
            }

          </h2>

        </div>

      </div>
      {/* Charts */}
      <div className="dashboard-charts">

        <LeadStatusChart
          data={leadStatus}
        />

        <LeadTrendChart
          data={leadTrend}
        />

        <EmployeePerformanceChart
          data={followupChart}
        />

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
                  Contact Person
                </th>

                <th>
                  Phone
                </th>

                <th>
                  Status
                </th>

                <th>
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
                    >

                      <td>
                        {
                          lead.company_name
                        }
                      </td>

                      <td>

                        {
                          lead.contact_person_name
                          || "N/A"
                        }

                      </td>

                      <td>

                        {
                          lead.phone
                          || "N/A"
                        }

                      </td>

                      <td>

                        <span
                          className={`status-badge ${
                            lead.lead_status ===
                            "converted"

                            ? "converted"

                            : lead.lead_status ===
                            "new"

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
                          lead.lead_mode
                          ?.replace(
                            "_",
                            " "
                          ) || "N/A"
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