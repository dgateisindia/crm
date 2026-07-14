import api from "../../utils/api";
import {
  useEffect,
  useState
} from "react";

import EmployeeLayout from "../../layouts/EmployeeLayout";
import "../../styles/leads.css";
import "../../styles/status.css";
import useActionMenu from "../../hooks/useActionMenu";
import {
  useNavigate
} from "react-router-dom";
import { STATUS_THEME } from "../../utils/statusTheme";
import {normalizeStatus,formatStatus} from "../../utils/statusUtils";

import {
  //Star,
 // BadgeCheck,
  //PhoneCall,
 // UserX,
  Eye,
  Pencil,
  Trash2,
  MoreVertical
} from "lucide-react";

export default function ImportantLeads() {

  const [
    leads,
    setLeads
  ] = useState([]);

  const {
  openMenu,
  toggleMenu,
  menuRef
} = useActionMenu();

 // const [allLeads, setAllLeads] = useState([]);

  const [
    search,
    setSearch
  ] = useState("");

  const navigate =
  useNavigate();

  const user =
    JSON.parse(localStorage.getItem("user"));

  const employeeId =
    user?.id;


  // ==========================
  // Fetch Important Leads
  // ==========================
  const fetchLeads =
  async () => {

    try {

      const response =
      await  api.get(
         `/leads/employee/${employeeId}/important`
      );


      setLeads(
        response.data
      );

    }

    catch (error) {

      console.log(error);

    }

  };
const fetchAllLeads = async () => {

  //const response =
  await  api.get(
    `/leads/employee/${employeeId}`
  );

 // setAllLeads(response.data);

};

  // ==========================
  // Load Data
  // ==========================
 useEffect(() => {

  const loadLeads =
  async () => {

    await fetchLeads();
    await fetchAllLeads();

  };

  loadLeads();

}, []);


  // ==========================
  // Delete Lead
  // ==========================
  const handleDelete =
  async (id) => {

    const confirmDelete =
    window.confirm(
      "Are you sure you want to delete this lead?"
    );

    if (!confirmDelete)
    return;

    try {

      await  api.delete(
        `/leads/delete/${id}`
      );

      alert(
        "Lead deleted successfully"
      );

      fetchLeads();

    }

    catch (error) {

      console.log(error);

      alert(
        "Failed to delete lead"
      );

    }

  };


  // ==========================
  // Search Filter
  // ==========================
 const filteredLeads = leads.filter((lead) => {
  const searchText = search.toLowerCase();

  return (
    lead.company_name?.toLowerCase().includes(searchText) ||
    lead.contact_person_name?.toLowerCase().includes(searchText) ||
    lead.phone?.includes(search) ||
    lead.city?.toLowerCase().includes(searchText) ||
    lead.designation?.toLowerCase().includes(searchText) ||
    formatStatus(lead.lead_status).toLocaleLowerCase().includes(searchText) ||   
    lead.email?.toLowerCase().includes(searchText)
  );
});


  return (

    <EmployeeLayout>

      <div className="leads-container">

        {/* Header */}
        <div className="mb-6">

          <h1 className="leads-header-title">

            Important Leads

          </h1>

          <p className="leads-header-subtitle">

            Manage important CRM leads

          </p>

        </div>


        


        {/* Search */}
        <input
          type="text"
          placeholder="Search important leads..."
          className="manager-search-input mb-4"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
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

                <th className="table-head text-center">
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {

              filteredLeads.length > 0

              ? (

              filteredLeads.map(
              (lead) => (

              <tr
              key={lead.id}
              className="table-row"
              >

                <td className="table-data">
                  {lead.company_name}
                </td>

                <td className="table-data">

                  {
                  lead.contact_person_name
                  || "N/A"
                  }

                </td>

                <td className="table-data">

                  {
                  lead.designation
                  || "N/A"
                  }

                </td>

                <td className="table-data">

                  {
                  lead.phone
                  || "N/A"
                  }

                </td>


                <td className="table-data">

                  <span
                  className="status-badge"
                  style={{
                    background:
                      STATUS_THEME[
                        normalizeStatus(lead.lead_status)
                      ]?.bg || "#E5E7EB",

                    color:
                      STATUS_THEME[
                        normalizeStatus(lead.lead_status)
                      ]?.color || "#374151",
                  }}
                >
                  {formatStatus(lead.lead_status)}
                </span>

                </td>


                {/* Action Menu */}
                <td
                  className="p-4 actionCell"
                  style={{ position: "relative" }}
                >

                  <div className="action-menu-container">

                    <button
                      className="action-menu-btn"
                      onClick={() => toggleMenu(lead.id)}
                    >
                      <MoreVertical size={20} />
                    </button>

                    {openMenu === lead.id && (

                      <div
                        ref={menuRef}
                        className="action-dropdown"
                      >

                        <button
                          className="action-item"
                          onClick={() =>
                            navigate(`/employee/lead/${lead.id}`)
                          }
                        >
                          <Eye size={16} />
                          View Lead
                        </button>

                        <button
                          className="action-item"
                          onClick={() =>
                            navigate(`/employee/edit-lead/${lead.id}`)
                          }
                        >
                          <Pencil size={16} />
                          Edit Lead
                        </button>

                      
                        <button
                          className="action-item deleteBtn"
                          onClick={() =>
                            handleDelete(lead.id)
                          }
                        >
                          <Trash2 size={16} />
                          Delete Lead
                        </button>

                      </div>

                    )}

                  </div>

                </td>
              </tr>

              ))

              ) : (

              <tr>

                <td
                  colSpan="6"
                  className="text-center p-6 text-gray-500"
                >

                  No Important Leads Found

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