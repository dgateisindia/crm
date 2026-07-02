
import api from "../../utils/api";

import {useState,useEffect,} from "react";

import {useNavigate} from "react-router-dom";

import EmployeeLayout from "../../layouts/EmployeeLayout";
import "../../styles/status.css";
import "../../styles/WelcomePopup.css";
import WelcomePopup from "../../components/dashboard/WelcomePopup";
import "../../styles/managerDashboard.css";
import "../../styles/notes.css";
import LeadStatusChart
from "../../components/charts/LeadStatusChart";
import NotesCard from "../../components/dashboard/NotesCard";
import LeadTrendChart
from "../../components/charts/LeadTrendChart";


import StatCard from "../../components/dashboard/StatCard";
import {

  Briefcase,
  UserPlus,
  BadgeCheck,
  UserX

}
from "lucide-react";

export default function EmployeeDashboard() {

  const navigate =
  useNavigate();

  const [leadStatus, setLeadStatus] =
useState([]);

const [leadTrend, setLeadTrend] =
useState([]);



const [showWelcome, setShowWelcome] = useState(false);

const [welcomeData, setWelcomeData] = useState(null);

  const [stats, setStats] = useState({
  totalLeads: 0,
  newLeads: 0,
  followups: 0,
  converted: 0,
  closed: 0,
  notInterested: 0,
  recentLeads: [],
});


  // ==========================
  // Get Logged In User
  // ==========================
  const user =
  JSON.parse(

    localStorage.getItem(
      "user"
    )

  );

  const userId =

    user?.employee_id ||

    user?.id;


  // ==========================
  // Fetch Dashboard Data
  // ==========================
  useEffect(() => {

  if (!userId) return;

  // Dashboard Cards
  api.get(`/dashboard/employee/${userId}`)
    .then((res) => setStats(res.data))
    .catch(console.error);

  // Lead Status
  api.get(`/dashboard/employee/${userId}/lead-status`)
    .then((res) => setLeadStatus(res.data))
    .catch(console.error);

  // Lead Trend
  api.get(`/dashboard/employee/${userId}/lead-trend`)
    .then((res) => setLeadTrend(res.data))
    .catch(console.error);

  

  // Welcome Popup
  api.get(`/dashboard/employee/${userId}/welcome`)
    .then((res) => {

      setWelcomeData(res.data);

      if (!sessionStorage.getItem("employeeWelcomeShown")) {

        setShowWelcome(true);

        sessionStorage.setItem(
          "employeeWelcomeShown",
          "true"
        );

      }

    })
    .catch(console.error);

}, [userId]);


  return (

    <EmployeeLayout>

      {/* Header */}
      <div className="dashboard-header">

        

      </div>


     
        <StatCard

    type="summary"

    title="My Leads"

    value={stats.totalLeads}

    subtitle="Total leads assigned to you"

    trend=""

    color="blue"

    icon={<Briefcase size={40}/>}

/>

    <div className="manager-dashboard-grid">

          <StatCard
              title="New"
              value={stats.newLeads}
              subtitle="New Leads"
              color="green"
              icon={<UserPlus size={22}/>}
              onClick={() => navigate("/employee/new-leads")}
          />

          <StatCard
              title="Follow-ups"
              value={stats.followups}
              subtitle="Pending Follow-ups"
              color="orange"
              icon={<Briefcase size={22}/>}
              onClick={() => navigate("/employee/followups")}
          />

          <StatCard
              title="Converted"
              value={stats.converted}
              subtitle="Successfully Converted"
              color="blue"
              icon={<BadgeCheck size={22}/>}
              onClick={() => navigate("/employee/converted-leads")}
          />

          <StatCard
              title="Closed"
              value={stats.closed}
              subtitle="Closed Leads"
              color="purple"
              icon={<Briefcase size={22}/>}
              onClick={() => navigate("/employee/closed-leads")}
          />

          <StatCard
              title="Not Interested"
              value={stats.notInterested}
              subtitle="Rejected Leads"
              color="red"
              icon={<UserX size={22}/>}
              onClick={() => navigate("/employee/not-interested")}
          />

        </div>
      {/* Charts */}
<div className="dashboard-charts">

  <LeadStatusChart
    data={leadStatus}
  />

  <LeadTrendChart
    data={leadTrend}
  />

  <NotesCard
    employeeId={userId}
  />

  

</div>


      {/* Recent Leads */}
      <div className="recent-card">

        <div className="recent-header">

          <h2>

            Recent Leads

          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr>

                <th>
                  Company
                </th>

                <th>
                  Contact Person
                </th>

                <th>
                  Phone
                </th>

                <th>
                  Status
                </th>

                <th>
                  Lead Mode
                </th>

              </tr>

            </thead>

            <tbody>

              {

                stats.recentLeads
                ?.length > 0

                ? (

                  stats.recentLeads
                  .map((lead) => (

                    <tr
                      key={lead.id}
                    >

                      <td>
                        {
                          lead.company_name
                        }
                      </td>

                      <td>

                        {
                          lead.contact_person_name
                          || "N/A"
                        }

                      </td>

                      <td>

                        {
                          lead.phone
                          || "N/A"
                        }

                      </td>

                      <td>

                        <span
                      className={`status-badge ${lead.lead_status}`}
                        >

                          {
                            lead.lead_status
                          }

                        </span>

                      </td>

                      <td>

                        {
                          lead.lead_mode
                          ?.replace(
                            "_",
                            " "
                          ) || "N/A"
                        }

                      </td>

                    </tr>

                  ))

                )

                : (

                  <tr>

                    <td
                      colSpan="5"
                      className="text-center p-8 text-gray-400"
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
      <WelcomePopup
  open={showWelcome}
  data={welcomeData}
  onClose={() => setShowWelcome(false)}
  onOpenTasks={() => {
    setShowWelcome(false);
    navigate("/employee/task-followups");
  }}
/>

    </EmployeeLayout>

  );

}