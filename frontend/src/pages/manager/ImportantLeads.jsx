import api from "../../utils/api";
import {
  useEffect,
  useState
} from "react";
import "../../styles/status.css";

import ManagerLayout from "../../layouts/ManagerLayout";
import "../../styles/leads.css";

import {
  useNavigate
} from "react-router-dom";

import {
  //Star,
 // BadgeCheck,
  PhoneCall,
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

  const [
    search,
    setSearch
  ] = useState("");

  const navigate =
  useNavigate();

 //const [allLeads, setAllLeads] = useState([]);


  // ==========================
  // Fetch Important Leads
  // ==========================
  const fetchLeads =
  async () => {

    try {

      const response =
      await  api.get(
        "/leads/important"
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

  try {

    //const response =
    await  api.get(
      "/leads/all"
    );

    //setAllLeads(
    //  response.data
    //);

  }

  catch (error) {

    console.log(error);

  }

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
    lead.lead_status?.toLowerCase().includes(searchText) ||
    lead.email?.toLowerCase().includes(searchText)
  );
});



  return (

    <ManagerLayout>

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
                    className={`status-badge ${lead.lead_status}`}
                  >

                    {
                    lead.lead_status
                    }

                  </span>

                </td>


                {/* Action Menu */}
                <td className="p-4 relative">

                  <details
                    className="dropdownMenu"
                  >

                    <summary
                      className="actionBtn"
                    >

                      <MoreVertical
                        size={20}
                      />

                    </summary>

                    <div
                      className="actionMenu"
                    >

                      <button

                        onClick={() =>
                        navigate(

                        `/manager/lead/${lead.id}`

                        )
                        }

                        className="menuItem"

                      >

                        <Eye size={16} />

                        View Lead

                      </button>


                      <button

                        onClick={() =>
                        navigate(

                        `/manager/edit-lead/${lead.id}`

                        )
                        }

                        className="menuItem"

                      >

                        <Pencil size={16} />

                        Edit Lead

                      </button>


                      <button
                        className="menuItem"
                      >

                        <PhoneCall
                          size={16}
                        />

                        Add Followup

                      </button>


                      <button

                        onClick={() =>
                        handleDelete(
                        lead.id
                        )
                        }

                        className="menuItem deleteBtn"

                      >

                        <Trash2
                          size={16}
                        />

                        Delete Lead

                      </button>

                    </div>

                  </details>

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

    </ManagerLayout>

  );

}