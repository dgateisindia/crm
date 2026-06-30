
import axios from "axios";

import {useState,useEffect,} from "react";

import {useNavigate} from "react-router-dom";

import EmployeeLayout from "../../layouts/EmployeeLayout";

import "../../styles/managerDashboard.css";

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

    axios.get(

      `http://localhost:5000/api/dashboard/employee/${userId}`

    )

    .then((res) => {

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