import api from "../../utils/api";
import { useNavigate }
from "react-router-dom";
import {useEffect,useState} from "react";
import LeadStatusChart from "../../components/charts/LeadStatusChart";
import ManagerLayout from "../../layouts/ManagerLayout";
import EmployeePerformanceChart from "../../components/charts/EmployeePerformanceChart";
import LeadTrendChart from "../../components/charts/LeadTrendChart";
import {
  Users,
  UserCheck,
  Briefcase,
  BadgeCheck,
} from "lucide-react";
import "../../styles/managerDashboard.css";

import StatCard from "../../components/dashboard/StatCard";

export default function ManagerDashboard() {

  const navigate = useNavigate();
  const [leadStatus, setLeadStatus] = useState([]);

  const [stats, setStats] = useState({
  totalLeads: 0,
  newLeads: 0,
  followups: 0,
  converted: 0,
  closed: 0,
  notInterested: 0,
  recentLeads: [],
});
    const [
    employeePerformance,
    setEmployeePerformance
    ] = useState([]);
    const [
    leadTrend,
    setLeadTrend
    ] = useState([]);

  useEffect(() => {

  const fetchDashboard = async () => {

    try {

      const statsRes =
        await api.get("/dashboard/stats");

      setStats(statsRes.data);

      const leadStatusRes =
        await api.get("/dashboard/lead-status");

      setLeadStatus(leadStatusRes.data);
      const employeeRes =
        await api.get(
        "/dashboard/employee-performance"
        );

        setEmployeePerformance(
        employeeRes.data
        );
        const trendRes =
        await api.get(
        "/dashboard/lead-trend"
        );

        setLeadTrend(
        trendRes.data
        );

    }

    catch (err) {

      console.log(err);

    }

  };

  fetchDashboard();

}, []);
  

  return (

    <ManagerLayout>

      {/* Header */}
      <div className="dashboard-header">

      </div>

 <div className="summary-card">

  <div className="summary-icon blue-bg">
    <Briefcase size={34} />
  </div>

  <div>

    <div className="summary-title">
      Total Leads
    </div>

    <div className="summary-value">
      {stats.totalLeads}
    </div>

    <div className="summary-subtitle">
      Total leads in the CRM
    </div>

  </div>

</div>

{/* Status Cards */}
<div className="manager-dashboard-grid">

  <StatCard
    title="New"
    value={stats.newLeads}
    color="green"
    icon={<UserCheck size={18} />}
    onClick={() => navigate("/manager/leads")}
  />

  <StatCard
    title="Followups"
    value={stats.followups}
    color="blue"
    icon={<Briefcase size={18} />}
    onClick={() => navigate("/manager/followups")}
  />

  <StatCard
    title="Converted"
    value={stats.converted}
    color="purple"
    icon={<BadgeCheck size={18} />}
    onClick={() => navigate("/manager/converted-leads")}
  />

  <StatCard
    title="Closed"
    value={stats.closed}
    color="orange"
    icon={<Users size={18} />}
    //onClick={() => navigate("/manager/leads")}
  />

  <StatCard
    title="Not Interested"
    value={stats.notInterested}
    color="red"
    icon={<Users size={18} />}
    onClick={() => navigate("/manager/not-interested")}
  />

</div>
     <div className="manager-dashboard-charts">

            <LeadStatusChart
                data={leadStatus}
            />

            <LeadTrendChart
                data={leadTrend}
            />

        </div>

        <div className="employee-chart-full">

            <EmployeePerformanceChart
                data={employeePerformance}
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
                ?.map((lead) => (

                  <tr key={lead.id}>

                    <td>
                      {lead.company_name}
                    </td>

                    <td>
                      {
                        lead.contact_person_name ||
                        "N/A"
                      }
                    </td>

                    <td>
                      {
                        lead.phone ||
                        "N/A"
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
              }

              </tbody>

          </table>

        </div>

      </div>

    </ManagerLayout>
  );
}