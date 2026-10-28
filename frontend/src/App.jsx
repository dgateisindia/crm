import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

//import Login from "./pages/Login";
const ManagerDashboard = React.lazy(() => import("./pages/manager/ManagerDashboard"));
const Leads = React.lazy(() => import("./pages/manager/Leads"));
const Employees = React.lazy(() => import("./pages/manager/Employees"));
const FollowUps = React.lazy(() => import("./pages/manager/FollowUps"));
const Reports = React.lazy(() => import("./pages/manager/Reports"));
const Settings = React.lazy(() => import("./pages/manager/Settings"));
const CreateEmployee = React.lazy(() => import("./pages/manager/CreateEmployee"));
import ProtectedRoute from "./routes/ProtectedRoute";

const EmployeeDashboard = React.lazy(() => import("./pages/employee/EmployeeDashboard"));
const EmployeeFollowUps = React.lazy(() => import("./pages/employee/EmployeeFollowUps"));
const EmployeeAddLeads = React.lazy(() => import("./pages/employee/EmployeeAddLeads"));
const EmployeeMyLeads = React.lazy(() => import("./pages/employee/EmployeeLeads"));
const EmployeeDetails = React.lazy(() => import("./pages/manager/EmployeeDetails"));
const EmployeeProfile = React.lazy(() => import("./pages/employee/EmployeeProfile"));

const AddLeads = React.lazy(() => import("./pages/manager/AddLeads"));

const LeadDetails = React.lazy(() => import("./pages/manager/LeadDetails"));
const ImportantLeads = React.lazy(() => import("./pages/manager/ImportantLeads"));
const NotInterestedLeads = React.lazy(() => import("./pages/manager/NotInterested"));
const ConvertedLeads = React.lazy(() => import("./pages/manager/ConvertedLeads"));
const ManagerNotResponded = React.lazy(() => import("./pages/manager/NotResponded"));


const EmployeeImportantLeads = React.lazy(() => import("./pages/employee/EmployeeImportantLeads"));
const EmployeeConvertedLeads = React.lazy(() => import("./pages/employee/EmployeeConvertedLeads"));
const EmployeeNotInterested = React.lazy(() => import("./pages/employee/EmployeeNotInterested"));
const EmployeeTasks = React.lazy(() => import("./pages/employee/EmployeeTasks"));
const EmployeeTaskFollowups = React.lazy(() => import("./pages/employee/EmployeeTaskFollowups"));
const EmployeeLeadDetails = React.lazy(() => import("./pages/employee/EmployeeLeadDetails"));
const EmployeeReport = React.lazy(() => import("./pages/employee/EmployeeReport"));
const NotResponded = React.lazy(() => import("./pages/employee/EmployeeNotResponded"));

import Error401 from "./pages/errors/401";
import Error403 from "./pages/errors/403";
import Error404 from "./pages/errors/404";
import Error500 from "./pages/errors/500";
import Error503 from "./pages/errors/503";

const ManagerProfile = React.lazy(() => import("./pages/manager/Profile"));



import AuthRedirect from "./pages/AuthRedirect";



function AuthEntryRedirect() {
  React.useEffect(() => {
    window.location.replace(`${window.location.origin}/sign-in`);
  }, []);
  return <div>Opening secure sign-in...</div>;
}
function App() {
  return (
    <React.Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          Loading D-GATE CRM...
        </div>
      }
    >
      <Routes>
      <Route
        path="/login"
        element={<Navigate to="/clerk-login" replace />}
      />

      {/* =========================================
          LEGACY LOGIN
          ========================================= */}

 <Route
  path="/"
  element={<AuthEntryRedirect />}
/>


      {/* =========================================
          CLERK TEST ROUTES
          ========================================= */}

      <Route
        path="/clerk-login/*"
        element={<AuthEntryRedirect />}
      />

      <Route path="/accept-invitation/*" element={<AuthEntryRedirect />} />

      <Route
        path="/auth-redirect"
        element={<AuthRedirect />}
      />


      {/* =========================================
          PASSWORD RESET
          ========================================= */}


      {/* =========================================
          MANAGER ROUTES
          ========================================= */}

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
        path="/manager/employees/:id"
        element={
          <ProtectedRoute>
            <EmployeeDetails />
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
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/important-leads"
        element={
          <ProtectedRoute>
            <ImportantLeads />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/converted-leads"
        element={
          <ProtectedRoute>
            <ConvertedLeads />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/not-interested"
        element={
          <ProtectedRoute>
            <NotInterestedLeads />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/manager/not-responded"
        element={
          <ProtectedRoute>
            <ManagerNotResponded />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/edit-employee/:id"
        element={
          <ProtectedRoute>
            <CreateEmployee />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/profile"
        element={
          <ProtectedRoute>
            <ManagerProfile />
          </ProtectedRoute>
        }
      />


      {/* =========================================
          EMPLOYEE ROUTES
          ========================================= */}

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
        path="/employee/profile"
        element={
          <ProtectedRoute>
            <EmployeeProfile />
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
        path="/employee/important-leads"
        element={
          <ProtectedRoute>
            <EmployeeImportantLeads />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/converted-leads"
        element={
          <ProtectedRoute>
            <EmployeeConvertedLeads />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/not-interested"
        element={
          <ProtectedRoute>
            <EmployeeNotInterested />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/not-responded"
        element={
          <ProtectedRoute>
            <NotResponded />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/tasks"
        element={
          <ProtectedRoute>
            <EmployeeTasks />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/task-followups"
        element={
          <ProtectedRoute>
            <EmployeeTaskFollowups />
          </ProtectedRoute>
        }
      />


      {/* =========================================
          ERROR ROUTES
          ========================================= */}

      <Route
        path="/401"
        element={<Error401 />}
      />

      <Route
        path="/403"
        element={<Error403 />}
      />

      <Route
        path="/500"
        element={<Error500 />}
      />

      <Route
        path="/503"
        element={<Error503 />}
      />


      {/* =========================================
          404
          ========================================= */}

      <Route
        path="*"
        element={<Error404 />}
      />

    </Routes>
    </React.Suspense>
  );
}

export default App;