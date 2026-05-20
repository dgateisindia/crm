import axios from "axios";
import { useState } from "react";

import ManagerLayout from "../../layouts/ManagerLayout";

import "../../styles/Leads.css";

import {
  Upload,
  UserPlus,
  ArrowLeft,
} from "lucide-react";

function AddLeads() {

  const [leadData,setLeadData] = useState({

    company_name:"",
    contact_person_name:"",
    contact_person_number:"",
    email:"",
    phone:"",
    address:"",
    website:"",
    source:"",
    priority:"",
    city:"",
    lead_status:"",
    remarks:"",

  });

  const handleChange = (e) => {

    setLeadData({

      ...leadData,
      [e.target.name]:e.target.value,

    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await axios.post(
        "http://localhost:5000/api/leads/add",
        leadData
      );

      alert("Lead Added Successfully");

      setLeadData({

        company_name:"",
        contact_person_name:"",
        contact_person_number:"",
        email:"",
        phone:"",
        address:"",
        website:"",
        source:"",
        priority:"",
        city:"",
        lead_status:"",
        remarks:"",

      });

    }

    catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message ||
        "Failed to Add Lead"
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

          <button className="backBtn">

            <ArrowLeft size={16} />

            Back to Leads

          </button>

        </div>

        {/* Main Grid */}
        <div className="addLeadGrid">

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

                <p>
                  Fill in the details to add a new lead
                </p>

              </div>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="formGrid">

                <div className="formGroup">

                  <label>
                    Company Name *
                  </label>

                  <input
                    type="text"
                    name="company_name"
                    placeholder="Enter company name"
                    value={leadData.company_name}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="formGroup">

                  <label>
                    Contact Person Name *
                  </label>

                  <input
                    type="text"
                    name="contact_person_name"
                    placeholder="Enter contact person"
                    value={leadData.contact_person_name}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="formGroup">

                  <label>
                    Contact Person Number
                  </label>

                  <input
                    type="text"
                    name="contact_person_number"
                    placeholder="Enter contact number"
                    value={leadData.contact_person_number}
                    onChange={handleChange}
                  />

                </div>

                <div className="formGroup">

                  <label>
                    Phone *
                  </label>

                  <input
                    type="text"
                    name="phone"
                    placeholder="Enter phone"
                    value={leadData.phone}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="formGroup">

                  <label>
                    Email *
                  </label>

                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={leadData.email}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="formGroup">

                  <label>
                    Website
                  </label>

                  <input
                    type="text"
                    name="website"
                    placeholder="Enter website"
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
                    placeholder="Enter city"
                    value={leadData.city}
                    onChange={handleChange}
                  />

                </div>

                <div className="formGroup">

                  <label>
                    Address
                  </label>

                  <input
                    type="text"
                    name="address"
                    placeholder="Enter address"
                    value={leadData.address}
                    onChange={handleChange}
                  />

                </div>

                <div className="formGroup">

                  <label>
                    Select Source
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

                    <option value="referral">
                      Referral
                    </option>

                    <option value="walk_in">
                      Walk In
                    </option>

                  </select>

                </div>

                <div className="formGroup">

                  <label>
                    Select Priority
                  </label>

                  <select
                    name="priority"
                    value={leadData.priority}
                    onChange={handleChange}
                  >

                    <option value="">
                      Select Priority
                    </option>

                    <option value="low">
                      Low
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="high">
                      High
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
                      Select Lead Status
                    </option>

                    <option value="new">
                      New
                    </option>

                    <option value="contacted">
                      Contacted
                    </option>

                    <option value="qualified">
                      Qualified
                    </option>

                    <option value="proposal_sent">
                      Proposal Sent
                    </option>

                    <option value="converted">
                      Converted
                    </option>

                    <option value="lost">
                      Lost
                    </option>

                  </select>

                </div>

              </div>

              <div className="formGroup remarksBox">

                <label>
                  Remarks
                </label>

                <textarea
                  rows="4"
                  name="remarks"
                  placeholder="Enter remarks"
                  value={leadData.remarks}
                  onChange={handleChange}
                />

              </div>

              <div className="submitArea">

                <button
                  type="submit"
                  className="saveLeadBtn"
                >
                  Save Lead
                </button>

              </div>

            </form>

          </div>

          {/* Right Sidebar */}
          <div className="leadSidebar">

            <div className="sidebarCard">

              <div className="sidebarHeader">

                <Upload size={18} />

                <h3>
                  IMPORT LEADS
                </h3>

              </div>

              <p className="sidebarText">
                Upload CSV or Excel file
              </p>

              <div className="uploadDropzone">

                Drag & Drop File Here

                <button>
                  Choose File
                </button>

              </div>

            </div>

            <div className="sidebarCard">

              <h3>
                Lead Source
              </h3>

              <div className="radioGroup">

                <label>
                  <input type="radio" />
                  Website
                </label>

                <label>
                  <input type="radio" />
                  Facebook
                </label>

                <label>
                  <input type="radio" />
                  Instagram
                </label>

                <label>
                  <input type="radio" />
                  Referral
                </label>

              </div>

            </div>

            <div className="sidebarCard">

              <h3>
                Tips
              </h3>

              <ul className="tipsList">

                <li>
                  All required fields are mandatory
                </li>

                <li>
                  Verify phone number and email
                </li>

                <li>
                  Use correct lead source
                </li>

              </ul>

            </div>

          </div>

        </div>

        </div>

    </div>

    </ManagerLayout>

  );

}
export default AddLeads;
