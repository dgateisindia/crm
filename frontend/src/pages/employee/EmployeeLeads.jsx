import axios from "axios";

import {
  useState,
  useEffect,
} from "react";

import EmployeeLayout
from "../../layouts/EmployeeLayout";

import {
  Search,
  Filter,
} from "lucide-react";

export default function EmployeeMyLeads() {

  const [leads,
    setLeads] =
    useState([]);

  const [search,
    setSearch] =
    useState("");

  const [statusFilter,
    setStatusFilter] =
    useState("All Status");

  useEffect(() => {

    const userId =
    localStorage.getItem(
      "userId"
    );

    axios.get(
      `http://localhost:5000/api/leads/my-leads/${userId}`
    )
    .then((res) => {

      setLeads(
        res.data
      );

    })
    .catch((err) => {

      console.log(err);

    });

  }, []);

  // Filter Logic
  const filteredLeads =
    leads.filter(
      (lead) => {

      const matchesSearch =

      lead.company_name
      ?.toLowerCase()
      .includes(
        search.toLowerCase()
      )

      ||

      lead.contact_person
      ?.toLowerCase()
      .includes(
        search.toLowerCase()
      );

      const matchesStatus =

      statusFilter ===
      "All Status"

      ||

      lead.lead_status ===
      statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

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
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

          {/* Status Filter */}
          <div className="employee-filter-box">

            <Filter size={18} />

            <select
              className="employee-filter-select"
              value={
                statusFilter
              }
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >

              <option>
                All Status
              </option>

              <option>
                New Lead
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

              {
                filteredLeads.map(
                (lead) => (

                <tr
                  key={lead.id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="employee-table-data">

                    {
                      lead.company_name
                    }

                  </td>

                  <td className="employee-table-data">

                    {
                      lead.contact_person
                    }

                  </td>

                  <td className="employee-table-data">

                    {
                      lead.phone
                    }

                  </td>

                  <td className="employee-table-data">

                    {
                      lead.lead_status
                    }

                  </td>

                  <td className="employee-table-data">

                    {
                      lead.special_event
                      || "-"
                    }

                  </td>

                  <td className="employee-table-data">

                    {
                      lead.event_date
                      || "-"
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