import {
  useState,
  useEffect
} from "react";

import axios from "axios";
import "../../styles/employeeprofile.css";
import EmployeeLayout
from "../../layouts/EmployeeLayout";

export default function EmployeeProfile() {

  const [profile,
  setProfile] =
  useState({});

  const [password,
  setPassword] =
  useState("");

  useEffect(() => {

    const fetchProfile =
    async () => {

      try {

        const user =
        JSON.parse(
          localStorage.getItem(
            "user"
          )
        );

        const response =
        await axios.get(

          `http://localhost:5000/api/employee/profile/${user.id}`

        );

        setProfile(
          response.data
        );

      }

      catch (error) {

        console.log(error);

      }

    };

    fetchProfile();

  }, []);

  const updatePassword =
  async () => {

    try {

      await axios.put(

        `http://localhost:5000/api/employee/change-password/${profile.id}`,

        {

          newPassword:
          password

        }

      );

      alert(
        "Password Updated"
      );

      setPassword("");

    }

    catch (error) {

      console.log(error);

    }

  };
  console.log(profile);

  return (

    <EmployeeLayout>

<div className="settings-page">

  {/* Left Settings Menu */}

  <div className="settings-sidebar">

    <h2 className="settings-title">
      Settings
    </h2>

    <div className="settings-menu active">
      Profile & Account
    </div>

    <div className="settings-menu">
      Company Settings
    </div>

    <div className="settings-menu">
      User Management
    </div>

    <div className="settings-menu">
      Roles & Permissions
    </div>

    <div className="settings-menu">
      Notifications
    </div>

    <div className="settings-menu">
      Security
    </div>

    <div className="settings-menu">
      Activity Log
    </div>

  </div>

  {/* Right Content */}

  <div className="settings-content">

    {/* Profile Card */}

    <div className="profile-info-card">

      <div className="profile-card-header">

        <h3>
          Profile Information
        </h3>

        <button className="edit-btn">
          Edit Profile
        </button>

      </div>

      <div className="profile-body">

        <img
          src="https://i.pravatar.cc/150"
          alt=""
          className="profile-avatar"
        />

        <div className="profile-column">

          <div>
            <span>Full Name</span>
            <h4>{profile.full_name}</h4>
          </div>

          <div>
            <span>Email</span>
            <h4>{profile.email}</h4>
          </div>

          <div>
            <span>Phone</span>
            <h4>{profile.phone}</h4>
          </div>

        </div>

        <div className="profile-column">

          <div>
            <span>Designation</span>
            <h4>{profile.designation}</h4>
          </div>

          <div>
            <span>Employee ID</span>
            <h4>{profile.employee_code}</h4>
          </div>

          <div>
            <span>Department</span>
            <h4>{profile.department}</h4>
          </div>

        </div>

      </div>

    </div>

    {/* Company Card */}

    <div className="company-card">

      <h3>
        Company Information
      </h3>

      <div className="company-grid">

        <div>
          <span>Company Name</span>
          <h4>DGATE CRM</h4>
        </div>

        <div>
          <span>Status</span>
          <h4>{profile.status}</h4>
        </div>

      </div>

    </div>

    {/* Settings Tiles */}

    <div className="settings-grid">

      <div className="settings-tile">
        <h4>Security</h4>
        <p>Password & Access Control</p>
      </div>

      <div className="settings-tile">
        <h4>Notifications</h4>
        <p>Email & CRM Alerts</p>
      </div>

      <div className="settings-tile">
        <h4>Task Settings</h4>
        <p>Task Management</p>
      </div>

      <div className="settings-tile">
        <h4>Followup Settings</h4>
        <p>Schedule Management</p>
      </div>

      <div className="settings-tile">
        <h4>Data & Privacy</h4>
        <p>Personal Data Controls</p>
      </div>

      <div className="settings-tile">
        <h4>Activity Log</h4>
        <p>User Activities</p>
      </div>

    </div>

    {/* Change Password */}

    <div className="password-card">

      <h3>
        Change Password
      </h3>

      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e)=>
          setPassword(
            e.target.value
          )
        }
      />

      <button
        onClick={
          updatePassword
        }
      >
        Update Password
      </button>

    </div>

  </div>

</div>

</EmployeeLayout>
  );
}