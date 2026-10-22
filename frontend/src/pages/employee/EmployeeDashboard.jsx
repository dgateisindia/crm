
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
import { getStatusTheme } from "../../utils/statusTheme";
import {normalizeStatus,formatStatus} from "../../utils/statusUtils";
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

const [employeeId, setEmployeeId] = useState(null);

const [showWelcome, setShowWelcome] = useState(false);

const [welcomeData, setWelcomeData] = useState(null);

const [stats, setStats] = useState({
  totalLeads: 0,
  newLeads: 0,
  todoCount: 0,
  converted: 0,
  notResponded: 0,
  notInterested: 0,
  recentLeads: [],
});



  // ==========================
  // Fetch Dashboard Data
  // ==========================
  useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      // Get CRM employee ID from backend
      const employeeResponse = await api.get("/employee/me");

      const employeeId = Number(
        employeeResponse.data.data.employee_id
      );

      if (!Number.isSafeInteger(employeeId) || employeeId <= 0) {
        throw new Error("Invalid employee ID");
      }

      setEmployeeId(employeeId);

      console.log("CRM EMPLOYEE ID:", employeeId);

      // Dashboard Cards
      const statsResponse =
        await api.get(
          `/dashboard/employee/${employeeId}`
        );

      console.log(
        "DASHBOARD STATS:",
        statsResponse.data
      );

      setStats(statsResponse.data);

      // Lead Status
      const statusResponse =
        await api.get(
          `/dashboard/employee/${employeeId}/lead-status`
        );

      console.log(
        "LEAD STATUS:",
        statusResponse.data
      );

      setLeadStatus(statusResponse.data);

      // Lead Trend
      const trendResponse =
        await api.get(
          `/dashboard/employee/${employeeId}/lead-trend`
        );

      console.log(
        "LEAD TREND:",
        trendResponse.data
      );

      setLeadTrend(trendResponse.data);

      // Welcome Popup
      const welcomeResponse =
        await api.get(
          `/dashboard/employee/${employeeId}/welcome`
        );

      console.log(
        "WELCOME DATA:",
        welcomeResponse.data
      );

      setWelcomeData(
        welcomeResponse.data
      );

      if (
        !sessionStorage.getItem(
          "employeeWelcomeShown"
        )
      ) {
        setShowWelcome(true);

        sessionStorage.setItem(
          "employeeWelcomeShown",
          "true"
        );
      }

    } catch (error) {
      console.error(
        "EMPLOYEE DASHBOARD ERROR:",
        error
      );

      console.error(
        "ERROR RESPONSE:",
        error.response?.data
      );
    }
  };

  fetchDashboardData();
}, []);


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
    onClick={() => navigate("/employee/my-leads")}

/>

    <div className="manager-dashboard-grid">

          <StatCard
              title="New"
              value={stats.newLeads}
              subtitle="New Leads"
              color="green"
              icon={<UserPlus size={22}/>}
              onClick={() => navigate("/employee/tasks")}
          />

          <StatCard
            title="To-Do List"
            value={stats.todoCount ?? 0}
            subtitle="Pending Tasks"
            color="blue"
            icon={<Briefcase size={22}/>}
            onClick={() => navigate("/employee/task-followups")}
          />

          <StatCard
              title="Converted"
              value={stats.converted}
              subtitle="Successfully Converted"
              color="purple"
              icon={<BadgeCheck size={22}/>}
              onClick={() => navigate("/employee/converted-leads")}
          />

          <StatCard
            title="Not Responded"
            value={stats.notResponded}
            subtitle="Leads with no response"
            color="orange"
            icon={<Briefcase size={22} />}
            onClick={() => navigate("/employee/not-responded")}
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
          employeeId={employeeId}
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

                              className="status-badge"

                              style={{

                             background:
                              getStatusTheme(lead.lead_status).bg,

                              color:
                              getStatusTheme(lead.lead_status).color,

                              }}

                              >

                              {formatStatus(lead.lead_status)}

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