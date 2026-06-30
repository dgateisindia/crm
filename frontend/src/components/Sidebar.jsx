import {Link,useNavigate,useLocation,} from "react-router-dom";import { UserPlus, } from "lucide-react";
import "../styles/sidebar.css";
import logo from "../assets/logo.png";
//import { useState } from "react";
//import { ChevronDown, ChevronRight } from "lucide-react";


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
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {

  const confirmLogout = window.confirm(
        "Are you sure you want to logout?"
      );

      if (!confirmLogout) {
        return;
      }

      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");

      navigate("/", {
        replace: true,
      });
    };

  return (
    <div className="sidebar">

      <div>

        {/* Logo */}
        <div className="flex justify-center mb-5">
          <img
            src={logo}
            alt="DGATE Logo"
            className="w-12 h-12 object-contain"
          />
        </div>

        {/* Main Menu */}
        <div>
          <ul className="space-y-0.1">

            <Link to="/manager/dashboard">
              <li className={`sidebar-menu ${location.pathname === "/manager/dashboard" ? "active-menu " : ""}`}>
                <LayoutDashboard size={15} />
                Dashboard
              </li>
            </Link>

            <Link to="/manager/leads">
              <li
                className={`sidebar-menu ${location.pathname === "/manager/leads"? "active-menu": ""}`}>
                <ContactRound size={12} />
                Leads
              </li>
            </Link>

            <Link to="/manager/add-leads">
              <li
                className={`sidebar-menu ${location.pathname === "/manager/add-leads"? "active-menu": ""}`}>
                <ContactRound size={12} />
                Add Lead
              </li>
            </Link>
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
              className={`sidebar-important-card ${location.pathname === "/manager/important-leads"? "active-menu": ""}`}>
              <div className="flex items-center gap-2">
                <AlertCircle size={20} />
                Important Leads
              </div>
            </div>
          </Link>

          <Link to="/manager/converted-leads">
            <div
              className={`sidebar-important-card ${location.pathname === "/manager/converted-leads"? "active-menu": ""}`}>
            
              <div className="flex items-center gap-2">
                <BadgeCheck size={20} />
                Converted Leads
              </div>
            </div>
          </Link>

          <Link to="/manager/not-interested">
            <div
              className={`sidebar-important-card ${location.pathname === "/manager/not-interested"? "active-menu": ""}`}>
              <div className="flex items-center gap-2">
                <Clock size={20} />
                Not Interested
              </div>
            </div>
          </Link>

        </div>
      </div>
             
            <div>
          {/* Bottom Profile
        <div className="profile-card">
          <img
            src="https://i.pravatar.cc/100"
            alt="profile"
            className="w-4 h-8 rounded-full"
          />*/}

          <div>
            <h3 className="font-semibold">
              Manager
            </h3>

            <p className="text-sm text-gray-400">
              CRM Manager
            </p>
          </div>
        </div>

          <button
            onClick={handleLogout}
            className="logout-btn">
            Logout
          </button>
        </div>
        );
      }