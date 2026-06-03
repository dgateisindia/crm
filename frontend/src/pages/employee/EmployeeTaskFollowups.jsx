import EmployeeLayout from "../../layouts/EmployeeLayout";

import {
  CalendarClock,
  Clock,
  CheckCircle,
  PhoneCall
} from "lucide-react";

export default function EmployeeTaskFollowups() {

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

      {/* Top Cards */}
      <div className="dashboard-grid">

        <div className="crm-card blue-card">

          <div className="crm-card-top">

            <div className="icon-circle blue-bg">

              <CalendarClock size={18} />

            </div>

          </div>

          <h3>
            Total Followups
          </h3>

          <h2>
            25
          </h2>

        </div>

        <div className="crm-card green-card">

          <div className="crm-card-top">

            <div className="icon-circle green-bg">

              <PhoneCall size={18} />

            </div>

          </div>

          <h3>
            Today's Followups
          </h3>

          <h2>
            10
          </h2>

        </div>

        <div className="crm-card orange-card">

          <div className="crm-card-top">

            <div className="icon-circle orange-bg">

              <Clock size={18} />

            </div>

          </div>

          <h3>
            Upcoming
          </h3>

          <h2>
            12
          </h2>

        </div>

        <div className="crm-card purple-card">

          <div className="crm-card-top">

            <div className="icon-circle purple-bg">

              <CheckCircle size={18} />

            </div>

          </div>

          <h3>
            Completed
          </h3>

          <h2>
            3
          </h2>

        </div>

      </div>

      {/* Search & Filter */}
      <div className="recent-card">

        <div
          style={{
            display: "flex",
            gap: "15px",
            marginBottom: "20px",
            flexWrap: "wrap"
          }}
        >

          <input
            type="text"
            placeholder="Search Company..."
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              minWidth: "250px"
            }}
          />

          <select
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "8px"
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

            <option>
              Completed
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
                  Status
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              <tr>

                <td>
                  Infosys
                </td>

                <td>
                  Ravi Kumar
                </td>

                <td>
                  9876543210
                </td>

                <td>
                  05-06-2026
                </td>

                <td>
                  11:00 AM
                </td>

                <td>

                  <span className="status-badge new">
                    Today
                  </span>

                </td>

                <td>

                  <button className="action-btn">
                    Actions
                  </button>

                </td>

              </tr>

              <tr>

                <td>
                  TCS
                </td>

                <td>
                  Suresh
                </td>

                <td>
                  9876543211
                </td>

                <td>
                  07-06-2026
                </td>

                <td>
                  03:00 PM
                </td>

                <td>

                  <span className="status-badge connected">
                    Upcoming
                  </span>

                </td>

                <td>

                  <button className="action-btn">
                    Actions
                  </button>

                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </EmployeeLayout>

  );

}