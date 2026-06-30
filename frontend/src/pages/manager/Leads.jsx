import api from "../../utils/api";

import {
  useState,
  useEffect,
} from "react";

import ManagerLayout from "../../layouts/ManagerLayout";

import "../../styles/totallead.css";
import {useNavigate} from "react-router-dom";

import {

Search,
Eye,
Pencil,
PhoneCall,
Trash2,
MoreVertical,
Briefcase,
UserPlus,
BadgeCheck,
UserX,
Plus
}
from "lucide-react";


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
    const [openMenu, setOpenMenu] = useState(null);

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
      await  api.get(
        "/leads/all"
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

      await  api.delete(

        `/leads/delete/${id}`

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
      await  api.post(
        "/followups/add",
        {
          lead_id: selectedLead.id,
          employee_id:
          user?.employee_id
          || user?.id,
          ...followupData
        }
      );
      alert("Follow-up added successfully");
      await fetchLeads();
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
      setShowFollowupModal(false);
      await fetchLeads();
      setFollowupData({

          followup_mode:
          "call",
          lead_status:
          "connected",
          remarks: ""
      });
    }
  };
   

  // ==========================
  // Filter Leads
  // ==========================
  const filteredLeads =

    allLeads.filter((lead) => {

    const searchText =
    search
    .trim()
    .toLowerCase();

    const matchesSearch =

    lead.company_name
    ?.toLowerCase()
    .includes(searchText)

    ||

    lead.contact_person_name
    ?.toLowerCase()
    .includes(searchText)

    ||

    lead.phone
    ?.toString()
    .includes(searchText)

    ||

    lead.email
    ?.toLowerCase()
    .includes(searchText)

    ||

    lead.city
    ?.toLowerCase()
    .includes(searchText)

    ||

    lead.source
    ?.toLowerCase()
    .includes(searchText)

    ||

    lead.lead_mode
    ?.toLowerCase()
    .includes(searchText)

    ||

    lead.lead_status
    ?.toLowerCase()
    .includes(searchText)

    ||

    lead.designation
    ?.toLowerCase()
    .includes(searchText)

    ||

    lead.full_name
    ?.toLowerCase()
    .includes(searchText);


    const matchesStatus =

    statusFilter === "all"

    ||

    lead.lead_status === statusFilter;

    return (
    matchesSearch &&
    matchesStatus
    );

    });;


  return (

    <ManagerLayout>

      <div className="leads-container">

        {/* Header */}
        <div className="leadsHeader">

          <div>

            <h1 className="leads-header-title">

              Leads

            </h1>

            <p className="leads-header-subtitle">

              View and manage all CRM leads

            </p>

          </div>

        </div>
        {/* Top Cards */}
<div className="dashboard-grid">

  <div className="crm-card blue-card">

    <div className="crm-card-top">

      <div className="icon-circle blue-bg">

        <Briefcase size={18} />

      </div>

    </div>

    <h3>Total Leads</h3>

    <h2>
      {allLeads.length}
    </h2>

  </div>


  <div className="crm-card green-card">

    <div className="crm-card-top">

      <div className="icon-circle green-bg">

        <UserPlus size={18} />

      </div>

    </div>

    <h3>New Leads</h3>

    <h2>

      {

allLeads.filter(
lead =>
lead.lead_status ===
"new"
).length

      }

    </h2>

  </div>


  <div className="crm-card purple-card">

    <div className="crm-card-top">

      <div className="icon-circle purple-bg">

        <BadgeCheck size={18} />

      </div>

    </div>

    <h3>Converted</h3>

    <h2>

      {

allLeads.filter(
lead =>
lead.lead_status ===
"converted"
).length

      }

    </h2>

  </div>


  <div className="crm-card orange-card">

    <div className="crm-card-top">

      <div className="icon-circle orange-bg">

        <UserX size={18} />

      </div>

    </div>

    <h3>Not Interested</h3>

    <h2>

            {

      allLeads.filter(
      lead =>
      lead.lead_status ===
      "not_interested"
      ).length

            }

          </h2>

        </div>

      </div>
          {/* Toolbar */}
          <div className="leadToolbar">

            {/* Search */}
            <div className="searchContainer">

              <Search
                size={18}
                className="searchIcon"
              />

              <input
                type="text"
                placeholder="Search by company, contact, phone..."
                className="leadSearchInput"
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
              className="leadSelect"
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

            </select>


            {/* Add Lead */}
            <button
              className="leadAddBtn"
              onClick={() => navigate("/manager/add-leads")}
            >
              <Plus size={20} strokeWidth={3} />
              <span>Add Lead</span>
            </button>

          </div>
         
        </div>

        {/* Table */}
        <div className="leads-card tableWrapper">

         
            <table className="w-full">


            {/* Table Header */}
            <thead className="sticky top-0 bg-white z-10 shadow-sm">

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

                <th className="table-head">
                  Created By
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

                  {

              lead.designation ||

              "N/A"

                  }

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
                  <span className={`status-badge ${lead.lead_status}`}>
                    {lead.lead_status.replaceAll("_", " ")}
                  </span>
                </td>

                <td className="table-data">

                  {lead.created_by_name}

                  <br />


                </td>


                <td
                      className="p-4"
                      style={{
                          position: "relative",
                          overflow: "visible"
                      }}
                  >

                  <div className="dropdownMenu">

                    <button
                        className="actionBtn"
                        onClick={() =>
                            setOpenMenu(
                                openMenu === lead.id
                                    ? null
                                    : lead.id
                            )
                        }
                    >

                        <MoreVertical size={20} />

                    </button>

                    {

                    openMenu === lead.id && (

                        <div className="actionMenu">

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

                        <Pencil
                          size={16}
                        />

                        Edit Lead

                      </button>


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

                      )

                      }

                  </div>

                </td>

              </tr>

              ))

              ) : (

              <tr>

              <td

              colSpan="10"

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