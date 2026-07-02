import api from "../../utils/api";
import { useState,useEffect } from "react";
import { ArrowLeft, Upload, UserPlus } from "lucide-react";
import { useNavigate,useParams } from "react-router-dom";
import ManagerLayout from "../../layouts/ManagerLayout";
import "../../styles/addlead.css";

function AddLeads() {

  const initialState = {

  company_name: "",

  contact_person_name: "",

  designation: "",

  email: "",

  phone: "",

  address: "",

  website: "",

  city: "",

  category: "",

  source: "",

  lead_mode: "",

  lead_status: "",

  remarks: "",

  important_lead: false

};

const [

leadData,

setLeadData

] =
useState(
initialState
);
  const [selectedFile, setSelectedFile] =
  useState(null);

  const navigate = useNavigate();

  const{id} = useParams();

    useEffect(() => {

    if (!id) {
      return;
    }

    const fetchLead = async () => {

        try {
          const response = await  api.get(
            `/leads/${id}`
          );

          setLeadData({
            company_name: response.data.company_name || "",
            contact_person_name: response.data.contact_person_name || "",
            email: response.data.email || "",
            phone: response.data.phone || "",
            address: response.data.address || "",
            website: response.data.website || "", 
            city: response.data.city || "",
            category: response.data.category || "",
            source: response.data.source || "",
            lead_mode: response.data.lead_mode || "",
            designation: response.data.designation || "",
            lead_status: response.data.lead_status || "",
            remarks: response.data.remarks || "",
            important_lead: response.data.important_lead || false,
          });
        }
        catch (error) {
          console.log(error);
          
        }
      };

      fetchLead();  
    },
    [id]);

  function handleChange(e) {

    const {

      name, value, type, checked

    } = e.target;

    setLeadData({
      ...leadData,

      [name]: type === "checkbox"
        ? checked
        : value,
    });

  }

  const handleFileChange =
  (e) => {

    setSelectedFile(
      e.target.files[0]
    );

  };

  const handleSubmit = async (e) => {

  e.preventDefault();

  // Either Phone or Email is required
  if (!leadData.phone.trim() && !leadData.email.trim()) {

    alert("Please enter either Phone Number or Email Address.");

    return;

  }

  // Phone validation
  if (
    leadData.phone &&
    leadData.phone.length !== 10
  ) {

    alert("Phone number must be exactly 10 digits.");

    return;

  }

  // Email validation
  if (leadData.email) {

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(leadData.email)) {

      alert("Please enter a valid Email Address.");

      return;

    }

  }

    try {

      const user =
      JSON.parse(
        localStorage.getItem(
          "user"
        )
      );

      if (id) {

  await  api.put(

`/leads/update/${id}`,

    

      leadData,


  );

  alert(
    "Lead Updated Successfully"
  );
navigate("/manager/leads");
}

else {

      await  api.post(

        "/leads/add",

        {

          ...leadData,

          created_by_id:

          user?.manager_id ||

          user?.id ||

          1,
          created_by_type:"manager",
          created_by_name:
          user?.full_name ||
          "Manager Name"

        }

      );

      alert(
        "Lead Added Successfully"
      );
      navigate("/manager/leads");

    }
      if (!id) {

        setLeadData(
          initialState
        );

      }

    }

    catch (error) {

      console.log(error);

      alert(

        error.response?.data
        ?.message ||

        "Failed to Add Lead"

      );

    }

  };
  const handleUpload =
      async () => {

        if (!selectedFile) {

          return alert(
            "Please select file"
          );

        }

        try {

         const user = JSON.parse(
            localStorage.getItem("user")
          );

          const formData = new FormData();

          formData.append(
            "file",
            selectedFile
          );

          formData.append(
            "created_by_id",
            user?.manager_id ||
            user?.id ||
            1
          );

          formData.append(
            "created_by_type",
            "manager"
          );

          formData.append(
              "created_by_name",
              user?.full_name ||
              "Manager Name"
            );

          const response =
          await  api.post(

            "/leads/upload",

            formData,

            {

              headers: {

                "Content-Type":
                "multipart/form-data"

              }

            }

          );

          alert(

            `${response.data.inserted}
            Leads Inserted

            ${response.data.duplicates}
            Duplicates Skipped`

          );
          navigate("/manager/leads");

        }

        catch (error) {

          console.log(error);

          alert(

            error.response?.data
            ?.message ||

            "Failed to Upload Leads"

          );

        }

      };
      

  return (

    <ManagerLayout>

      <div className="addLeadPage">

        <div className="addLeadContainer">

          {/* Header */}
          <div className="addLeadHeader">

            <div>

              <h1>
                ADD LEAD
              </h1>

              <p>
                Add lead manually
              </p>

            </div>

            <button
              className="backBtn"

              onClick={() =>
                navigate(
                  "/manager/leads"
                )
              }
              >

              <ArrowLeft
                size={16}
              />

              Back to Leads

            </button>

          </div>

          {/* Main Grid */}
          <div className="addLeadWrapper">

            {/* Left Form */}
            <div className="leadFormCard">

              <div className="leadInfoHeader">

                <div className="leadIcon">

                  <UserPlus size={20} />

                </div>

                <div>

                  <h2>
                    Lead Information
                  </h2>

                  
                </div>

              </div>

              <form
                onSubmit={handleSubmit}
              >

                <div className="formGrid">

                  <div className="formGroup">

                    <label>
                      Company Name 
                    </label>

                    <input
                      type="text"
                      name="company_name"
                      value={leadData.company_name}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  <div className="formGroup">

                    <label>
                      Contact Person 
                    </label>

                    <input
                      type="text"
                      name="contact_person_name"
                      value={leadData.contact_person_name}
                      onChange={handleChange}
                      required
                    />

                  </div>
                  
                  <div className="formGroup">
                    <label>

                    Designation

                    </label>

                    <input

                    type="text"

                    name="designation"

                    value={
                    leadData.designation
                    }

                    onChange={
                    handleChange
                    }

                    //placeholder="Enter Designation"

                    className="form-input"

                    />

                  </div>

                  <div className="formGroup">

                    <label>
                      Phone 
                    </label>

                  <input
                    type="text"
                    name="phone"
                    value={leadData.phone}
                    onChange={(e) => {

                      const value = e.target.value
                        .replace(/\D/g, "")   // Only digits
                        .slice(0, 10);        // Max 10 digits

                      setLeadData({
                        ...leadData,
                        phone: value
                      });

                    }}
                  />

                  </div>

                  <div className="formGroup">

                    <label>
                      Email 
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={leadData.email}
                      onChange={handleChange}
                      
                    />

                  </div>

                  <div className="formGroup">

                    <label>
                      Website
                    </label>

                    <input
                      type="text"
                      name="website"
                      value={leadData.website}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="formGroup">

                    <label>
                      City
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={leadData.city}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="formGroup">

                    <label>
                    Category
                    </label>

                    <input
                      type="text"
                      name="category"
                      value={leadData.category}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="formGroup fullWidth">

                    <label>
                      Address
                    </label>

                    <textarea
                      rows="3"
                      name="address"
                      value={leadData.address}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="formGroup">

                    <label>
                      Source
                    </label>

                    <select
                      name="source"
                      value={leadData.source}
                      onChange={handleChange}
                    >

                      <option value="">
                        Select Source
                      </option>

                      <option value="website">
                        Website
                      </option>

                      <option value="facebook">
                        Facebook
                      </option>

                      <option value="instagram">
                        Instagram
                      </option>

                      <option value="linkedin">
                        LinkedIn
                      </option>

                    </select>

                  </div>

                  <div className="formGroup">

                    <label>
                      Lead Mode
                    </label>

                    <select
                      name="lead_mode"
                      value={leadData.lead_mode}
                      onChange={handleChange}
                    >

                      <option value="">
                        Select Mode
                      </option>

                      <option value="phone_call">
                        Phone Call
                      </option>

                      <option value="message">
                        Message
                      </option>

                      <option value="email">
                        Email
                      </option>

                      <option value="walk_in">
                        Walk In
                      </option>

                      <option value="website">
                        Website
                      </option>

                      <option value="social_media">
                        Social Media
                      </option>

                    </select>

                  </div>

                  <div className="formGroup fullWidth">

                    <label>
                      Lead Status
                    </label>

                    <select
                      name="lead_status"
                      value={leadData.lead_status}
                      onChange={handleChange}
                    >

                      <option value="">
                        Select Status
                      </option>

                      <option value="new">
                        New
                      </option>
                      
                      <option value="interested">
                        Interested
                      </option>

                      <option value="proposal">
                        Proposal
                      </option>

                      <option value="offered">
                        Offered
                      </option>

                      <option value="meeting_scheduled">
                        Meeting Scheduled
                      </option>

                      <option value="not_interested">
                        Not Interested
                      </option>

                      <option value="converted">
                        Converted
                      </option>

                      <option value="closed">
                        Closed
                      </option>

                    </select>

                  </div>

                </div>

                <div className="formGroup fullWidth">

                  <label>
                    Remarks
                  </label>

                  <textarea
                    rows="4"
                    name="remarks"
                    value={leadData.remarks}
                    onChange={handleChange}
                  />

                </div>

                <div className="importantCheck">

                  <input
                    type="checkbox"
                    name="important_lead"
                    checked={leadData.important_lead}
                    onChange={handleChange}
                  />

                  <span>
                    Mark as Important Lead
                  </span>

                </div>

                <div className="submitArea">

                  <button
                    type="submit"
                    className="saveLeadBtn"
                  >{id ? "Update Lead" : "Save Lead"}

                  </button>

                </div>

              </form>

            </div>

            {/* Right Sidebar */}
            <div className="leadSidebar">

              <div className="importCard">

                <div className="sidebarHeader">

                  <Upload size={18} />

                  <h3>
                    IMPORT LEADS
                  </h3>

                </div>

                <p>
                  Upload Excel / CSV
                </p>

                <div className="uploadBox">

                  <label
                    className="fileUploadLabel"
                  >

                    Choose Excel File

                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={
                        handleFileChange
                      }
                      hidden
                    />

                  </label>

                  {

                    selectedFile && (

                      <p className="fileName">

                        {
                          selectedFile.name
                        }

                      </p>

                    )

                  }

                  <button
                    className="uploadBtn"
                    onClick={
                      handleUpload
                    }
                  >

                    Upload Leads

                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </ManagerLayout>

  );

}

export default AddLeads;