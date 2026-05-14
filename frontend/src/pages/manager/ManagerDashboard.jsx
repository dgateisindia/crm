import ManagerLayout from "../../layouts/ManagerLayout";
import "../../styles/managerDashboard.css";

export default function ManagerDashboard() {
  return (
    <ManagerLayout>

      <h1 className="dashboard-title">
        Manager Dashboard
      </h1>

      <div className="dashboard-grid">

        <div className="dashboard-card">
          Total Leads: 120
        </div>

        <div className="dashboard-card">
          Employees: 20
        </div>

        <div className="dashboard-card">
          Revenue: ₹5L
        </div>

      </div>

    </ManagerLayout>
  );
}