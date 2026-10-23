import "../../styles/managerHistoryResponsive.css";
import FloatingActionMenu from "../../components/common/FloatingActionMenu";
import { useSubscription } from "../../context/SubscriptionContext";
import api from "../../utils/api";

import {
  useEffect,
  useState
} from "react";

import {
  MoreVertical,
  Eye,
 // Pencil,
  PhoneCall
 
} from "lucide-react";
import useActionMenu from "../../hooks/useActionMenu";
import {normalizeStatus,formatStatus} from "../../utils/statusUtils";
import { STATUS_THEME, getStatusTheme } from "../../utils/statusTheme";
import ManagerLayout from "../../layouts/ManagerLayout";
import React from "react";
import "../../styles/leads.css";
import "../../styles/totallead.css";
import "../../styles/status.css";
import { useRef } from "react";
export default function FollowUps() {
  const { canWrite = false } = useSubscription() || {};


  const [
    followups,
    setFollowups
  ] = useState([]);

  const historyRef = useRef(null);
const [leadHistorySearch, setLeadHistorySearch] = useState("");

const filteredFollowups = followups.filter((item) => {
  const search = leadHistorySearch.trim().toLowerCase();

  if (!search) return true;

  return Object.values(item).some((value) =>
    value !== null &&
    value !== undefined &&
    String(value).toLowerCase().includes(search)
  );
});


  const [expandedLead, setExpandedLead] = useState(null);
  const [history, setHistory] = useState({});
  const [
  selectedLead,
  setSelectedLead
] = useState(null);
const {
  openMenu,
  toggleMenu,
  menuRef,
  menuAnchor,
  setOpenMenu
} = useActionMenu();

const [
  showFollowupModal,
  setShowFollowupModal
] = useState(false);

const [followupData, setFollowupData] = useState({
  followup_mode: "",
  lead_status: "",
  remarks: ""
});

const [historyDialog, setHistoryDialog] = useState(null);
const [historyLoading, setHistoryLoading] = useState(false);
const [historyError, setHistoryError] = useState("");

const openHistoryDialog = async (leadId) => {
  if (leadId === null || leadId === undefined) {
    alert("This follow-up has no lead ID.");
    return;
  }

  setHistoryDialog({ leadId, records: [] });
  setHistoryLoading(true);
  setHistoryError("");

  try {
    const response = await api.get(
      `/followups/lead-history/${leadId}`
    );

    const records = Array.isArray(response.data)
      ? response.data
      : response.data?.data;

    if (!Array.isArray(records)) {
      throw new Error("Unexpected history response");
    }

    setHistoryDialog((current) =>
      current?.leadId === leadId
        ? { leadId, records }
        : current
    );
  } catch (error) {
    console.error("VIEW HISTORY ERROR:", error);
    setHistoryError(
      error.response?.data?.message ||
      error.message ||
      "Could not load history"
    );
  } finally {
    setHistoryLoading(false);
  }
};
const getLeadDisplayName = (lead) => {
  const usable = (value) => {
    const text = String(value ?? "").trim();

    return (
      text !== "" &&
      text !== "." &&
      text.toUpperCase() !== "N/A" &&
      text.toUpperCase() !== "NULL"
    );
  };

  if (usable(lead.company_name)) {
    return lead.company_name;
  }

  if (usable(lead.contact_person_name)) {
    return lead.contact_person_name;
  }

  return "Company name unavailable";
};
const openFollowupModal =
(item) => {
    if (!canWrite) return;


  setSelectedLead(item);

  setShowFollowupModal(true);

};
const handleFollowupSubmit = async () => {
    if (!canWrite) return;


  try {

    const user = JSON.parse(
      localStorage.getItem("user")
    );

    await  api.post(

      "/followups/add",

      {

        lead_id: selectedLead.lead_id,

        employee_id:
          user?.employee_id ||
          user?.id,

        followup_mode:
          followupData.followup_mode,

        lead_status:
          followupData.lead_status,

        remarks:
          followupData.remarks

      }

    );

    alert(
      "Followup Added Successfully"
    );

    setShowFollowupModal(false);
    setExpandedLead(null);

    fetchFollowups();

  }

  catch (error) {

    console.log(error);

    alert(
      "Failed to add followup"
    );

  }

};
  // ==========================
  // Fetch Followups
  // ==========================
  const fetchFollowups =
  async () => {

    try {

      const response =
      await  api.get(

"/followups/all"

      );

      setFollowups(
        response.data
      );

    }

    catch (error) {

      console.log(error);

      alert(
"Failed to fetch followups"
      );

    }

  };
  const toggleHistory = async (leadId) => {
    if (!leadId) {
      alert("Lead ID is missing.");
      return;
    }

    if (expandedLead === leadId) {
      setExpandedLead(null);
      return;
    }

    try {
      const response = await api.get(
        `/followups/lead-history/${leadId}`
      );

      const records = Array.isArray(response.data)
        ? response.data
        : response.data?.data;

      if (!Array.isArray(records)) {
        throw new Error("Unexpected history API response");
      }

      setHistory(prev => ({
        ...prev,
        [leadId]: records
      }));

      setExpandedLead(leadId);
    } catch (error) {
      console.error("VIEW HISTORY ERROR:", error);
      alert(
        error.response?.data?.message ||
        error.message ||
        "Unable to load follow-up history"
      );
    }
  };


  useEffect(() => {

    const loadFollowups =
    async () => {

      await fetchFollowups();

    };

    loadFollowups();

  }, []);
  


  return (

    <ManagerLayout>

      <div className="leads-container">

        {/* Header */}
        <div className="mb-6">

          <h1 className="leads-header-title">

            Follow Ups

          </h1>

          <p className="leads-header-subtitle">

            Manage all CRM followups

          </p>

        </div>
       


        {/* Table */}
        <div style={{
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 18
}}>
  <input
    type="search"
    placeholder="Search company, phone, email, category, lead ID, employee..."
    value={leadHistorySearch}
    onChange={(e) => setLeadHistorySearch(e.target.value)}
    aria-label="Search lead history"
    style={{
      flex: "1 1 320px",
      minWidth: 230,
      maxWidth: 620,
      padding: "12px 16px",
      border: "1px solid #d8deea",
      borderRadius: 10,
      background: "#fff",
      color: "#17233d",
      outlineColor: "#6948DB"
    }}
  />
  <span style={{ color: "#64748b", fontSize: 13 }}>
    Showing {filteredFollowups.length} of {followups.length} leads
  </span>
</div>
<div className="leads-card tableWrapper dg-history-responsive" style={{ overflowX: "auto" }}>

          <table className="w-full" style={{ minWidth: 1450 }}>

            {/* Table Header */}
            <thead>

              <tr className="border-b">

                <th className="table-head">

                  Company

                </th>

                <th className="table-head">Phone</th>
<th className="table-head">Email</th>
<th className="table-head">Category</th>
<th className="table-head">Employee</th>

                <th className="table-head">

                  Mode

                </th>

                <th className="table-head">

                  Remarks

                </th>

                <th className="table-head">

                  Lead Status

                </th>

                <th className="table-head">
                  Action
                </th>

              </tr>

            </thead>


            {/* Table Body */}
            <tbody>

              {

            filteredFollowups.length > 0

            ? (

            filteredFollowups.map(

            (item) => (
              <React.Fragment key={item.latest_followup}>

            <tr

            className="table-row"

            >

              {/* Company */}
              <td className="table-data">

                <div>{getLeadDisplayName(item)}</div>
<div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
  Lead #{item.lead_id}
</div>

              </td>


              <td className="table-data">
  {item.phone || "â€”"}
</td>

<td className="table-data">
  {item.email || "â€”"}
</td>

<td className="table-data">
  {item.category || "â€”"}
</td>
{/* Employee */}
              <td className="table-data">

                {

            item.full_name ||

            "N/A"

                }

              </td>


              {/* Mode */}
              <td className="table-data">

                {
            item.followup_mode
                }

              </td>


              {/* Remarks */}
              <td className="table-data">

                {

            item.remarks ||

            "No remarks"

                }

              </td>


  {/* Lead Status */}
  <td className="table-data">

    <span
  className="status-badge"
  style={{
    backgroundColor: getStatusTheme(item.lead_status).bg,
    color: getStatusTheme(item.lead_status).color,
  }}
>
  {formatStatus(item.lead_status)}
</span>

  </td>
 <td
  className="table-data"
  style={{
    position: "relative",
    overflow: "visible",
  }}
>

  <div className="action-menu-container">

    <button
      className="action-menu-btn crm-action-trigger"
      onClick={(event) => toggleMenu(item.latest_followup, event)}
    >
      <MoreVertical size={18} />
    </button>

    {openMenu === item.latest_followup && (

      <FloatingActionMenu menuRef={menuRef} anchor={menuAnchor}>

        <div
          className="action-item"
          onClick={() => {

            openHistoryDialog(item.lead_id);

            setOpenMenu(null);

          }}
        >
          <Eye size={16} />
          View History
        </div>
{canWrite && (

        <div
          className="action-item"
          onClick={() => {

            openFollowupModal(item);

            setOpenMenu(null);

          }}
        >
          <PhoneCall size={16} />
          Add Followup
        </div>)}


      </FloatingActionMenu>

    )}

  </div>

</td>

</tr>

{
expandedLead === item.lead_id && (

<tr>

<td colSpan="9">

  <div className="history-box" ref={historyRef}>

    <h3>
      Followup History
    </h3>

    <table className="w-full">

      <thead>

        <tr>

          <th>Date</th>

          <th>Mode</th>

          <th>Status</th>

          <th>Remarks</th>

        </tr>

      </thead>

      <tbody>

        {
          history[item.lead_id]
          ?.map((record) => (

            <tr
              key={record.followup_id}
            >

              <td>
                {
                  new Date(
                    record.created_at
                  ).toLocaleDateString()
                }
              </td>

              <td>
                {
                  record.followup_mode
                }
              </td>

              <td>

                <span
                  className="status-badge"
                  style={{
                    background:
                      STATUS_THEME[
                        normalizeStatus(record.lead_status)
                      ]?.bg,

                    color:
                      STATUS_THEME[
                        normalizeStatus(record.lead_status)
                      ]?.color,
                  }}
                >
                  {formatStatus(record.lead_status)}
                </span>

              </td>

              <td>
                {
                  record.remarks ||
                  "No Remarks"
                }
              </td>

            </tr>

          ))
        }

      </tbody>

    </table>

  </div>

</td>

</tr>

)
}

</React.Fragment>

)

)

)

: (

<tr>

<td colSpan="9"className="text-center p-6 text-gray-500">

No Followups Found

</td>

</tr>

)

}

            </tbody>

          </table>

        </div>

      </div>
      {
showFollowupModal && canWrite && (

<div className="crmModalOverlay">

  <div className="crmModalCard">

    <div className="crmModalHeader">

      <h2>
        Add Followup
      </h2>

      <button
        className="closeBtn"
        onClick={() =>
          setShowFollowupModal(false)
        }
      >
        ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢
      </button>

    </div>

    <div className="crmModalForm">

      <div className="crmInputGroup">

        <label>
          Followup Mode
        </label>

        <select

          value={
            followupData.followup_mode
          }

          onChange={(e)=>

            setFollowupData({

              ...followupData,

              followup_mode:
              e.target.value

            })

          }

        >
          <option value="">
            Select Followup Mode
          </option>

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

          onChange={(e)=>

            setFollowupData({

              ...followupData,

              lead_status:
              e.target.value

            })

          }

        >

          <option value="">
            Select Lead Status
          </option>

          <option value="interested">
            Interested
          </option>

          <option value="proposed">
            Proposed
          </option>

          <option value="offered">
            Offered
          </option>

          <option value="meeting_scheduled">
            Meeting Scheduled
          </option>

          <option value="not interested">
            Not Interested
          </option>

          <option value="converted">
            Converted
          </option>


          <option value="sponsorship">
            Sponsorship
          </option>
          
          <option value="invalid">
            Invalid
          </option>

          <option value="not responded">
            Not Responded 
          </option>

        </select>

      </div>

      <div className="crmInputGroup fullWidth">

        <label>
          Remarks
        </label>

        <textarea

          rows="4"

          value={
            followupData.remarks
          }

          onChange={(e)=>

            setFollowupData({

              ...followupData,

              remarks:
              e.target.value

            })

          }

        />

      </div>

    </div>

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

    {historyDialog && (
  <div
    className="crmModalOverlay"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) {
        setHistoryDialog(null);
      }
    }}
  >
    <div className="crmModalCard" style={{ maxWidth: 850, width: "95%" }}>
      <div className="crmModalHeader">
        <h2>Follow-up History ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Lead #{historyDialog.leadId}</h2>
        <button
          type="button"
          className="closeBtn"
          onClick={() => setHistoryDialog(null)}
        >
          Close
        </button>
      </div>

      <div style={{ maxHeight: "60vh", overflow: "auto", padding: 20 }}>
        {historyLoading ? (
          <p>Loading history...</p>
        ) : historyError ? (
          <p role="alert" style={{ color: "#c62828" }}>{historyError}</p>
        ) : historyDialog.records.length === 0 ? (
          <p>No follow-up history found.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {historyDialog.records.map((record) => (
                <tr key={record.followup_id}>
                  <td>{record.contact_date
                    ? new Date(record.contact_date).toLocaleString()
                    : record.created_at
                    ? new Date(record.created_at).toLocaleString()
                    : "N/A"}</td>
                  <td>{record.followup_mode || "N/A"}</td>
                  <td>{formatStatus(record.lead_status || record.status)}</td>
                  <td>{record.remarks || "No remarks"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </div>
)}
</ManagerLayout>

  );

}