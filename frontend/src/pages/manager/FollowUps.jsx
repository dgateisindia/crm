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

import ManagerLayout from "../../layouts/ManagerLayout";
import React from "react";
import "../../styles/leads.css";
import "../../styles/totallead.css";
import "../../styles/status.css";
import { useRef } from "react";
export default function FollowUps() {

  const [
    followups,
    setFollowups
  ] = useState([]);

  const historyRef = useRef(null);

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

const openFollowupModal =
(item) => {

  setSelectedLead(item);

  setShowFollowupModal(true);

};
const handleFollowupSubmit = async () => {

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

  if (expandedLead === leadId) {

    setExpandedLead(null);
    return;

  }

  try {

    const response =
      await  api.get(
        `/followups/lead-history/${leadId}`
      );

    setHistory({
      ...history,
      [leadId]: response.data
    });

    setExpandedLead(leadId);

  } catch (error) {

    console.log(error);

  }

};


  useEffect(() => {

    const loadFollowups =
    async () => {

      await fetchFollowups();

    };

    loadFollowups();

  }, []);
  useEffect(() => {

  const handleClickOutside = (event) => {

    if (
      historyRef.current &&
      !historyRef.current.contains(event.target)
    ) {
      setExpandedLead(null);
    }

  };

  document.addEventListener(
    "mousedown",
    handleClickOutside
  );

  return () => {

    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );

  };

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
        <div className="leads-card tableWrapper">

          <table className="w-full">

            {/* Table Header */}
            <thead>

              <tr className="border-b">

                <th className="table-head">

                  Company

                </th>

                <th className="table-head">

                  Employee

                </th>

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

            followups.length > 0

            ? (

            followups.map(

            (item) => (
              <React.Fragment key={item.lead_id}>

            <tr

            key={
            item.followup_id
            }

            className="table-row"

            >

              {/* Company */}
              <td className="table-data">

                {
            item.company_name
                }

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
      className={`followupStatus ${item.lead_status}`}
    >

      {

      item.lead_status
      ?.replace(
      "_",
      " "
      )

      }

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
      className="action-menu-btn"
      onClick={() => toggleMenu(item.lead_id)}
    >
      <MoreVertical size={18} />
    </button>

    {openMenu === item.lead_id && (

      <div
        ref={menuRef}
        className="action-dropdown"
      >

        <div
          className="action-item"
          onClick={() => {

            toggleHistory(item.lead_id);

            setOpenMenu(null);

          }}
        >
          <Eye size={16} />
          View History
        </div>

        <div
          className="action-item"
          onClick={() => {

            openFollowupModal(item);

            setOpenMenu(null);

          }}
        >
          <PhoneCall size={16} />
          Add Followup
        </div>

      </div>

    )}

  </div>

</td>

</tr>

{
expandedLead === item.lead_id && (

<tr>

<td colSpan="6">

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
                {
                  record.lead_status
                }
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

<td colSpan="5"className="text-center p-6 text-gray-500">

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
showFollowupModal && (

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
        ✕
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
            proposed
          </option>

          <option value="offered">
            Offered
          </option>

          <option value="meeting scheduled">
            Meeting Scheduled
          </option>

          <option value="not_interested">
            Not Interested
          </option>

          <option value="converted">
            Converted
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

    </ManagerLayout>

  );

}