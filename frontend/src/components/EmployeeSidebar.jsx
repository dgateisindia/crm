import {
  Link,
  useNavigate,useLocation,
} from "react-router-dom";

import logo
from "../assets/logo.png";

import "../styles/employeesidebar.css";

import {
  LayoutDashboard,
  Users,
  PlusCircle,
  PhoneCall,
  User,
  LogOut,
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
        <div className="sidebar-logo">

          <img
            src={logo}
            alt="logo"
            className="sidebar-logo-image"
          />

          <h1 className="sidebar-logo-text">
            DGATE CRM
          </h1>

        </div>

        {/* Menu */}
        <div className="space-y-2">

          <Link
            to="/employee/dashboard"
          >
            <div className={`sidebar-menu ${location.pathname === "/employee/dashboard" ? "active-menu" : ""}`}>

              <LayoutDashboard
                size={18}
              />

              Dashboard

            </div>
          </Link>

          <Link
            to="/employee/my-leads"
          >
            <div className={`sidebar-menu ${location.pathname === "/employee/my-leads" ? "active-menu " : ""}`}>

              <Users
                size={18}
              />

              My Leads

            </div>
          </Link>

          <Link
            to="/employee/add-leads"
          >
            <div className={`sidebar-menu ${location.pathname === "/employee/add-leads" ? "active-menu " : ""}`}  >

              <PlusCircle
                size={18}
              />

              Add Lead

            </div>
          </Link>

          <Link
            to="/employee/followups"
          >
            <div className={`sidebar-menu ${location.pathname === "/employee/followups" ? "active-menu " : ""}`} >

              <PhoneCall
                size={18}
              />

              Follow Ups

            </div>
          </Link>

          <Link
            to="/employee/profile"
          >
            <div className="sidebar-menu">

              <User
                size={18}
              />

              Profile

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