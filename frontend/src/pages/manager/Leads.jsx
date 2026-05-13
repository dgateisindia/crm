import axios from "axios";
import { useState } from "react";
import { useLocation } from "react-router-dom";

import ManagerLayout from "../../layouts/ManagerLayout";
import "../../styles/leads.css";

import {
  Upload,
  UserPlus,
} from "lucide-react";

export default function Leads() {

  const location = useLocation();

  const isAddLead =
    location.pathname ===
    "/manager/add-leads";

  const [leadData, setLeadData] =
    useState({
      company_name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      website: "",
      special_event: "",
      event_date: "",
      lead_status: "",
      assigned_employee: "",
      remarks: "",
    });

  // Handle Input Change
  const handleChange = (e) => {

    setLeadData({
      ...leadData,
      [e.target.name]:
        e.target.value,
    });
  };

  // Save Lead
  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        await axios.post(
          "http://localhost:5000/api/leads/add",
          leadData
        );

        alert(
          "Lead Added Successfully"
        );

        // Clear form
        setLeadData({
          company_name: "",
          contact_person: "",
          phone: "",
          email: "",
          address: "",
          website: "",
          special_event: "",
          event_date: "",
          lead_status: "",
          assigned_employee: "",
          remarks: "",
        });

      } catch (error) {

  console.log(error);

  alert(
    error.response?.data?.message ||
    "Failed to Add Lead"
  );
}
    };
  return (
    <ManagerLayout>

      {isAddLead ? (

        <div className="leads-container">

          {/* Header */}
          <div className="mb-6">

            <h1 className="leads-header-title">
              Add Leads
            </h1>

            <p className="leads-header-subtitle">
              Add leads manually or upload
              bulk leads using Excel.
            </p>

          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

            {/* Left Side */}
            <div className="xl:col-span-3 leads-card">

              <div className="flex items-center gap-3 mb-5">

                <div className="icon-wrapper-dark">
                  <UserPlus size={22} />
                </div>

                <div>

                  <h2 className="text-xl font-semibold text-[#071739]">
                    Lead Information
                  </h2>

                  <p className="text-sm text-gray-500">
                    Fill in lead details manually
                  </p>

                </div>

              </div>

              <form
                onSubmit={handleSubmit}
              >

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                  {/* Company Name */}
                  <input
                    type="text"
                    name="company_name"
                    placeholder="Company Name *"
                    className="leads-input"
                    required
                    value={
                      leadData.company_name
                    }
                    onChange={
                      handleChange
                    }
                    onInput={(e) => {
                      e.target.value =
                        e.target.value.replace(
                          /[^A-Za-z ]/g,
                          ""
                        );
                    }}
                  />

                  {/* Contact Person */}
                  <input
                    type="text"
                    name="contact_person"
                    placeholder="Contact Person Name *"
                    className="leads-input"
                    required
                    value={
                      leadData.contact_person
                    }
                    onChange={
                      handleChange
                    }
                    onInput={(e) => {
                      e.target.value =
                        e.target.value.replace(
                          /[^A-Za-z ]/g,
                          ""
                        );
                    }}
                  />

                  {/* Phone */}
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number *"
                    className="leads-input"
                    required
                    maxLength="10"
                    value={
                      leadData.phone
                    }
                    onChange={
                      handleChange
                    }
                    onInput={(e) => {
                      e.target.value =
                        e.target.value.replace(
                          /[^0-9]/g,
                          ""
                        );
                    }}
                  />

                  {/* Email */}
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address *"
                    className="leads-input"
                    required
                    value={
                      leadData.email
                    }
                    onChange={
                      handleChange
                    }
                  />

                  {/* Special Event */}
                  <input
                    type="text"
                    name="special_event"
                    placeholder="Special Event"
                    className="leads-input"
                    value={
                      leadData.special_event
                    }
                    onChange={
                      handleChange
                    }
                  />

                  {/* Event Date */}
                  <input
                    type="date"
                    name="event_date"
                    className="leads-input"
                    value={
                      leadData.event_date
                    }
                    onChange={
                      handleChange
                    }
                  />

                  {/* Address */}
                  <input
                    type="text"
                    name="address"
                    placeholder="Address *"
                    className="leads-input"
                    required
                    value={
                      leadData.address
                    }
                    onChange={
                      handleChange
                    }
                  />

                  {/* Website */}
                  <input
                    type="text"
                    name="website"
                    placeholder="Website"
                    className="leads-input"
                    value={
                      leadData.website
                    }
                    onChange={
                      handleChange
                    }
                  />

                  {/* Lead Status */}
                  <select
                    name="lead_status"
                    className="leads-select"
                    required
                    value={
                      leadData.lead_status
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="">
                      Lead Status *
                    </option>

                    <option>
                      New Lead
                    </option>

                    <option>
                      Contacted
                    </option>

                    <option>
                      Connected
                    </option>

                    <option>
                      Interested
                    </option>

                    <option>
                      Follow-up Required
                    </option>

                    <option>
                      Meeting Scheduled
                    </option>

                    <option>
                      Proposal Sent
                    </option>

                    <option>
                      Negotiation
                    </option>

                    <option>
                      Converted
                    </option>

                    <option>
                      Not Interested
                    </option>

                    <option>
                      Closed Lost
                    </option>

                  </select>

                  {/* Assign Employee */}
                  <select
                    name="assigned_employee"
                    className="leads-select"
                    required
                    value={
                      leadData.assigned_employee
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="">
                      Assign Employee *
                    </option>

                    <option>
                      Employee 1
                    </option>

                    <option>
                      Employee 2
                    </option>

                  </select>

                </div>

                {/* Remarks */}
                <textarea
                  rows="4"
                  placeholder="Remarks"
                  className="leads-input w-full mt-4"
                  name="remarks"
                  value={
                    leadData.remarks
                  }
                  onChange={
                    handleChange
                  }
                />

                <div className="flex justify-end mt-5">

                  <button
                    type="submit"
                    className="leads-btn-primary"
                  >
                    Save Lead
                  </button>

                </div>

              </form>

            </div>

            {/* Upload Card */}
            <div className="leads-card h-fit">

              <div className="flex items-center gap-3 mb-5">

                <div className="icon-wrapper-light">
                  <Upload size={22} />
                </div>

                <div>

                  <h2 className="font-semibold text-[#071739] text-lg">
                    Import Leads
                  </h2>

                  <p className="text-sm text-gray-500">
                    Upload Excel or CSV file
                  </p>

                </div>

              </div>

              <div className="upload-dropzone">
                Upload Area
              </div>

            </div>

          </div>

        </div>

      ) : (

        <div className="leads-container">

          <h1 className="leads-header-title">
            Total Leads
          </h1>

          <p className="leads-header-subtitle">
            View all leads added in CRM
          </p>

        </div>

      )}

    </ManagerLayout>
  );
}
