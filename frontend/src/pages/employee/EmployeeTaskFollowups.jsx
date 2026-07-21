import api from "../../utils/api";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import "../../styles/employeetaskfollowup.css";
import "../../styles/status.css";

import {
  //CalendarClock,
  //Clock,
 // CheckCircle,
 // PhoneCall,
 Search,
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
    const [search, setSearch] = useState("");

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

  followup_mode: "",

  lead_status: "",

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

      "/followups/add",

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
const filteredFollowups = followups
  .filter((item) => {

    const searchText = search.toLowerCase();

    return (
      (item.company_name || "")
        .toLowerCase()
        .includes(searchText) ||

      (item.followup_mode || "")
        .toLowerCase()
        .includes(searchText) ||

      (item.lead_status || "")
        .toLowerCase()
        .includes(searchText) ||

      (item.remarks || "")
        .toLowerCase()
        .includes(searchText)
    );

  })
  .sort((a, b) => {

    const dateA = new Date(
      `${a.followup_date} ${a.followup_time || "00:00:00"}`
    );

    const dateB = new Date(
      `${b.followup_date} ${b.followup_time || "00:00:00"}`
    );

    return dateA - dateB;

  });
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

  

      
      {/* Filters */}

      <div className="recent-card">

        <div className="leadToolbar">

            <div className="searchContainer">

              <Search
                size={18}
                className="searchIcon"
              />

              <input
                type="text"
                placeholder="Search Company..."
                className="leadSearchInput"
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
              />

            </div>

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

                filteredFollowups.length > 0

                ?

                (

                 filteredFollowups.map(

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
                            "status-badge new"
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

                                  View To-Do List

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

                                  Edit To-Do List

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

                                  Add To-Do List

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
    min={new Date().toISOString().split("T")[0]}
    onChange={(e)=>setFollowupDate(e.target.value)}
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
          <option value="">
            Select Lead Status
          </option>

          <option value="new">
            New
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

          <option value="meeting scheduled">
            meeting scheduled
          </option>

          <option value="not interested">
            Not Interested
          </option>

          <option value="converted">
            Converted
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