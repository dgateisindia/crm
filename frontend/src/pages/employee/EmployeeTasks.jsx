import EmployeeLayout from "../../layouts/EmployeeLayout";

import {
  ClipboardList,
  Phone,
  CalendarClock,
  CheckCircle
} from "lucide-react";

export default function EmployeeTasks() {

  return (

    <EmployeeLayout>

      {/* Header */}
      <div className="dashboard-header">

        <div>

          <h1 className="dashboard-title">
            Tasks
          </h1>

          <p className="dashboard-subtitle">
            Manage uploaded contacts and daily calls
          </p>

        </div>

      </div>

      {/* Top Cards */}
      <div className="dashboard-grid">

        {/* Total Tasks */}
        <div className="crm-card blue-card">

          <div className="crm-card-top">

            <div className="icon-circle blue-bg">

              <ClipboardList
                size={18}
              />

            </div>

          </div>

          <h3>
            Total Tasks
          </h3>

          <h2>
            100
          </h2>

        </div>

        {/* Pending Calls */}
        <div className="crm-card green-card">

          <div className="crm-card-top">

            <div className="icon-circle green-bg">

              <Phone
                size={18}
              />

            </div>

          </div>

          <h3>
            Pending Calls
          </h3>

          <h2>
            80
          </h2>

        </div>

        {/* Task Followups */}
        <div className="crm-card orange-card">

          <div className="crm-card-top">

            <div className="icon-circle orange-bg">

              <CalendarClock
                size={18}
              />

            </div>

          </div>

          <h3>
            Task Followups
          </h3>

          <h2>
            15
          </h2>

        </div>

        {/* Completed */}
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

          <h2>
            5
          </h2>

        </div>

      </div>

      {/* Search + Filter */}
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
              All Status
            </option>

            <option>
              Pending
            </option>

            <option>
              Followup
            </option>

            <option>
              Completed
            </option>

            <option>
              Not Interested
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
                  Contact Person
                </th>

                <th>
                  Phone
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

                  <span className="status-badge new">
                    Pending
                  </span>

                </td>

                <td>

                  <button
                    className="action-btn"
                  >
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

                  <span className="status-badge connected">
                    Followup
                  </span>

                </td>

                <td>

                  <button
                    className="action-btn"
                  >
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