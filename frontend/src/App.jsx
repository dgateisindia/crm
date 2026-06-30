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
import LeadDetails from "./pages/manager/LeadDetails";  
import ImportantLeads from "./pages/manager/ImportantLeads";  
import NotInterestedLeads from "./pages/manager/NotInterested"; 
import ConvertedLeads from "./pages/manager/ConvertedLeads";
import ResetPassword from "./pages/manager/ResetPassword";
import ForgotPassword from "./pages/manager/ForgotPassword";
import EmployeeImportantLeads from "./pages/employee/EmployeeImportantLeads";
import EmployeeConvertedLeads from "./pages/employee/EmployeeConvertedLeads";
import EmployeeNotInterested from "./pages/employee/EmployeeNotInterested";
import EmployeeTasks from "./pages/employee/EmployeeTasks";
import EmployeeTaskFollowups  from "./pages/employee/EmployeeTaskFollowups";
import EmployeeLeadDetails from "./pages/employee/EmployeeLeadDetails";
import EmployeeReport from "./pages/employee/EmployeeReport";
import Error401 from "./pages/errors/401";
import Error403 from "./pages/errors/403";
import Error404 from "./pages/errors/404";
import Error500 from "./pages/errors/500";
import Error503 from "./pages/errors/503";


function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Login />}
      />
      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
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
        path="/employee/reports"
        element={
          <ProtectedRoute>
            <EmployeeReport />
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
          path="/employee/lead/:id"
          element={
            <ProtectedRoute>
              <EmployeeLeadDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/edit-lead/:id"
          element={
            <ProtectedRoute>
              <EmployeeAddLeads />
            </ProtectedRoute>
          }
        />
              <Route
        path="/manager/employees/:id"
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
      <Route
        path="/manager/lead/:id"
        element={
          <ProtectedRoute>
            <LeadDetails />
          </ProtectedRoute>
        }
      />
      <Route 
      path="/manager/edit-lead/:id" 
      element={
      <ProtectedRoute>
        <AddLeads />
        </ProtectedRoute>} />

        <Route

        path="/manager/important-leads"

        element={
        <ImportantLeads />
        }

        />
        <Route
        path="/manager/converted-leads"
        element={<ConvertedLeads />}
        />

        <Route
        path="/manager/not-interested"
        element={<NotInterestedLeads />}
        />

        <Route
        path="/employee/important-leads"
        element={<EmployeeImportantLeads />}
        />

        <Route
        path="/employee/converted-leads"
        element={<EmployeeConvertedLeads />}
        />
        <Route
        path="/employee/not-interested"
        element={<EmployeeNotInterested />}
        />
        <Route
          path="/employee/tasks"
          element={<EmployeeTasks />}
        />

        <Route
          path="/employee/task-followups"
          element={<EmployeeTaskFollowups />}
        />
        <Route
          path="/manager/edit-employee/:id"
          element={<CreateEmployee />}
        />
        {/* Error routes */}
        <Route
         path="/401" 
         element={<Error401 />} 
         />
        <Route
         path="/403" element={<Error403 />} 
         />
        <Route 
        path="/500" element={<Error500 />} 
        />
        <Route 
        path="/503" element={<Error503 />} 
        />
        

        {/* 404 must be last */}
        <Route 
        path="*" element={<Error404 />} />

    </Routes>
  );
}

export default App;