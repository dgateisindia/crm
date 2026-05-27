import axios from "axios";

import {
  useState,
  useEffect,
} from "react";

import ManagerLayout from "../../layouts/ManagerLayout";

import "../../styles/leads.css";
import {useNavigate} from "react-router-dom";

import {
  Search,

  Eye,
  Pencil,
  PhoneCall,
  Trash2,
  MoreVertical

} from "lucide-react";


export default function Leads() {

  const [allLeads,
    setAllLeads] =
    useState([]);

  const [search,
    setSearch] =
    useState("");

  const [statusFilter,
    setStatusFilter] =
    useState("all");

  const [showFollowupModal,
    setShowFollowupModal] =
    useState(false);  

  const [selectedLead,
    setSelectedLead] =
    useState(null);

  const [

followupData,

setFollowupData

] =
useState({

  followup_mode:
  "call",

  lead_status:
  "connected",

  remarks:
  ""

});

  const navigate =
  useNavigate();


  // ==========================
  // Fetch Leads
  // ==========================
  const fetchLeads =
  async () => {

    try {

      const response =
      await axios.get(
        "http://localhost:5000/api/leads/all"
      );

      setAllLeads(
        response.data
      );

    }

    catch (error) {

      console.log(error);

      alert(
        "Failed to fetch leads"
      );

    }

  };


useEffect(() => {

  const loadLeads =
  async () => {

    await fetchLeads();

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

      await axios.delete(

        `http://localhost:5000/api/leads/delete/${id}`

      );


      alert(
        "Lead Deleted Successfully"
      );


      fetchLeads();

    }

    catch (error) {

      console.log(error);

      alert(
        "Failed to Delete Lead"
      );

    }

  };

  const openFollowupModal =
  (lead) => { 
    setSelectedLead(lead);
    setShowFollowupModal(true);
  };

  const handleFollowupSubmit =
  async()=>{
    try{
      const user = JSON.parse(localStorage.getItem("user"));
      await axios.post(
        "http://localhost:5000/api/followups/add",
        {
          lead_id: selectedLead.id,
          employee_id:
          user?.employee_id
          || user?.id,
          ...followupData
        }
      );
      alert("Follow-up added successfully");
      setShowFollowupModal(false);
      setFollowupData({

          followup_mode:
          "call",

          lead_status:
          "connected",

          remarks:
          ""

        });
    }
    catch (error) {
      console.log(error);
      alert("Failed to submit follow-up");
    }
  };
   

  // ==========================
  // Filter Leads
  // ==========================
  const filteredLeads =
allLeads.filter(
(lead) => {

const searchText =
search.toLowerCase();

const company =
lead.company_name
?.toLowerCase() || "";

const contact =
lead.contact_person_name
?.toLowerCase() || "";

const phone =
lead.phone
?.toString()
.toLowerCase() || "";

const email =
lead.email
?.toLowerCase() || "";

const city =
lead.city
?.toLowerCase() || "";

const source =
lead.source
?.toLowerCase() || "";

const leadMode =
lead.lead_mode
?.toLowerCase() || "";

const status =
lead.lead_status
?.toLowerCase() || "";


const matchesSearch =

company.includes(searchText)

||

contact.includes(searchText)

||

phone.includes(searchText)

||

email.includes(searchText)

||

city.includes(searchText)

||

source.includes(searchText)

||

leadMode.includes(searchText)

||

status.includes(searchText);


const matchesStatus =

statusFilter ===
"all"

||

lead.lead_status ===
statusFilter;

return (
matchesSearch &&
matchesStatus
);

});


  return (

    <ManagerLayout>

      <div className="leads-container">


        {/* Header */}
        <div className="mb-6">

          <h1 className="leads-header-title">

            Total Leads

          </h1>

          <p className="leads-header-subtitle">

            View all CRM leads

          </p>

        </div>


        {/* Filters */}
        <div className="manager-filter-card md:flex-row">


          {/* Search */}
          <div className="manager-search-box ">

            <Search size={18} />

            <input

              type="text"

              placeholder="Search company or contact..."

              className="manager-search-input"

              value={search}

              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }

            />

          </div>


          {/* Status Filter */}
          <select

            className="manager-filter-select"

            value={statusFilter}

            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }

          >

            <option value="all">
              All Status
            </option>

            <option value="new">
              New
            </option>

            <option value="contacted">
              Contacted
            </option>

            <option value="qualified">
              Qualified
            </option>

            <option value="proposal_sent">
              Proposal Sent
            </option>

            <option value="converted">
              Converted
            </option>

            <option value="lost">
              Lost
            </option>

          </select>

        </div>


        {/* Table */}
        <div className="leads-card tableWrapper overflow-hidden">

          <div className="max-h-[500px] overflow-y-auto">

            <table className="w-full">


            {/* Table Header */}
            < thead className="sticky top-0 bg-white z-10 shadow-sm">

              <tr className="border-b">

                <th className="table-head">
                  Company
                </th>

                <th className="table-head">
                  Contact Person
                </th>

                <th className="table-head">
                  Phone
                </th>

                <th className="table-head">
                  Email
                </th>

                <th className="table-head">
                  Source
                </th>

                <th className="table-head">
                  Lead Mode
                </th>

                <th className="table-head">
                  Status
                </th>

                <th className="table-head text-center">
                  Action
                </th>

              </tr>

            </thead>


            {/* Table Body */}
            <tbody>

              {

                filteredLeads.length > 0 ? (

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

                      {lead.contact_person_name}

                    </td>


                    <td className="table-data">

                      {lead.phone}

                    </td>


                    <td className="table-data">

                      {lead.email}

                    </td>


                    <td className="table-data">

                      {lead.source}

                    </td>


                    <td className="table-data">

                      {lead.lead_mode}

                    </td>


                    <td className="table-data">

                      {lead.lead_status}

                    </td>


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

                            {/* View */}  
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

                            {/* Edit */}
                            <button

                            onClick={() =>
                              navigate(
                                `/manager/edit-lead/${lead.id}`
                              )
                            }
                              className="menuItem"
                            >

                              <Pencil
                                size={16}
                              />

                              Edit Lead

                            </button>


                            {/* Followup */}
                            <button
                              className="menuItem"

                              onClick={() =>
                                openFollowupModal(
                                  lead
                                )
                              }
                            >

                              <PhoneCall
                                size={16}
                              />

                              Add Followup

                            </button>

                            


                            {/* Delete */}
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
                    colSpan="8"
                    className="text-center p-6 text-gray-500"
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

      </div>


      {


showFollowupModal && (

<div className="crmModalOverlay">

  <div className="crmModalCard">

    {/* Header */}
    <div className="crmModalHeader">

      <div>

        <h2>

          Add Followup

        </h2>

        <p>

          {
selectedLead?.company_name
          }

        </p>

      </div>

      <button

        className="closeBtn"

        onClick={() =>
setShowFollowupModal(false)
        }

      >

        ✕

      </button>

    </div>


    {/* Form */}
    <div className="crmModalForm">

      {/* Mode */}
      <div className="crmInputGroup">

        <label>

          Followup Mode

        </label>

        <select

          value={
followupData.followup_mode
          }

          onChange={(e) =>

setFollowupData({

...followupData,

followup_mode:
e.target.value

})

          }

        >

          <option value="call">
            Call
          </option>

          <option value="whatsapp">
            WhatsApp
          </option>

          <option value="email">
            Email
          </option>

          <option value="meeting">
            Meeting
          </option>

        </select>

      </div>


      <div className="crmInputGroup">

  <label>

    Lead Status

  </label>

  <select

    value={
followupData.lead_status
    }

    onChange={(e) =>

setFollowupData({

...followupData,

lead_status:
e.target.value

})

    }

  >

    <option value="new">

      New

    </option>

    <option value="connected">

      Connected

    </option>

    <option value="interested">

      Interested

    </option>

    <option value="proposal">

      Proposal

    </option>

    <option value="offered">

      Offered

    </option>

    <option value="meeting_scheduled">

      Meeting Scheduled

    </option>

    <option value="not_interested">

      Not Interested

    </option>

    <option value="converted">

      Converted

    </option>

    <option value="lost">

      Lost

    </option>

  </select>

</div>


     

      {/* Remarks */}
      <div className="crmInputGroup fullWidth">

        <label>

          Remarks

        </label>

        <textarea

          rows="4"

          placeholder="Write followup remarks..."

          value={
followupData.remarks
          }

          onChange={(e) =>

setFollowupData({

...followupData,

remarks:
e.target.value

})

          }

        />

      </div>

    </div>


    {/* Footer */}
    <div className="crmModalFooter">

      <button

        className="cancelButton"

        onClick={() =>
setShowFollowupModal(false)
        }

      >

        Cancel

      </button>

      <button

        className="saveButton"

        onClick={
handleFollowupSubmit
        }

      >

        Save Followup

      </button>

    </div>

  </div>

</div>


)
}

    </ManagerLayout>

  );

}