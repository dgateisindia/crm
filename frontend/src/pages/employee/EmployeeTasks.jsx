import api from "../../utils/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import "../../styles/employeetasks.css";
import "../../styles/employeetaskfollowup.css";
import useActionMenu from "../../hooks/useActionMenu";
import {
  //CalendarClock,
  //Clock,
 // CheckCircle,
 // PhoneCall,
  MoreVertical,
  Eye,
  SquarePen,
  CalendarPlus,
  MessageSquarePlus
} from "lucide-react";
import "../../styles/status.css";

export default function EmployeeTasks() {

      const [tasks, setTasks] = useState([]);

      const [showFollowupModal,
          setShowFollowupModal] =
          useState(false);

      const [
        showLeadFollowupModal,
        setShowLeadFollowupModal
      ] = useState(false);

      const [selectedTask,
      setSelectedTask] =
      useState(null);

      const [followupDate,
      setFollowupDate] =
      useState("");

      const [followupTime,
      setFollowupTime] =
      useState("");

      const [remarks,
      setRemarks] =
      useState("");

      

      const {
      openMenu,
      toggleMenu,
      menuRef,
      setOpenMenu
  } = useActionMenu();
      

      const navigate = useNavigate();

        const [
          leadFollowupData,
          setLeadFollowupData
        ] = useState({

          followup_mode: "",

          lead_status: "",

          remarks: ""

        });


  const handleTaskAction =
    async (
      task,
      action
    ) => {
      setOpenMenu(null);

      if (!action) return;

      try {
        if (action === "view") {

          navigate(
            `/employee/lead/${task.id}`,
            {
              state:{
                from:"/employee/tasks"
              }
          
            }
          );
        }
        else if (action === "edit") {

          navigate(
              `/employee/edit-lead/${task.id}?from=tasks`
            );
        }
        else if (action === "followup") {

          setSelectedTask(task);

          setShowFollowupModal(true);

        }

      else if (action === "lead_followup") {

    setSelectedTask(task);

    setLeadFollowupData({
        followup_mode:  "",
        lead_status: "",
        remarks: ""
    });

    setShowLeadFollowupModal(true);

}
              }

      catch (error) {

        console.log(error);

        alert(
          "Failed to update task"
        );

      }

    };
const saveFollowup =
async () => {

  const user = JSON.parse(
  localStorage.getItem("user")
);

  try {

    await  api.post(

      "/tasks/followup",

      {

        lead_id:
        selectedTask.id,

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

    alert(
      "Followup Scheduled"
    );

    setTasks(

      tasks.filter(

        task =>

        task.id !==
        selectedTask.id

      )

    );

    setShowFollowupModal(
      false
    );

    setFollowupDate("");

    setFollowupTime("");

    setRemarks("");

  }

  catch (error) {

    console.log(error);

  }

};


  useEffect(() => {

    const fetchTasks = async () => {

      try {

        const user = JSON.parse(
          localStorage.getItem("user")
        );

        const employeeId =
          user?.employee_id ||
          user?.id;

        const response =
          await  api.get(
            `/tasks/employee/${employeeId}`
          );

        setTasks(response.data);

      }

      catch (error) {

        console.log(error);

      }

    };

    fetchTasks();

  }, []);
  const saveLeadFollowup =
async () => {

  try {

    const user =
    JSON.parse(
      localStorage.getItem("user")
    );

    await  api.post(

      "/followups/add",

      {

        lead_id:
        selectedTask.id,

        employee_id:
        user?.employee_id ||
        user?.id,

        ...leadFollowupData

      }

    );

    alert(
      "Lead Followup Added"
    );

    setTasks(

      tasks.filter(

        task =>

        task.id !==
        selectedTask.id

      )

    );

    setShowLeadFollowupModal(
      false
    );

    setLeadFollowupData({

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

    alert(
      "Failed to save followup"
    );

  }

};
  
  

  return (

    <EmployeeLayout>

      <div className="dashboard-header">

        <div>

          <h1 className="dashboard-title">
            Tasks
          </h1>

          <p className="dashboard-subtitle">
            Manage scheduled callbacks and pending followups
          </p>

        </div>

        <button
          className="add-lead-btn"
          onClick={() =>
            navigate("/employee/add-leads")
          }
        >
          + Add Task
        </button>

      </div>

      {/* Cards 

      <div className="dashboard-grid">

        <div className="crm-card blue-card">

          <div className="crm-card-top">

            <div className="icon-circle blue-bg">
              <CalendarClock size={18} />
            </div>

          </div>

          <h3>Total Tasks</h3>

          <h2>{tasks.length}</h2>

        </div>

        <div className="crm-card green-card">

          <div className="crm-card-top">

            <div className="icon-circle green-bg">
              <PhoneCall size={18} />
            </div>

          </div>

          <h3>New</h3>

          <h2>
            {
              tasks.filter(
                task =>
                  task.lead_status ===
                  "new"
              ).length
            }
          </h2>

        </div>

        <div className="crm-card orange-card">

          <div className="crm-card-top">

            <div className="icon-circle orange-bg">
              <Clock size={18} />
            </div>

          </div>

          <h3> Task Followups</h3>

          <h2>
          0
          </h2>

        </div>

        <div className="crm-card purple-card">

          <div className="crm-card-top">

            <div className="icon-circle purple-bg">
              <CheckCircle size={18} />
            </div>

          </div>

          <h3>Completed</h3>

          <h2>
            {
              tasks.filter(
                task =>
                  task.lead_status ===
                  "converted"
              ).length
            }
          </h2>

        </div>

      </div>
      */}

      {/* Table */}

      <div className="recent-card">


          <table className="w-full">

            <thead>

              <tr>

                <th>Company</th>

                <th>Contact</th>

                <th>Phone</th>

                <th>Status</th>

                <th>Created</th>

                <th>Action</th>

              </tr>

            </thead>

            <tbody>

              {
                tasks.length > 0
                ? (

                  tasks.map(task => (

                    <tr
                      key={task.id}
                    >

                      <td>
                        {task.company_name}
                      </td>

                      <td>
                        {
                          task.contact_person_name
                        }
                      </td>

                      <td>
                        {task.phone}
                      </td>

                      <td>

                        <span
                          className={`status-badge ${task.lead_status}`}
                        >

                          {
                            task.lead_status
                          }

                        </span>

                      </td>

                      <td>

                        {
                          new Date(
                            task.created_at
                          ).toLocaleDateString()
                        }

                      </td>
                      <td>

                     <div className="action-menu-container">

                      <button
                            className="action-menu-btn"
                            onClick={() => toggleMenu(task.id)}
                        >

                        <MoreVertical
                          size={18}
                        />

                      </button>

                      {

                        openMenu ===
                        task.id && (

                                <div
                                    ref={menuRef}
                                    className="action-dropdown"
                                >                            
                                <div
                              onClick={() =>{
                                handleTaskAction(task, "view");
                                setOpenMenu(null);

                              }}
                              className="action-item"
                            >
                              <Eye size={16} />
                              View New Lead
                            </div>

                            <div
                                            onClick={() =>{
                                handleTaskAction(task, "edit");
                                setOpenMenu(null);

                              }}
                              className="action-item"
                            >
                              <SquarePen size={16} />
                              Edit New Lead
                            </div>

                            <div
                                            onClick={() =>{
                                handleTaskAction(task, "followup");
                                setOpenMenu(null);

                              }}
                              className="action-item"
                            >
                              <CalendarPlus size={16} />
                              Add TO-Do List
                            </div>

                            <div
                                            onClick={() =>{
                                handleTaskAction(task, "lead_followup");
                                setOpenMenu(null);

                              }}
                              className="action-item"
                            >
                              <MessageSquarePlus size={16} />
                              Add Lead Followup
                            </div>

                          </div>

                        )

                      }

                    </div>
                      </td>

                    </tr>

                  ))

                )

                : (

                  <tr>

                    <td
                      colSpan="6"
                      style={{
                        textAlign:
                        "center",
                        padding:
                        "20px"
                      }}
                    >

                      No Tasks Found

                    </td>

                  </tr>

                )

              }

            </tbody>

          </table>

        </div>

     
      {
showFollowupModal && (

<div className="followup-modal-overlay">

  <div className="followup-modal">

    <h2>
      Schedule Followup
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

          setShowFollowupModal(
            false
          )

        }

      >

        Cancel

      </button>

      <button

        className="save-btn"

        onClick={
          saveFollowup
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

          <option value="not_interested">
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