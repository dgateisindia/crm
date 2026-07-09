import { useState, useEffect } from "react";
import api from "../../utils/api";
import EmployeeLayout from "../../layouts/EmployeeLayout";

import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff
 
} from "lucide-react";

import "../../styles/employeeprofile.css";

export default function EmployeeProfile() {

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [passwords,setPasswords]=useState({
      newPassword:"",
      confirmPassword:""
  });

  const [showPassword,setShowPassword]=useState(false);

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

      const user = JSON.parse(
        localStorage.getItem("user")
      );

      const { data } = await api.get(
        `/employee/profile/${user.id}`
      );

    setProfile(data);

    }

    catch (err) {

      console.log(err);

      alert("Failed to load profile.");

    }

    finally {

      setLoading(false);

    }

  };
useEffect(() => {

    let mounted = true;

    const loadProfile = async () => {

        try {

            const user = JSON.parse(
                localStorage.getItem("user")
            );

            const { data } = await api.get(
                `/employee/profile/${user.id}`
            );

            if (mounted) {

                setProfile(data);

                setLoading(false);

            }

        } catch (err) {

            console.log(err);

        }

    };

    loadProfile();

    return () => {

        mounted = false;

    };

}, []);

  


  // ===============================
  // Loading Screen
  // ===============================

  if (loading) {

    return (

      <EmployeeLayout>

        <div className="profileLoading">

          Loading Profile...

        </div>

      </EmployeeLayout>

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

        `/employee/update-profile/${profile.employee_id}`,

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

  // ===============================
  // Change Password
  // ===============================

  const updatePassword = async () => {

    if (!passwords.newPassword.trim()) {

        return alert("Please enter a new password.");

    }

    if (passwords.newPassword.length < 6) {

        return alert("Password must be at least 6 characters.");

    }

    if (passwords.newPassword !== passwords.confirmPassword) {

        return alert("Passwords do not match.");

    }

    try {

        await api.put(

            `/employee/change-password/${profile.employee_id}`,

            {
                newPassword: passwords.newPassword
            }

        );

        alert("Password Updated Successfully");

        setPasswords({

            newPassword: "",
            confirmPassword: ""

        });

    }

    catch (err) {

        console.log(err);

        alert("Failed to update password");

    }

};
    return (

    <EmployeeLayout>

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

                  {profile.employee_code}

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

                    onClick={updateProfile}

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

                  onClick={startEditing}

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


           

            {/* Password Card */}


            <div className="infoCard">

                <h2>Security</h2>

                {/* New Password */}

                <div className="passwordBox">

                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="New Password"
                        value={passwords.newPassword}
                        onChange={(e)=>
                            setPasswords({
                                ...passwords,
                                newPassword:e.target.value
                            })
                        }
                    />

                    <button
                        type="button"
                        className="eyeBtn"
                        onClick={()=>
                            setShowPassword(!showPassword)
                        }
                    >
                        {
                            showPassword
                            ?
                            <Eye size={18}/>
                            :
                            <EyeOff size={18}/>
                        }
                    </button>

                </div>


                {/* Confirm Password */}

                <div className="passwordBox">

                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={passwords.confirmPassword}
                        onChange={(e)=>
                            setPasswords({
                                ...passwords,
                                confirmPassword:e.target.value
                            })
                        }
                    />

                    <button
                        type="button"
                        className="eyeBtn"
                        onClick={()=>
                            setShowPassword(!showPassword)
                        }
                    >
                        {
                            showPassword
                            ?
                            <Eye size={18}/>
                            :
                            <EyeOff size={18}/>
                        }
                    </button>

                </div>

                <button
                    className="passwordBtn"
                    onClick={updatePassword}
                >
                    Update Password
                </button>

            </div>

          </div>

        </div>

      </div>

    </EmployeeLayout>

  );

}