import api from "../../utils/api";

import {
  useState,
  useEffect,
} from "react";
import "../../styles/managerDashboard.css";

import EmployeeLayout from "../../layouts/EmployeeLayout";
import "../../styles/status.css";

import "../../styles/totallead.css";
import {useNavigate} from "react-router-dom";

import { Search, Plus, Eye, Pencil, CalendarClock,PhoneCall, MoreVertical, Briefcase, UserPlus, BadgeCheck, UserX } from "lucide-react";
import StatCard from "../../components/dashboard/StatCard";



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

  const [followupData,
    setFollowupData] =
    useState({

      followup_mode:
      "call",

      lead_status:
      "new",

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
    await  api.get(

`/leads/employee/${employeeId}`

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
  {/*}
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
  */}

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
      setShowFollowupModal(false);

      await fetchLeads();

      setFollowupData({

        followup_mode:
        "call",

        lead_status:
        "new",

        remarks:
        ""

      });
    }
    catch (error) {
      console.log(error);
      alert("Failed to submit follow-up");
      navigate("/employee/leads");
    }
  };
   

  // ==========================
  // Filter Leads
  // ==========================
  const filteredLeads =
allLeads.filter((lead) => {

  const searchText =
  search.toLowerCase();

  const matchesSearch =

    (lead.company_name || "")
      .toLowerCase()
      .includes(searchText)

    ||

    (lead.contact_person_name || "")
      .toLowerCase()
      .includes(searchText)

    ||

    (lead.designation || "")
      .toLowerCase()
      .includes(searchText)

    ||

    (lead.phone || "")
      .toString()
      .toLowerCase()
      .includes(searchText)

    ||

    (lead.email || "")
      .toLowerCase()
      .includes(searchText)

    ||

    (lead.source || "")
      .toLowerCase()
      .includes(searchText)

    ||

    (lead.lead_mode || "")
      .toLowerCase()
      .includes(searchText)

    ||

    (lead.lead_status || "")
      .toLowerCase()
      .includes(searchText)

    ||

    (lead.city || "")
      .toLowerCase()
      .includes(searchText)

    ||

    (lead.category || "" )
      .toLowerCase()
      .includes(searchText);

  const matchesStatus =

    statusFilter === "all"

    ||

    lead.lead_status.toLowerCase() ===
    statusFilter;

  return (
    matchesSearch &&
    matchesStatus
  );

});
  return (
    

    <EmployeeLayout>

      <div className="leads-container">

        <div className="manager-dashboard-grid">

    <StatCard
        title="My Leads"
        value={allLeads.length}
        subtitle="Total Assigned"
        color="blue"
        icon={<Briefcase size={24} />}
    />

    <StatCard
        title="New"
        value={
            allLeads.filter(
                lead => lead.lead_status === "new"
            ).length
        }
        subtitle="New Leads"
        color="green"
        icon={<UserPlus size={24} />}
    />

    <StatCard
        title="Follow-ups"
        value={
            allLeads.filter(lead =>
                ![
                    "new",
                    "converted",
                    "closed",
                    "not_interested"
                ].includes(lead.lead_status)
            ).length
        }
        subtitle="Pending Follow-ups"
        color="orange"
        icon={<CalendarClock size={24} />}
    />

    <StatCard
        title="Converted"
        value={
            allLeads.filter(
                lead => lead.lead_status === "converted"
            ).length
        }
        subtitle="Successfully Converted"
        color="blue"
        icon={<BadgeCheck size={24} />}
    />

    <StatCard
        title="Not Interested"
        value={
            allLeads.filter(
                lead => lead.lead_status === "not_interested"
            ).length
        }
        subtitle="Rejected Leads"
        color="red"
        icon={<UserX size={24} />}
    />

</div>
        <div className="leadToolbar">

  <div className="searchContainer">

    <Search
      size={18}
      className="searchIcon"
    />

    <input
      type="text"
      placeholder="Search company or contact..."
      className="leadSearchInput"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />

  </div>

  <select
    className="leadSelect"
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
  >
    <option value="all">All Status</option>
    <option value="new">New</option>
    <option value="interested">Interested</option>
    <option value="proposal">Proposal</option>
    <option value="converted">Converted</option>
    <option value="not_interested">Not Interested</option>
  </select>

  <button
    className="leadAddBtn"
    onClick={() => navigate("/employee/add-leads")}
  >
    <Plus size={20} strokeWidth={3} />
    <span>Add Lead</span>
  </button>

</div>       


        


        {/* Table */}
        <div className="leads-card tableWrapper overflow-hidden">

         
          <table className="w-full">


            {/* Table Header */}
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
                  Email
                </th>

                <th className="table-head">
                  Category
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

                      {lead.designation}
                    </td>


                    <td className="table-data">

                      {lead.phone}

                    </td>


                    <td className="table-data">

                      {lead.email}

                    </td>


                    <td className="table-data">

                      {lead.category || "N/A"}

                    </td>


                    <td className="table-data">

                      {lead.lead_mode}

                    </td>


                    <td className="table-data">
                      <span className={`status-badge ${lead.lead_status}`}>
                        {lead.lead_status.replace("_", " ")}
                      </span>
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

                                `/employee/lead/${lead.id}`

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
                                `/employee/edit-lead/${lead.id}`
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

                            


                            {/* Delete 
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

                            </button>*/}

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
     </div>
    </EmployeeLayout>

  );

}