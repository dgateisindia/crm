import { Routes, Route } from "react-router-dom";


import Login from "./pages/Login";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import Leads from "./pages/manager/Leads";
import Employees from "./pages/manager/Employees";
import FollowUps from "./pages/manager/FollowUps";
import Reports from "./pages/manager/Reports";
import Settings from "./pages/manager/Settings";
import CreateEmployee from "./pages/manager/CreateEmployee";
import ProtectedRoute from "./routes/ProtectedRoute";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeFollowUps from "./pages/employee/EmployeeFollowUps"; 
import EmployeeAddLeads from "./pages/employee/EmployeeAddLeads"; 
import EmployeeMyLeads from "./pages/employee/EmployeeLeads"; 
import EmployeeDetails from "./pages/manager/EmployeeDetails";
import EmployeeProfile from "./pages/employee/EmployeeProfile";
import AddLeads from "./pages/manager/AddLeads";
import CreateManager from "./pages/manager/CreateManager";

function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Login />}
      />

      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/leads"
        element={
          <ProtectedRoute>
            <Leads />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/add-leads"
        element={
          <ProtectedRoute>
            <AddLeads />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/employees"
        element={
          <ProtectedRoute>
            <Employees />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/create-employee"
        element={
          <ProtectedRoute>
            <CreateEmployee />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/followups"
        element={
          <ProtectedRoute>
            <FollowUps />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/followups"
        element={
          <ProtectedRoute>
            <EmployeeFollowUps />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/add-leads"
        element={
          <ProtectedRoute>
            <EmployeeAddLeads />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/my-leads"
        element={
          <ProtectedRoute>
            <EmployeeMyLeads />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/employee/:id"
        element={
        <ProtectedRoute>
          <EmployeeDetails />
        </ProtectedRoute>
        }
      />
      <Route
        path="/employee/profile"
        element={
          <ProtectedRoute>
            <EmployeeProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/create-manager"
        element={
          <ProtectedRoute>
            <CreateManager />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;