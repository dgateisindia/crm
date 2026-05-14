import axios from "axios";
import { useState } from "react";

import EmployeeLayout
from "../../layouts/EmployeeLayout";

import "../../styles/leads.css";

import {
  Upload,
  UserPlus,
} from "lucide-react";

export default function EmployeeAddLeads() {

  const [leadData,
    setLeadData] =
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
      remarks: "",
    });

  const handleChange =
    (e) => {

      setLeadData({
        ...leadData,
        [e.target.name]:
          e.target.value,
      });
    };

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {


        const userId =
                localStorage.getItem(
                "userId"
                );

                console.log(
                "User ID:",
                userId
                );

                await axios.post(
                "http://localhost:5000/api/leads/add",
                {
                ...leadData,
                created_by:
                    userId,
                }
                );

        alert(
          "Lead Added Successfully"
        );

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
          remarks: "",
        });

      } catch (error) {

        console.log(error);

        alert(
          error.response?.data
            ?.message ||
          "Failed to Add Lead"
        );
      }
    };

  return (
    <EmployeeLayout>

      <div className="leads-container">

        {/* Header */}
        <div className="mb-6">

          <h1 className="leads-header-title">
            Add Lead
          </h1>

          <p className="leads-header-subtitle">
            Add new customer leads
          </p>

        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

          {/* Left */}
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
                  Fill lead details
                </p>

              </div>

            </div>

            <form
              onSubmit={
                handleSubmit
              }
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

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
                />

                <input
                  type="text"
                  name="contact_person"
                  placeholder="Contact Person *"
                  className="leads-input"
                  required
                  value={
                    leadData.contact_person
                  }
                  onChange={
                    handleChange
                  }
                />

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
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  className="leads-input"
                  value={
                    leadData.email
                  }
                  onChange={
                    handleChange
                  }
                />

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

                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  className="leads-input"
                  value={
                    leadData.address
                  }
                  onChange={
                    handleChange
                  }
                />

                

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
                    Connected
                  </option>

                  <option>
                    Interested
                  </option>

                  <option>
                    Follow-up Required
                  </option>

                  <option>
                    Converted
                  </option>

                </select>

              </div>

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

          {/* Upload */}
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
                  Upload Excel / CSV
                </p>

              </div>

            </div>

            <div className="upload-dropzone">
              Upload Area
            </div>

          </div>

        </div>

      </div>

    </EmployeeLayout>
  );
}