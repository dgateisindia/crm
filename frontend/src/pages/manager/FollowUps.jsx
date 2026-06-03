import axios from "axios";
import { MoreVertical } from "lucide-react";

import {
  useEffect,
  useState
} from "react";

import {
  ClipboardList,
  Calendar,
  Clock3,
  CheckCircle
} from "lucide-react";

import ManagerLayout from "../../layouts/ManagerLayout";

import "../../styles/leads.css";
import "../../styles/followup.css";


export default function FollowUps() {

const [followups, setFollowups] = useState([]);
const [search, setSearch] = useState("");


  // ==========================
  // Fetch Followups
  // ==========================
const fetchFollowups =
async () => {

  try {

    const response =
    await axios.get(
      "http://localhost:5000/api/followups/all"
    );

    console.log(response.data);

    setFollowups(response.data);

  }
  catch(error){

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

  const upcomingCount = followups.filter(
        item => item.next_followup_date
      ).length;

      const completedCount = followups.filter(
        item => item.status === "completed"
      ).length;

      const overdueCount = followups.filter(item => {
        if (!item.next_followup_date) return false;

        return new Date(item.next_followup_date) < new Date();
      }).length;

      const filteredFollowups = followups.filter(
        (item) =>
          item.company_name?.toLowerCase().includes(search.toLowerCase()) ||
          item.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          item.followup_mode?.toLowerCase().includes(search.toLowerCase())
      );


  return (

    <ManagerLayout>

      <div className="leads-container">

      <div className="followupHeader">

         <div>

          <h1 className="followupTitle">
            Follow Ups
          </h1>

          <p className="followupSubtitle">
            Manage and track all follow ups with status & history
          </p>

      </div>

      <button className="addFollowupBtn">
        + Add Follow Up
      </button>

    </div>


 <div className="followupCards">

  <div className="followupCard">
    <div className="followupIcon blueIcon">
      <ClipboardList size={22} color="white" />
    </div>

    <h4>Total Follow Ups</h4>
    <h2>{followups.length}</h2>
  </div>

  <div className="followupCard">
    <div className="followupIcon greenIcon">
      <Calendar size={22} color="white" />
    </div>

    <h4>Upcoming</h4>
    <h2>{upcomingCount}</h2>
  </div>

  <div className="followupCard">
    <div className="followupIcon orangeIcon">
      <Clock3 size={22} color="white" />
    </div>

    <h4>Overdue</h4>
    <h2>{overdueCount}</h2>
  </div>

  <div className="followupCard">
    <div className="followupIcon purpleIcon">
      <CheckCircle size={22} color="white" />
    </div>

    <h4>Completed</h4>
    <h2>{completedCount}</h2>
  </div>

</div>

<div className="followupToolbar">

  <input
    type="text"
    placeholder="Search company, employee, mode..."
    className="followupSearch"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

  <div className="followupActions">

    <button className="toolbarBtn">
      Filters
    </button>

    <button className="toolbarBtn">
      Export
    </button>

  </div>

</div>


        {/* Table */}
        <div className="leads-card tableWrapper">

          <table className="w-full">

            {/* Table Header */}
            <thead>
              <tr className="border-b">

                <th className="table-head">#</th>

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
                  Last Follow Up
                </th>

                <th className="table-head">
                  Next Follow Up
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

            followups.map((item, index) => (

<tr
  key={item.followup_id}
  className="table-row"
>

  <td className="table-data">
    {index + 1}
  </td>

  <td className="table-data">
    {item.company_name}
  </td>

  <td className="table-data">
    {item.full_name || "N/A"}
  </td>

  <td className="table-data">
    {item.followup_mode}
  </td>

  <td className="table-data">
    {item.remarks || "No remarks"}
  </td>

  <td className="table-data">
    <span
      className={`followupStatus ${item.lead_status?.toLowerCase()}`}
    >
      {item.lead_status?.replace("_", " ")}
    </span>
  </td>

  <td className="table-data">
  {
    item.contact_date
      ? new Date(item.contact_date)
          .toLocaleDateString()
      : "N/A"
  }
</td>

<td className="table-data">
  {
    item.next_followup_date
      ? new Date(item.next_followup_date)
          .toLocaleDateString()
      : "Not Scheduled"
  }
</td>

  <td className="table-data">
    <button className="actionBtn">
      <MoreVertical size={16} />
    </button>
  </td>

</tr>

))
) : (

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

    </ManagerLayout>

  );

}