import axios from "axios";
import { useState, useEffect } from "react";

import EmployeeLayout from "../../layouts/EmployeeLayout";
import "../../styles/employeetasks.css";
import {
  CalendarClock,
  Clock,
  CheckCircle,
  PhoneCall,
  MoreVertical
} from "lucide-react";

export default function EmployeeTaskFollowups() {

  const [tasks, setTasks] = useState([]);

  const [showFollowupModal,
      setShowFollowupModal] =
      useState(false);

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

      const [openMenu,
      setOpenMenu] =
      useState(null);

  const handleTaskAction =
    async (
      task,
      action
    ) => {

      if (!action) return;

      try {

        if (
          action ===
          "connected"
        ) {

          await axios.put(
            `http://localhost:5000/api/tasks/connect/${task.task_id}`
          );

          alert(
            "Task moved to Leads"
          );

        }
        else if (
          action === "followup"
        ) {

          setSelectedTask(
            task
          );

          setShowFollowupModal(
            true
          );

        }

        else if (
          action ===
          "not_interested"
        ) {

          await axios.put(
            `http://localhost:5000/api/tasks/not-interested/${task.task_id}`
          );

          alert(
            "Task moved to Not Interested"
          );

        }

        setTasks(

          tasks.filter(
            t =>
            t.task_id !==
            task.task_id
          )

        );

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

  try {

    await axios.post(

      "http://localhost:5000/api/tasks/followup",

      {

        task_id:
        selectedTask.task_id,

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

        task.task_id !==
        selectedTask.task_id

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
          await axios.get(
            `http://localhost:5000/api/tasks/employee/${employeeId}`
          );

        setTasks(response.data);

      }

      catch (error) {

        console.log(error);

      }

    };

    fetchTasks();

  }, []);
  

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

      </div>

      {/* Cards */}

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

          <h3>Pending</h3>

          <h2>
            {
              tasks.filter(
                task =>
                  task.task_status ===
                  "pending"
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

          <h3>Followups</h3>

          <h2>
            {
              tasks.filter(
                task =>
                  task.task_status ===
                  "followup"
              ).length
            }
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
                  task.task_status ===
                  "completed"
              ).length
            }
          </h2>

        </div>

      </div>

      {/* Table */}

      <div className="recent-card">

        <div className="overflow-x-auto">

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
                      key={task.task_id}
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
                          className={`status-badge ${task.task_status}`}
                        >

                          {
                            task.task_status
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
                        onClick={() =>
                          setOpenMenu(
                            openMenu === task.task_id
                              ? null
                              : task.task_id
                          )
                        }
                      >

                        <MoreVertical
                          size={18}
                        />

                      </button>

                      {

                        openMenu ===
                        task.task_id && (

                          <div className="action-dropdown">

                            <div
                              onClick={() =>
                                handleTaskAction(
                                  task,
                                  "connected"
                                )
                              }
                            >
                              Connected
                            </div>

                            <div
                              onClick={() =>
                                handleTaskAction(
                                  task,
                                  "followup"
                                )
                              }
                            >
                              Schedule Followup
                            </div>

                            <div
                              onClick={() =>
                                handleTaskAction(
                                  task,
                                  "not_interested"
                                )
                              }
                            >
                              Not Interested
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

    </EmployeeLayout>

  );

}