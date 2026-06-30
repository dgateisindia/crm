import api from "../../utils/api";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import "../../styles/employeetaskfollowup.css";

import {
  CalendarClock,
  Clock,
  CheckCircle,
  PhoneCall,
  Eye,
  Pencil,
  Plus,
  MoreVertical
} from "lucide-react";

export default function EmployeeTaskFollowups() {

  const [followups,
  setFollowups] =
  useState([]);

      const navigate =
    useNavigate();

    const menuRef = useRef(null);

    const [

      openMenu,

      setOpenMenu

    ] = useState(null);

    const [

      selectedTask,

      setSelectedTask

    ] = useState(null);

    const [

      showTaskFollowupModal,

      setShowTaskFollowupModal

    ] = useState(false);

    const [

  followupDate,

  setFollowupDate

] = useState("");

const [

  followupTime,

  setFollowupTime

] = useState("");

const [

  remarks,

  setRemarks

] = useState("");

    const [

      showLeadFollowupModal,

      setShowLeadFollowupModal

    ] = useState(false);

    const [

  modalType,

  setModalType

] = useState("");

    const [

  leadFollowupData,

  setLeadFollowupData

] = useState({

  followup_mode: "call",

  lead_status: "connected",

  remarks: ""

});

  useEffect(() => {

    const fetchFollowups =
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

          `/tasks/followups/${employeeId}`

        );

        setFollowups(
          response.data
        );

      }

      catch (error) {

        console.log(error);

      }

    };

    fetchFollowups();

  }, []);
  useEffect(() => {

  const handleClickOutside = (event) => {

    if (

      menuRef.current &&

      !menuRef.current.contains(event.target)

    ) {

      setOpenMenu(null);

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

  const today =
  new Date()
  .toISOString()
  .split("T")[0];
  const handleAction = (

  item,

  action

) => {

  setOpenMenu(null);

  if (

    action === "view"

  ) {

    navigate(

      `/employee/lead/${item.lead_id}`,

      {

        state: {

          from:

          "/employee/task-followups"

        }

      }

    );

  }

  else if (

    action === "edit"

  ) {

    setSelectedTask(item);

     setFollowupDate(

            item.followup_date
            

          );

          setFollowupTime(

            item.followup_time

          );

          setRemarks(

            item.remarks || ""

          );

          setModalType("edit");

    setShowTaskFollowupModal(true);

  }

  else if (

    action === "task"

  ) {

    setSelectedTask(item);

      setFollowupDate("");

      setFollowupTime("");

      setRemarks("");

      setModalType("task");

    setShowTaskFollowupModal(true);

  }

  else if (

    action === "lead"

  ) {

    setSelectedTask(item);

    setShowLeadFollowupModal(true);

  }

};
const saveFollowup =
async () => {

  try {

    const user =
    JSON.parse(

      localStorage.getItem(
        "user"
      )

    );

    await  api.put(

  `/tasks/followups/edit/${selectedTask.lead_id}`,
      {

        employee_id:

        user?.employee_id ||

        user?.id,

        followup_date:

        followupDate,

        followup_time:

        followupTime,

        remarks

      }

    );

    setShowTaskFollowupModal(
      false
    );

    window.location.reload();

  }

  catch (error) {

    console.log(error);

  }

};
const saveLeadFollowup =
async () => {

  try {

    const user =
    JSON.parse(

      localStorage.getItem(
        "user"
      )

    );

    await  api.post(

      "/followups",

      {

        lead_id:

        selectedTask.lead_id,

        employee_id:

        user?.employee_id ||

        user?.id,

        ...leadFollowupData

      }

    );

    setShowLeadFollowupModal(
      false
    );

    window.location.reload();

  }

  catch (error) {

    console.log(error);

  }

};
const addNextTaskFollowup =
async () => {

  const user =
  JSON.parse(

    localStorage.getItem(
      "user"
    )

  );

  await  api.put(

    `/tasks/followups/add/${selectedTask.lead_id}`,

    {

      employee_id:

      user?.employee_id ||

      user?.id,

      followup_date:

      followupDate,

      followup_time:

      followupTime,

      remarks

    }
    

  );
  setShowTaskFollowupModal(false);

window.location.reload();

};

  return (

    <EmployeeLayout>

      {/* Header */}

      <div className="dashboard-header">

        <div>

          <h1 className="dashboard-title">
            Task Followups
          </h1>

          <p className="dashboard-subtitle">
            Manage scheduled callbacks and pending followups
          </p>

        </div>

      </div>

      {/* Cards */}

      <div className="dashboard-grid">

        <div className="crm-card blue-card">

          <div className="crm-card-top">

            <div className="icon-circle blue-bg">

              <CalendarClock
                size={18}
              />

            </div>

          </div>

          <h3>
            Total Followups
          </h3>

          <h2>
            {followups.length}
          </h2>

        </div>

        <div className="crm-card green-card">

          <div className="crm-card-top">

            <div className="icon-circle green-bg">

              <PhoneCall
                size={18}
              />

            </div>

          </div>

          <h3>
            Today's Followups
          </h3>

          <h2>

            {

              followups.filter(

                item =>

                item.followup_date
                ?.split("T")[0]
                === today

              ).length

            }

          </h2>

        </div>

        <div className="crm-card orange-card">

          <div className="crm-card-top">

            <div className="icon-circle orange-bg">

              <Clock
                size={18}
              />

            </div>

          </div>

          <h3>
            Upcoming
          </h3>

          <h2>

            {

              followups.filter(

                item =>

                item.followup_date
                ?.split("T")[0]
                > today

              ).length

            }

          </h2>

        </div>

        <div className="crm-card purple-card">

          <div className="crm-card-top">

            <div className="icon-circle purple-bg">

              <CheckCircle
                size={18}
              />

            </div>

          </div>

          <h3>
            Completed
          </h3>

          <h2>0</h2>

        </div>

      </div>

      {/* Filters */}

      <div className="recent-card">

        <div

          style={{

            display: "flex",

            gap: "15px",

            marginBottom:
            "20px",

            flexWrap:
            "wrap"

          }}

        >

          <input

            type="text"

            placeholder=
            "Search Company..."

            style={{

              padding:
              "10px",

              border:
              "1px solid #ddd",

              borderRadius:
              "8px",

              minWidth:
              "250px"

            }}

          />

          <select

            style={{

              padding:
              "10px",

              border:
              "1px solid #ddd",

              borderRadius:
              "8px"

            }}

          >

            <option>
              All
            </option>

            <option>
              Today
            </option>

            <option>
              Upcoming
            </option>

          </select>

        </div>

        {/* Table */}


          <table className="w-full">

            <thead>

              <tr>

                <th>
                  Company
                </th>

                <th>
                  Contact
                </th>

                <th>
                  Phone
                </th>

                <th>
                  Followup Date
                </th>

                <th>
                  Time
                </th>

                <th>
                  Remarks
                </th>

                <th>
                  Status
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {

                followups.length > 0

                ?

                (

                  followups.map(

                    (item) => (

                      <tr
                        key={
                          item.followup_id
                        }
                      >

                        <td>
                          {
                            item.company_name
                          }
                        </td>

                        <td>
                          {
                            item.contact_person_name
                          }
                        </td>

                        <td>
                          {
                            item.phone
                          }
                        </td>

                        <td>

                          {

                            new Date(

                              item.followup_date

                            )

                            .toLocaleDateString()

                          }

                        </td>

                        <td>
                          {
                            item.followup_time
                          }
                        </td>

                        <td>
                          {
                            item.remarks
                          }
                        </td>

                        <td>

                          <span
                            className=
                            "status-badge connected"
                          >

                            Followup

                          </span>

                        </td>
                        <td>

                          <div

                            className="relative"

                            ref={

                              openMenu === item.followup_id

                              ? menuRef

                              : null

                            }

                          >

                          <button

                            onClick={() =>

                              setOpenMenu(

                                openMenu ===

                                item.followup_id

                                ? null

                                : item.followup_id

                              )

                            }

                          >

                            <MoreVertical
                              size={18}
                            />

                          </button>

                          {

                            openMenu ===

                            item.followup_id && (

                              <div

                                className="taskActionMenu"

                              >

                                <button
                                  className="taskMenuItem taskView"
                                  onClick={() =>

                                    handleAction(

                                      item,

                                      "view"

                                    )

                                  }

                                >

                                  <Eye size={16} />

                                  View Task Followup

                                </button>

                                <button
                                className="taskMenuItem taskEdit"


                                  onClick={() =>

                                    handleAction(

                                      item,

                                      "edit"

                                    )

                                  }

                                >

                                  <Pencil size={16} />

                                  Edit Task Followup

                                </button>

                                <button
                                className="taskMenuItem taskFollowup"


                                  onClick={() =>

                                    handleAction(

                                      item,

                                      "task"

                                    )

                                  }

                                >

                                  <Plus size={16} />

                                  Add Task Followup

                                </button>

                                <button
                                className="taskMenuItem leadFollowup"

                                  onClick={() =>

                                    handleAction(

                                      item,

                                      "lead"

                                    )

                                  }

                                >

                                  <Plus size={16} />

                                  Add Lead Followup

                                </button>

                              </div>

                            )

                          }

                        </div>

                      </td>

                      </tr>

                    )

                  )

                )

                :

                (

                  <tr>

                    <td

                      colSpan="8"

                      style={{

                        textAlign:
                        "center",

                        padding:
                        "20px"

                      }}

                    >

                      No Followups Found

                    </td>

                  </tr>

                )

              }

            </tbody>

          </table>

        </div>

     
      {
showTaskFollowupModal && (

<div className="followup-modal-overlay">

  <div className="followup-modal">

    <h2>

  {

    modalType === "edit"

    ?

    "Edit Task Followup"

    :

    "Add Task Followup"

  }

</h2>

    <div className="followup-form-group">

      <label>
        Followup Date
      </label>

      <input

        type="date"

        value={followupDate}

        onChange={(e)=>

          setFollowupDate(
            e.target.value
          )

        }

      />

    </div>

    <div className="followup-form-group">

      <label>
        Followup Time
      </label>

      <input

        type="time"

        value={followupTime}

        onChange={(e)=>

          setFollowupTime(
            e.target.value
          )

        }

      />

    </div>

    <div className="followup-form-group">

      <label>
        Remarks
      </label>

      <textarea

        rows="4"

        value={remarks}

        onChange={(e)=>

          setRemarks(
            e.target.value
          )

        }

        placeholder="Enter remarks"

      />

    </div>

    <div className="followup-modal-actions">

      <button

        className="cancel-btn"

        onClick={() =>

          setShowTaskFollowupModal(
            false
          )

        }

      >

        Cancel

      </button>

      <button

        className="save-btn"

        onClick={() =>

  modalType === "edit"

  ?

  saveFollowup()

  :

  addNextTaskFollowup()

}

      >

        Save Followup

      </button>

    </div>

  </div>

</div>

)
}
{showLeadFollowupModal && (

<div className="crmModalOverlay">

  <div className="crmModalCard">

    {/* Header */}
    <div className="crmModalHeader">

      <div>

        <h2>

          Add Lead Followup

        </h2>

        <p>

          {selectedTask?.company_name}

        </p>

      </div>

      <button

        className="closeBtn"

        onClick={() =>
          setShowLeadFollowupModal(false)
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
            leadFollowupData.followup_mode
          }

          onChange={(e) =>

            setLeadFollowupData({

              ...leadFollowupData,

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


      {/* Lead Status */}
      <div className="crmInputGroup">

        <label>

          Lead Status

        </label>

        <select

          value={
            leadFollowupData.lead_status
          }

          onChange={(e) =>

            setLeadFollowupData({

              ...leadFollowupData,

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
            leadFollowupData.remarks
          }

          onChange={(e) =>

            setLeadFollowupData({

              ...leadFollowupData,

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
          setShowLeadFollowupModal(false)
        }

      >

        Cancel

      </button>

      <button

        className="saveButton"

        onClick={
          saveLeadFollowup
        }

      >

        Save Followup

      </button>

    </div>

  </div>

</div>

)}
        



    </EmployeeLayout>

  );

}