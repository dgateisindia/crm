import api from "../../utils/api";
import { useEffect, useState } from "react";
import {
  normalizeStatus,
  formatStatus,
} from "../../utils/statusUtils";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import "../../styles/leads.css";
import "../../styles/status.css";
import { STATUS_THEME } from "../../utils/statusTheme";
export default function ConvertedLeads() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");

  

  // ==========================
  // Fetch Converted Leads
  // ==========================
  

  // ==========================
  // Load Data
  // ==========================
  useEffect(() => {
  const fetchConvertedLeads = async () => {
    try {
      // Get CRM employee ID
      const employeeResponse = await api.get("/employee/me");

      const employeeId =
        employeeResponse.data.data.employee_id;

      console.log("CRM EMPLOYEE ID:", employeeId);

      // Get converted leads
      const response = await api.get(
        `/leads/employee/${employeeId}/converted`
      );

      console.log("CONVERTED API RESPONSE:", response.data);

      setLeads(response.data);
    } catch (error) {
      console.error(
        "FAILED TO FETCH CONVERTED LEADS:",
        error
      );
    }
  };

  fetchConvertedLeads();
}, []);
  // ==========================
  // Search Filter
  // ==========================
  const filteredLeads = leads.filter((lead) => {
    const searchText = search.toLowerCase();

    return (
      lead.company_name
        ?.toLowerCase()
        .includes(searchText) ||

      lead.contact_person_name
        ?.toLowerCase()
        .includes(searchText) ||

      lead.phone
        ?.toString()
        .includes(search) ||

      lead.city
        ?.toLowerCase()
        .includes(searchText)
    );
  });

  return (
    <EmployeeLayout>

      <div className="leads-container">

        {/* Header */}
        <div className="mb-6">

          <h1 className="leads-header-title">
            Converted Leads
          </h1>

          <p className="leads-header-subtitle">
            Manage converted CRM leads
          </p>

        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search converted leads..."
          className="manager-search-input mb-4"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        {/* Table */}
        <div className="leads-card tableWrapper">

          <table className="w-full">

            <thead>

              <tr className="border-b">

                <th className="table-head">
                  Company
                </th>

                <th className="table-head">
                  Contact Person
                </th>

                <th className="table-head">
                  Designation
                </th>

                <th className="table-head">
                  Phone
                </th>

                <th className="table-head">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredLeads.length > 0 ? (

                filteredLeads.map((lead) => (

                  <tr
                    key={lead.id}
                    className="table-row"
                  >

                    <td className="table-data">
                      {lead.company_name}
                    </td>

                    <td className="table-data">
                      {
                        lead.contact_person_name ||
                        "N/A"
                      }
                    </td>

                    <td className="table-data">
                      {
                        lead.designation ||
                        "N/A"
                      }
                    </td>

                    <td className="table-data">
                      {
                        lead.phone ||
                        "N/A"
                      }
                    </td>

                    <td className="table-data">

                      <span

                          className="status-badge"

                          style={{

                          background:
                          STATUS_THEME[
                          normalizeStatus(lead.lead_status)
                          ]?.bg,

                          color:
                          STATUS_THEME[
                          normalizeStatus(lead.lead_status)
                          ]?.color,

                          }}

                          >

                          {formatStatus(lead.lead_status)}

                          </span>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="5"
                    className="text-center p-6 text-gray-500"
                  >
                    No Converted Leads Found
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </EmployeeLayout>
  );
}