import axios from "axios";
import { useState, useEffect } from "react";

import EmployeeLayout from "../../layouts/EmployeeLayout";

import {
  CalendarClock,
  Clock,
  CheckCircle,
  PhoneCall
} from "lucide-react";

export default function EmployeeTaskFollowups() {

  const [followups,
  setFollowups] =
  useState([]);

  useEffect(() => {

    const fetchFollowups =
    async () => {

      try {

        const user =
        JSON.parse(
          localStorage.getItem(
            "user"
          )
        );

        const employeeId =
          user?.employee_id ||
          user?.id;

        const response =
        await axios.get(

          `http://localhost:5000/api/tasks/followups/${employeeId}`

        );

        setFollowups(
          response.data
        );

      }

      catch (error) {

        console.log(error);

      }

    };

    fetchFollowups();

  }, []);

  const today =
  new Date()
  .toISOString()
  .split("T")[0];

  return (

    <EmployeeLayout>

      {/* Header */}

      <div className="dashboard-header">

        <div>

          <h1 className="dashboard-title">
            Task Followups
          </h1>

          <p className="dashboard-subtitle">
            Manage scheduled callbacks and pending followups
          </p>

        </div>

      </div>

      {/* Cards */}

      <div className="dashboard-grid">

        <div className="crm-card blue-card">

          <div className="crm-card-top">

            <div className="icon-circle blue-bg">

              <CalendarClock
                size={18}
              />

            </div>

          </div>

          <h3>
            Total Followups
          </h3>

          <h2>
            {followups.length}
          </h2>

        </div>

        <div className="crm-card green-card">

          <div className="crm-card-top">

            <div className="icon-circle green-bg">

              <PhoneCall
                size={18}
              />

            </div>

          </div>

          <h3>
            Today's Followups
          </h3>

          <h2>

            {

              followups.filter(

                item =>

                item.followup_date
                ?.split("T")[0]
                === today

              ).length

            }

          </h2>

        </div>

        <div className="crm-card orange-card">

          <div className="crm-card-top">

            <div className="icon-circle orange-bg">

              <Clock
                size={18}
              />

            </div>

          </div>

          <h3>
            Upcoming
          </h3>

          <h2>

            {

              followups.filter(

                item =>

                item.followup_date
                ?.split("T")[0]
                > today

              ).length

            }

          </h2>

        </div>

        <div className="crm-card purple-card">

          <div className="crm-card-top">

            <div className="icon-circle purple-bg">

              <CheckCircle
                size={18}
              />

            </div>

          </div>

          <h3>
            Completed
          </h3>

          <h2>0</h2>

        </div>

      </div>

      {/* Filters */}

      <div className="recent-card">

        <div

          style={{

            display: "flex",

            gap: "15px",

            marginBottom:
            "20px",

            flexWrap:
            "wrap"

          }}

        >

          <input

            type="text"

            placeholder=
            "Search Company..."

            style={{

              padding:
              "10px",

              border:
              "1px solid #ddd",

              borderRadius:
              "8px",

              minWidth:
              "250px"

            }}

          />

          <select

            style={{

              padding:
              "10px",

              border:
              "1px solid #ddd",

              borderRadius:
              "8px"

            }}

          >

            <option>
              All
            </option>

            <option>
              Today
            </option>

            <option>
              Upcoming
            </option>

          </select>

        </div>

        {/* Table */}

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
                  Followup Date
                </th>

                <th>
                  Time
                </th>

                <th>
                  Remarks
                </th>

                <th>
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {

                followups.length > 0

                ?

                (

                  followups.map(

                    (item) => (

                      <tr
                        key={
                          item.followup_id
                        }
                      >

                        <td>
                          {
                            item.company_name
                          }
                        </td>

                        <td>
                          {
                            item.contact_person_name
                          }
                        </td>

                        <td>
                          {
                            item.phone
                          }
                        </td>

                        <td>

                          {

                            new Date(

                              item.followup_date

                            )

                            .toLocaleDateString()

                          }

                        </td>

                        <td>
                          {
                            item.followup_time
                          }
                        </td>

                        <td>
                          {
                            item.remarks
                          }
                        </td>

                        <td>

                          <span
                            className=
                            "status-badge connected"
                          >

                            Followup

                          </span>

                        </td>

                      </tr>

                    )

                  )

                )

                :

                (

                  <tr>

                    <td

                      colSpan="7"

                      style={{

                        textAlign:
                        "center",

                        padding:
                        "20px"

                      }}

                    >

                      No Followups Found

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