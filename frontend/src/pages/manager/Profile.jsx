import { UserButton } from "@clerk/react";
import { useSubscription } from "../../context/SubscriptionContext";
import { useState, useEffect } from "react";
import api from "../../utils/api";
import ManagerLayout from "../../layouts/ManagerLayout";

import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Edit3,
  Save,
  X,
} from "lucide-react";

import "../../styles/employeeprofile.css";

export default function ManagerProfile() {
  const { canWrite = false } = useSubscription() || {};


  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  

  const [isEditing, setIsEditing] = useState(false);

  const [editData, setEditData] = useState({
    full_name: "",
    phone: "",
    designation: ""
  });

  // ===============================
  // Fetch Employee Profile
  // ===============================

  const fetchProfile = async () => {
    try {

        const currentUserResponse =
            await api.get("/auth/current-user");

        const manager =
            currentUserResponse.data.manager;

        console.log("MANAGER PROFILE:", manager);

        if (!manager) {
            throw new Error("Manager profile not found.");
        }

        setProfile(manager);

        setEditData({
            full_name: manager.full_name || "",
            phone: manager.phone || "",
            designation: manager.designation || ""
        });

    } catch (err) {

        console.error(
            "Failed to load manager profile:",
            err
        );

        alert("Failed to load profile.");

    } finally {

        setLoading(false);

    }
};

useEffect(() => {
    fetchProfile();
}, []);

  


  // ===============================
  // Loading Screen
  // ===============================

  if (loading) {

    return (

      <ManagerLayout>

        <div className="profileLoading">

          Loading Profile...

        </div>

      </ManagerLayout>

    );

  }

  // ===============================
  // Input Change
  // ===============================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setEditData((prev) => ({

      ...prev,

      [name]: value

    }));

  };

  // ===============================
  // Phone Change
  // ===============================

  const handlePhoneChange = (e) => {

    const value = e.target.value

      .replace(/\D/g, "")

      .slice(0, 10);

    setEditData((prev) => ({

      ...prev,

      phone: value

    }));

  };

  // ===============================
  // Edit Button
  // ===============================

  const startEditing = () => {
    if (!canWrite) return;


    setEditData({

        full_name: profile.full_name || "",

        phone: profile.phone || "",

        designation: profile.designation || ""

    });

    setIsEditing(true);

};

  // ===============================
  // Cancel Button
  // ===============================

  const cancelEditing = () => {

    setEditData({

      full_name: profile.full_name,

      phone: profile.phone,

      designation: profile.designation

    });

    setIsEditing(false);

  };

  // ===============================
  // Update Profile
  // ===============================

  const updateProfile = async () => {
    if (!canWrite) return;


    if (!editData.full_name.trim()) {

      return alert("Full Name is required.");

    }

    if (!/^\d{10}$/.test(editData.phone)) {

      return alert(
        "Phone number must contain exactly 10 digits."
      );

    }

    try {

      await api.put(

        `/managers/update-profile/${profile.manager_id}`,

        editData

      );

      alert(
        "Profile Updated Successfully."
      );

      await fetchProfile();

      setIsEditing(false);

    }

    catch (err) {

      console.log(err);

      alert("Failed to update profile.");

    }

  };

  
    return (

    <ManagerLayout>

      <div className="profilePage">

        {/* ================= HERO ================= */}

        <div className="profileHero">

          <div className="heroLeft">

            <div className="heroAvatar">

              {

                profile.full_name

                  ?.split(" ")

                  .map(word => word[0])

                  .join("")

                  .toUpperCase()

              }

            </div>

            <div className="heroContent">

              <h1>

                {profile.full_name}

              </h1>

              <p>

                {profile.designation}

              </p>

              <div className="heroMeta">

                <span>

                  <Building2 size={15}/>

                  DGATE CRM

                </span>

                <span>

                  <Briefcase size={15}/>

                  {profile.manager_code}

                </span>

              </div>

            </div>

          </div>

          <div className="statusBadge">

            <span className="statusDot"></span>

            {profile.status}

          </div>

        </div>


        {/* ================= MAIN ================= */}

        <div className="profileContainer">


          {/* LEFT SIDE */}


          <div className="profileCard">

            <div className="cardHeader">

              <h2>

                Personal Information

              </h2>

              {

                isEditing ?

                <div className="actionButtons">

                  <button

                    className="saveBtn"

                    onClick={updateProfile} disabled={!canWrite}

                  >

                    <Save size={16}/>

                    Save

                  </button>

                  <button

                    className="cancelBtn"

                    onClick={cancelEditing}

                  >

                    <X size={16}/>

                    Cancel

                  </button>

                </div>

                :

                <button

                  className="editBtn"

                  onClick={startEditing} disabled={!canWrite}

                >

                  <Edit3 size={16}/>

                  Edit Profile

                </button>

              }

            </div>


            <div className="formGrid">


              {/* Name */}


              <div className="formGroup">

                <label>

                  <User size={16}/>

                  Full Name

                </label>

                {

                  isEditing ?

                  <input

                    type="text"

                    name="full_name"

                    value={editData.full_name}

                    onChange={handleChange}

                  />

                  :

                  <p>

                    {profile.full_name}

                  </p>

                }

              </div>


              {/* Email */}


              <div className="formGroup">

                <label>

                  <Mail size={16}/>

                  Email

                </label>

                <p>

                  {profile.email}

                </p>

              </div>


              {/* Phone */}


              <div className="formGroup">

                <label>

                  <Phone size={16}/>

                  Phone Number

                </label>

                {

                  isEditing ?

                  <input

                    type="text"

                    maxLength={10}

                    value={editData.phone}

                    onChange={handlePhoneChange}

                  />

                  :

                  <p>

                    {profile.phone}

                  </p>

                }

              </div>


              {/* Designation */}


              <div className="formGroup">

                <label>

                  <Briefcase size={16}/>

                  Designation

                </label>

                {

                  isEditing ?

                  <input

                    type="text"

                    name="designation"

                    value={editData.designation}

                    onChange={handleChange}

                  />

                  :

                  <p>

                    {profile.designation}

                  </p>

                }

              </div>

            </div>

          </div>



          {/* RIGHT SIDE */}


          <div className="rightPanel">


           

            {/* Clerk Account Security */}
<div className="infoCard">
  <h2>Account Security</h2>
  <p>Manage your D-GATE Account security.</p>
  <UserButton />
</div>

          </div>

        </div>

      </div>

    </ManagerLayout>

  );

}