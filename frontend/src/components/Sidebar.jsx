import {Link,useNavigate,useLocation,} from "react-router-dom";import { UserPlus, } from "lucide-react";
import "../styles/sidebar.css";
import logo from "../assets/logo.png";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";


import {
  LayoutDashboard,
  ContactRound,
  UserCheck,
  PhoneCall,
  FileText,
  Settings,
  AlertCircle,
  Clock,
  BadgeCheck
  //ClipboardList,
  //StickyNote,
} from "lucide-react";

export default function Sidebar() {
  const [leadDropdown, setLeadDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");

  navigate("/", {
    replace: true,
  });
};

  return (
    <div className="sidebar">

      <div>

        {/* Logo */}
        <img
          src={logo}
          alt="DGATE Logo"
          className="w-10 h-10 object-contain mb-5"
        />

        {/* Main Menu */}
        <div>

          <ul className="space-y-0.1">

            <Link to="/manager/dashboard">
              <li className={`sidebar-menu ${location.pathname === "/manager/dashboard" ? "active-menu " : ""}`}>
                <LayoutDashboard size={15} />
                Dashboard
              </li>
            </Link>

            <li className="sidebar-dropdown">

            <div
              className="sidebar-menu"
              onClick={() => setLeadDropdown(!leadDropdown)}
            >
              <div className="flex items-center gap-3">
                <ContactRound size={12} />
                <span>Leads</span>
              </div>

              {leadDropdown ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </div>

            {leadDropdown && (
              <div className="submenu">

                <Link to="/manager/leads">
                  <div className={`submenu-item ${location.pathname === "/manager/leads" ? "active-submenu" : ""}`}>
                    Total Leads
                  </div>
                </Link>

                <Link to="/manager/add-leads">
                  <div className={`submenu-item ${location.pathname === "/manager/add-leads" ? "active-submenu" : ""}`}>
                    Add Leads
                  </div>
                </Link>

              </div>
            )}
          </li>
            <Link to="/manager/employees">
              <li className={`sidebar-menu ${location.pathname === "/manager/employees" ? "active-menu " : ""}`}>
                <UserCheck size={12} />
                Employees
              </li>
            </Link>

            <Link to="/manager/create-employee">
                <li className={`sidebar-menu ${location.pathname === "/manager/create-employee" ? "active-menu " : ""}`}>
                    
                    <UserPlus size={12} />

                    Create Employee
                </li>

            </Link>
            {/*
            <Link to="/manager/create-manager">
                <li className={`sidebar-menu ${location.pathname === "/manager/create-manager" ? "active-menu " : ""}`}>
                    
                    <UserCog size={12} />

                    Create Manager
                </li>
            </Link>*/}

            <Link to="/manager/followups">
              <li className={`sidebar-menu ${location.pathname === "/manager/followups" ? "active-menu " : ""}`}>
                <PhoneCall size={12} />
                Follow Ups
              </li>
            </Link>
            

            <Link to="/manager/reports">
              <li className={`sidebar-menu ${location.pathname === "/manager/reports" ? "active-menu " : ""}`}  >
                <FileText size={12} />
                Reports
              </li>
            </Link>

            <Link to="/manager/settings">
              <li className={`sidebar-menu ${location.pathname === "/manager/settings" ? "active-menu " : ""}`}>
                <Settings size={12} />
                Settings
              </li>
            </Link>

          </ul>
        </div>
        </div>

        {/* Important Section */}
      <div className="mt-4">
        <h2 className="text-gray-400 uppercase text-sm mb-4">
          Important
        </h2>

        <div className="space-y-2">

          <Link to="/manager/important-leads">
            <div
              className={`sidebar-important-card ${
                location.pathname === "/manager/important-leads"
                  ? "active-menu"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={20} />
                Important Leads
              </div>
            </div>
          </Link>

          <Link to="/manager/converted-leads">
            <div
              className={`sidebar-important-card ${
                location.pathname === "/manager/converted-leads"
                  ? "active-menu"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <BadgeCheck size={20} />
                Converted Leads
              </div>
            </div>
          </Link>

          <Link to="/manager/not-interested">
            <div
              className={`sidebar-important-card ${
                location.pathname === "/manager/not-interested"
                  ? "active-menu"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock size={20} />
                Not Interested
              </div>
            </div>
          </Link>

        </div>
      </div>
            {/* Bottom */}
            <div>
          <button
            onClick={handleLogout}
            className="logout-btn"
          >
            Logout
          </button>
        </div>

      </div>
        );
      }