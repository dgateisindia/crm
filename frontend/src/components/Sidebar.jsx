import {Link,useNavigate,} from "react-router-dom";import { UserPlus } from "lucide-react";
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
  ClipboardList,
  StickyNote,
} from "lucide-react";

export default function Sidebar() {
  const [leadDropdown, setLeadDropdown] = useState(false);
  const navigate = useNavigate();

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
          className="w-12 h-12 object-contain"
        />
        <h1 className="text-3xl font-bold mb-10">
          DGATE CRM
        </h1>

        {/* Main Menu */}
        <div>
          <h2 className="text-gray-400 uppercase text-sm mb-4">
            Main Menu
          </h2>

          <ul className="space-y-2">

            <Link to="/manager/dashboard">
              <li className="sidebar-menu">
                <LayoutDashboard size={20} />
                Dashboard
              </li>
            </Link>

            <li className="sidebar-dropdown">

            <div
              className="sidebar-menu"
              onClick={() => setLeadDropdown(!leadDropdown)}
            >
              <div className="flex items-center gap-3">
                <ContactRound size={20} />
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
                  <div className="submenu-item">
                    Total Leads
                  </div>
                </Link>

                <Link to="/manager/add-leads">
                  <div className="submenu-item">
                    Add Leads
                  </div>
                </Link>

              </div>
            )}
          </li>
            <Link to="/manager/employees">
              <li className="sidebar-menu">
                <UserCheck size={20} />
                Employees
              </li>
            </Link>

            <Link to="/manager/create-employee">
                <li className="sidebar-menu">
                    
                    <UserPlus size={20} />

                    Create Employee
                </li>
            </Link>

            <Link to="/manager/followups">
              <li className="sidebar-menu">
                <PhoneCall size={20} />
                Follow Ups
              </li>
            </Link>

            <Link to="/manager/reports">
              <li className="sidebar-menu">
                <FileText size={20} />
                Reports
              </li>
            </Link>

            <Link to="/manager/settings">
              <li className="sidebar-menu">
                <Settings size={20} />
                Settings
              </li>
            </Link>

          </ul>
        </div>

        {/* Important Section */}
        <div className="mt-10">

          <h2 className="text-gray-400 uppercase text-sm mb-4">
            Important
          </h2>

          <div className="space-y-3">

            <div className="sidebar-important-card">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} />
                Important Leads
              </div>

              <span className="bg-red-500 px-2 py-1 rounded-full text-sm">
                12
              </span>
            </div>

            <div className="sidebar-important-card">
              <div className="flex items-center gap-2">
                <Clock size={18} />
                Pending Follow-ups
              </div>

              <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-sm">
                8
              </span>
            </div>

            <div className="sidebar-important-card">
              <div className="flex items-center gap-2">
                <ClipboardList size={18} />
                Overdue Tasks
              </div>

              <span className="bg-red-600 px-2 py-1 rounded-full text-sm">
                3
              </span>
            </div>

            <div className="sidebar-important-card">
              <div className="flex items-center gap-2">
                <StickyNote size={18} />
                Important Notes
              </div>

              <span className="bg-blue-500 px-2 py-1 rounded-full text-sm">
                15
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* Bottom Profile */}
      <div>

  {/*<div className="profile-card">
    <img
      src="https://i.pravatar.cc/100"
      alt="profile"
      className="w-12 h-12 rounded-full"
    />

    <div>
      <h3 className="font-semibold">
        Manager
      </h3>

      <p className="text-sm text-gray-400">
        CRM Manager
      </p>
    </div>
  </div>*/}

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