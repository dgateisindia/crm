import EmployeeLayout
from "../../layouts/EmployeeLayout";

import {
  Search,
  Filter,
} from "lucide-react";

export default function EmployeeMyLeads() {

  return (
    <EmployeeLayout>

      <div className="employee-leads-container">

        {/* Header */}
        <div className="mb-6">

          <h1 className="text-3xl font-bold text-[#071739]">
            My Leads
          </h1>

          <p className="text-gray-500 mt-1">
            View and manage your leads
          </p>

        </div>

        {/* Filters */}
        <div className="employee-filter-card">

          {/* Search */}
          <div className="employee-search-box">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search company or contact..."
              className="employee-search-input"
            />

          </div>

          {/* Status Filter */}
          <div className="employee-filter-box">

            <Filter size={18} />

            <select
              className="employee-filter-select"
            >
              <option>
                All Status
              </option>

              <option>
                Connected
              </option>

              <option>
                Interested
              </option>

              <option>
                Follow-up Required
              </option>

              <option>
                Converted
              </option>
            </select>

          </div>

        </div>

        {/* Leads Table */}
        <div className="employee-table-card">

          <table className="w-full">

            <thead>

              <tr className="border-b">

                <th className="employee-table-head">
                  Company
                </th>

                <th className="employee-table-head">
                  Contact
                </th>

                <th className="employee-table-head">
                  Phone
                </th>

                <th className="employee-table-head">
                  Status
                </th>

                <th className="employee-table-head">
                  Event
                </th>

                <th className="employee-table-head">
                  Date
                </th>

              </tr>

            </thead>

            <tbody>

              <tr className="border-b hover:bg-gray-50">

                <td className="employee-table-data">
                  DGATE
                </td>

                <td className="employee-table-data">
                  Ashwin
                </td>

                <td className="employee-table-data">
                  9876543210
                </td>

                <td className="employee-table-data">
                  Interested
                </td>

                <td className="employee-table-data">
                  Wedding Expo
                </td>

                <td className="employee-table-data">
                  20 May
                </td>

              </tr>

              <tr className="hover:bg-gray-50">

                <td className="employee-table-data">
                  ABC Corp
                </td>

                <td className="employee-table-data">
                  Rahul
                </td>

                <td className="employee-table-data">
                  9988776655
                </td>

                <td className="employee-table-data">
                  Connected
                </td>

                <td className="employee-table-data">
                  Business Meet
                </td>

                <td className="employee-table-data">
                  24 May
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </EmployeeLayout>
  );
}