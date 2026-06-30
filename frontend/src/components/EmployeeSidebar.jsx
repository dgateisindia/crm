import {Link,useNavigate,useLocation,} from "react-router-dom";

// import logo from "../assets/logo.png";

import "../styles/employeesidebar.css";

import {
  LayoutGrid,
  BriefcaseBusiness,
  CirclePlus,
  PhoneForwarded,
  UserRound,
  LogOut,
  ShieldAlert,
  BadgeCheck,
  ClipboardCheck,
  CalendarClock,
  FileSpreadsheet,
  CircleOff
} from "lucide-react";

export default function EmployeeSidebar() {

  const navigate =
    useNavigate();
    
  const location =
    useLocation();

  const handleLogout =
    () => {

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "role"
      );

      navigate("/", {
        replace: true,
      });
    };

  return (
    <div className="sidebar">

      {/* Top */}
      <div>

        {/* Logo */}
        {/* Logo */}
        <div className="sidebar-logo">
          <span className="logo-brand">
            <span className="logo-d">D</span>GATE
          </span>
        </div>

        {/* Menu */}
        <div className="space-y-2">

          <Link
            to="/employee/dashboard"
          >
            <div className={`sidebar-menu ${location.pathname === "/employee/dashboard" ? "active-menu" : ""}`}>

              <LayoutGrid size={20} strokeWidth={2.2} />

              Dashboard

            </div>
          </Link>

          <Link
            to="/employee/my-leads"
          >
            <div className={`sidebar-menu ${location.pathname === "/employee/my-leads" ? "active-menu " : ""}`}>

              <BriefcaseBusiness size={20} strokeWidth={2.2} />

              My Leads

            </div>
          </Link>

          <Link
            to="/employee/add-leads"
          >
            <div className={`sidebar-menu ${location.pathname === "/employee/add-leads" ? "active-menu " : ""}`}  >

              <CirclePlus size={20} strokeWidth={2.2} />

              Add Lead

            </div>
          </Link>
          <Link
              to="/employee/tasks"
            >
              <div
                className={`sidebar-menu ${
                  location.pathname === "/employee/tasks"
                    ? "active-menu"
                    : ""
                }`}
              >
                <ClipboardCheck size={20} strokeWidth={2.2} />

                Tasks

              </div>
            </Link>
            <Link
                to="/employee/task-followups"
              >
                <div
                  className={`sidebar-menu ${
                    location.pathname === "/employee/task-followups"
                      ? "active-menu"
                      : ""
                  }`}
                >
                  <CalendarClock size={20} strokeWidth={2.2} />

                  Task Followups

                </div>
              </Link>

          <Link
            to="/employee/followups"
          >
            <div className={`sidebar-menu ${location.pathname === "/employee/followups" ? "active-menu " : ""}`} >

              <PhoneForwarded size={20} strokeWidth={2.2} />

              Lead Follow Ups

            </div>
          </Link>

          <Link
            to="/employee/profile"
          >
            <div className={`sidebar-menu ${location.pathname === "/employee/profile" ? "active-menu " : ""}`} >

              <UserRound size={20} strokeWidth={2.2} />

              Profile

            </div>
          </Link>
          <Link to="/employee/reports">
              <li className={`sidebar-menu ${location.pathname === "/employee/reports" ? "active-menu " : ""}`}  >
                <FileSpreadsheet size={20} strokeWidth={2.2} />
                Reports
              </li>
            </Link>

        </div>

      </div>
             {/* Important Section */}
      <div className="mt-4">
        <h2 className="text-gray-400 uppercase text-sm mb-4">
          Important
        </h2>

        <div className="space-y-2">

          <Link to="/employee/important-leads">
            <div
              className={`sidebar-important-card ${
                location.pathname === "/employee/important-leads"
                  ? "active-menu"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldAlert size={20} strokeWidth={2.2} />
                Important Leads
              </div>
            </div>
          </Link>

          <Link to="/employee/converted-leads">
            <div
              className={`sidebar-important-card ${
                location.pathname === "/employee/converted-leads"
                  ? "active-menu"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <BadgeCheck size={20} strokeWidth={2.2} />
                Converted Leads
              </div>
            </div>
          </Link>

          <Link to="/employee/not-interested">
            <div
              className={`sidebar-important-card ${
                location.pathname === "/employee/not-interested"
                  ? "active-menu"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <CircleOff size={20} strokeWidth={2.2} />
                Not Interested
              </div>
            </div>
          </Link>

        </div>
      </div>
      

      {/* Bottom */}
      <div>

        {/*<div className="profile-card">

          <img
            src="https://i.pravatar.cc/100"
            alt="profile"
            className="w-10 h-10 rounded-full"
          />

          <div>

            <h3 className="font-semibold">
              Employee
            </h3>

            <p className="text-xs text-gray-400">
              CRM Employee
            </p>

          </div>

        </div>*/}

        <button
          onClick={
            handleLogout
          }
          className="logout-btn"
        >

          <LogOut size={18} />

          Logout

        </button>

      </div>

    </div>
  );
}