import axios from "axios";
import { useState,useEffect } from "react";
import { ArrowLeft, Upload, UserPlus } from "lucide-react";
import { useNavigate,useParams } from "react-router-dom";
import EmployeLayout from "../../layouts/EmployeeLayout";
import {Briefcase,PhoneCall} from "lucide-react";
import "../../styles/addlead.css";

function AddLeads() {

  const { id } = useParams();

  const [uploadType, setUploadType] = useState("leads");

  const [selectedFile, setSelectedFile] = useState(null);

  const [showUploadModal, setShowUploadModal] = useState(false);

  const [leadData, setLeadData] =
  useState({

    company_name: "",
    contact_person_name: "",
    designation: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    city: "",
    source: "",
    lead_mode: "",
    lead_status: "",
    remarks: "",
    important_lead: false,

  });
  const navigate = useNavigate();

        // ==========================
      // Fetch Existing Lead
      // ==========================

      useEffect(() => {

        const fetchLead =
        async () => {

          if (!id) return;

          try {

            const response =
            await axios.get(
              `http://localhost:5000/api/leads/${id}`
            );
            console.log(response.data);

            setLeadData({

              company_name:
              response.data.company_name || "",

              contact_person_name:
              response.data.contact_person_name || "",

              designation:
              response.data.designation || "",

              email:
              response.data.email || "",

              phone:
              response.data.phone || "",

              address:
              response.data.address || "",

              website:
              response.data.website || "",

              city:
              response.data.city || "",

              source:
              response.data.source || "",

              lead_mode:
              response.data.lead_mode || "",

              lead_status:
              response.data.lead_status || "",

              remarks:
              response.data.remarks || "",

              important_lead:
              response.data.important_lead || false,

            });

          }

          catch (error) {

            console.log(error);

          }

        };

        fetchLead();

      }, [id]);

  const handleChange =
  (e) => {

    const {

      name,
      value,
      type,
      checked

    } = e.target;

    setLeadData({

      ...leadData,

      [name]:

      type === "checkbox"
      ? checked
      : value,

    });

  };

  const handleFileChange =
  (e) => {

    setSelectedFile(
      e.target.files[0]
    );

  };

  const handleSubmit =
  async (e) => {

    e.preventDefault();

    try {

      const user =
      JSON.parse(
        localStorage.getItem(
          "user"
        )
      );

      if (id) {

          await axios.put(

            `http://localhost:5000/api/leads/update/${id}`,

            leadData

          );

          alert("Lead Updated Successfully");
          navigate("/employee/my-leads");

        }

        else {

          await axios.post(

            "http://localhost:5000/api/leads/add",

            {
              ...leadData,
              created_by_id:
              user?.id || 1,
              created_by_type:
              "employee",
              created_by_name:
              user?.full_name || "Employee Name",
            }

          );

          alert("Lead Added Successfully");
          navigate("/employee/my-leads");
        }
              

      setLeadData({

        company_name: "",
        contact_person_name: "",
        designation: "",
        email: "",
        phone: "",
        address: "",
        website: "",
        city: "",
        source: "",
        lead_mode: "",
        lead_status: "",
        remarks: "",
        important_lead: false,

      });

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

          const user =
          JSON.parse(

            localStorage.getItem(
              "user"
            )

          );

          const formData =
            new FormData();

            formData.append(
              "file",
              selectedFile
            );

            formData.append(
              "uploadType",
              uploadType
            );

            formData.append(
              "created_by_id",
              user?.id || 1
            );

            formData.append(
              "created_by_type",
              "employee"
            );

            formData.append(
              "created_by_name",
              user?.full_name || "Employee Name"
            );

      const uploadUrl =

          uploadType === "tasks"

          ? "http://localhost:5000/api/tasks/upload"

          : "http://localhost:5000/api/leads/upload";

          const response =
          await axios.post(

            uploadUrl,

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
          navigate("/employee/my-leads");

        }

       catch (error) {

  console.log(
    "UPLOAD ERROR:",
    error
  );

  alert(

    JSON.stringify(
      error.response?.data
    )

  );

}

      };

  return (

    <EmployeLayout>


        <div className="addLeadContainer employeeAddLead">

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
                  "/employee/my-leads"
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

                  <p>
                    Fill lead details
                  </p>

                </div>

              </div>

              <form
                onSubmit={handleSubmit}
              >

                <div className="formGrid">

                  <div className="formGroup">

                    <label>
                      Company Name *
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
                      Contact Person *
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
                      value={leadData.designation}
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

                      <option value="connected">
                        Connected
                      </option>

                      <option value="interested">
                        Interested
                      </option>

                      <option value="proposed">
                        Proposed
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

                <div className="formGroup">

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
                  >

                    Save Lead

                  </button>

                </div>

              </form>

            </div>

            {/* Right Sidebar */}
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
                    onClick={() =>
                      setShowUploadModal(true)
                    }
                  >
                    Upload Excel
                  </button>

                </div>

              </div>

            </div>

          </div>
          {
showUploadModal && (

<div className="crmModalOverlay">

  <div className="crmModalCard">

   <h2>
  Upload Excel File
</h2>

<p className="modalSubtitle">
  Select where the imported data should go
</p>

    <div
      style={{
        marginTop: "20px"
      }}
    >

      <label>
        Upload Type
      </label>

      <div className="uploadTypeGrid">

  <div
    className={`uploadCard ${
      uploadType === "leads"
        ? "active"
        : ""
    }`}
    onClick={() =>
      setUploadType("leads")
    }
  >
    <Briefcase size={36} />

    <h3>Leads</h3>

    <p>
      CRM prospects and leads
    </p>
  </div>

  <div
    className={`uploadCard ${
      uploadType === "tasks"
        ? "active"
        : ""
    }`}
    onClick={() =>
      setUploadType("tasks")
    }
  >
    <PhoneCall size={36} />

    <h3>Tasks</h3>

    <p>
      Employee calling list
    </p>
  </div>

</div>

    </div>

    <div
      style={{
        marginTop: "20px"
      }}
    >

      <button

        className="cancelButton"

        onClick={() =>
          setShowUploadModal(false)
        }

      >

        Cancel

      </button>

      <button

        className="saveButton"

        onClick={() => {

          handleUpload();

          setShowUploadModal(false);

        }}

      >

        Upload

      </button>

    </div>

  </div>

</div>

)}
    </EmployeLayout>

  );

}

export default AddLeads;