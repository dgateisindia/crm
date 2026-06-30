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

export default function ManagerDashboard() {

  const navigate = useNavigate();
  const [leadStatus, setLeadStatus] = useState([]);

  const [stats,
    setStats] =
    useState({
      totalLeads: 0,
      totalEmployees: 0,
      newLeads: 0,
      convertedLeads: 0,
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

      {/* Top Cards */}
      <div className="dashboard-grid">

        {/* Total Leads */}
        <div

          className="crm-card blue-card cursor-pointer"

          onClick={() =>
            navigate(
              "/manager/leads"
            )
          }

        >

          <div className="crm-card-top">

            <div className="icon-circle blue-bg">

              <Briefcase
                size={16}
              />

            </div>

          </div>

          <h3>

            Total Leads

          </h3>

          <h2>

            {
              stats.totalLeads
            }

          </h2>

        </div>


        {/* Employees */}
        <div

          className="crm-card green-card cursor-pointer"

          onClick={() =>
            navigate(
              "/manager/employees"
            )
          }

        >

          <div className="crm-card-top">

            <div className="icon-circle green-bg">

              <Users
                size={26}
              />

            </div>

          </div>

          <h3>

            Employees

          </h3>

          <h2>

            {
              stats.totalEmployees
            }

          </h2>

        </div>
      
        {/* New Leads */}
        <div

          className="crm-card orange-card cursor-pointer"

          onClick={() =>
            navigate(
              "/manager/leads"
            )
          }

        >

          <div className="crm-card-top">

            <div className="icon-circle orange-bg">

              <UserCheck
                size={26}
              />

            </div>

          </div>

          <h3>

            New Leads

          </h3>

          <h2>

            {
              stats.newLeads
            }

          </h2>

        </div>


        {/* Converted */}
        <div

          className="crm-card purple-card cursor-pointer"

          onClick={() =>
            navigate(
              "/manager/leads"
            )
          }

        >

          <div className="crm-card-top">

            <div className="icon-circle purple-bg">

              <BadgeCheck
                size={26}
              />

            </div>

          </div>

          <h3>

            Converted

          </h3>

          <h2>

            {
              stats.convertedLeads
            }

          </h2>

        </div>

      </div>
      <div className="dashboard-charts">

          <LeadStatusChart
            data={leadStatus}
          />

          <EmployeePerformanceChart
              data={employeePerformance}
          />
          

              <LeadTrendChart
              data={leadTrend}
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
                        className={`status-badge ${
                          lead.lead_status ===
                          "converted"

                          ? "converted"

                          : lead.lead_status ===
                          "new"

                          ? "new"

                          : "connected"
                        }`}
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