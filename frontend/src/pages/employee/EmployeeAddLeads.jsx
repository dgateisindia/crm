import api from "../../utils/api";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Upload, UserPlus } from "lucide-react";
import { useNavigate,useParams,useLocation } from "react-router-dom";
import EmployeLayout from "../../layouts/EmployeeLayout";
//import {Briefcase,PhoneCall} from "lucide-react";
import "../../styles/addLead.css";
import {useSearchParams} from "react-router-dom";
import ExcelImportGuide from "../../components/ExcelImportGuide.jsx";

function AddLeads() {

  const { id } = useParams();

  //const [uploadType, setUploadType] = useState("leads");

  const [selectedFile, setSelectedFile] = useState(null);

  const [uploadResult, setUploadResult] = useState(null);
  const [uploading, setUploading] = useState(false);

  //const [showUploadModal, setShowUploadModal] = useState(false);

  const location = useLocation();

  const [searchParams] =
useSearchParams();

const from =
searchParams.get("from");

const fileInputRef = useRef(null);
const autoPickerOpened = useRef(false);

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
    category: "",
    source: "",
    lead_mode: "",
    lead_status: "",
    remarks: "",
    important_lead: false,

  });
  const navigate = useNavigate();

  useEffect(() => {
  if (!location.state?.openFilePicker) {
    autoPickerOpened.current = false;
    return;
  }

  if (autoPickerOpened.current || !fileInputRef.current) {
    return;
  }

  autoPickerOpened.current = true;

  // Open the existing Excel/CSV file picker.
  fileInputRef.current.click();

  // Clear navigation state so it doesn't reopen unexpectedly.
  navigate(
    {
      pathname: location.pathname,
      search: location.search,
    },
    {
      replace: true,
      state: null,
    }
  );
}, [
  location.state,
  location.pathname,
  location.search,
  navigate,
]);
        // ==========================
      // Fetch Existing Lead
      // ==========================

      useEffect(() => {

        const fetchLead =
        async () => {

          if (!id) return;

          try {

            const response =
            await  api.get(
              `/leads/${id}`
            );
            console.log("EDIT LEAD DATA:", response.data);
console.log("CATEGORY FROM DB:", response.data.category);

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

              category:
              response.data.category || "",

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

  
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const user = JSON.parse(
      localStorage.getItem("user")
    );

    if (!leadData.company_name.trim()) {
      return alert("Company Name is required");
    }

    if (!leadData.phone.trim() && !leadData.email.trim()) {
      return alert(
        "Please enter either Phone Number or Email Address."
      );
    }

    if (
      leadData.phone &&
      !/^\d{10}$/.test(leadData.phone)
    ) {
      return alert(
        "Phone Number must contain exactly 10 digits"
      );
    }

    if (leadData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(leadData.email)) {
        return alert("Please enter a valid Email Address.");
      }
    }

    if (id) {
      await api.put(
        `/leads/update/${id}`,
        leadData
      );

      alert("Lead Updated Successfully");

      navigate(
        from === "tasks"
          ? "/employee/tasks"
          : "/employee/my-leads"
      );

    } else {
      await api.post("/leads/add", {
        ...leadData,
        created_by_id: user?.id || 1,
        created_by_type: "employee",
        created_by_name:
          user?.full_name || "Employee Name"
      });

      alert("Lead Added Successfully");
      navigate("/employee/my-leads");
    }

  } catch (error) {
    console.error("SAVE LEAD ERROR:", error);

    alert(
      error.response?.data?.message ||
      "Failed to Save Lead"
    );
  }
};

 
const handleUpload = async () => {
  if (!selectedFile) {
    setUploadResult({
      success: false,
      message: "Please select an Excel or CSV file.",
      totalRows: 0,
      inserted: 0,
      duplicates: 0,
      invalid: 0,
      errors: []
    });
    return;
  }

  setUploading(true);
  setUploadResult(null);

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await api.post(
      "/tasks/upload",
      formData
    );

    setUploadResult(response.data);

  } catch (error) {
    console.error("EXCEL UPLOAD ERROR:", error);

    const data = error.response?.data;

    setUploadResult({
      success: false,
      message: data?.message || "Excel upload failed. Please try again.",
      totalRows: data?.totalRows ?? 0,
      inserted: data?.inserted ?? 0,
      duplicates: data?.duplicates ?? 0,
      invalid: data?.invalid ?? 0,
      errors: data?.errors || []
    });

  } finally {
    setUploading(false);
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
                  from === "tasks"
                  ? "/employee/tasks"
                  : "/employee/my-leads"
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
                      Contact Person Name
                    </label>

                    <input
                      type="text"
                      name="contact_person_name"
                      value={leadData.contact_person_name}
                      onChange={(e) => {

                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");

                        setLeadData({
                          ...leadData,
                          contact_person_name: value
                        });

                      }}
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
                      Category *
                    </label>

                    <select
                      name="category"
                      value={leadData.category}
                      onChange={handleChange}
                      required
                    >

                      <option value="">
                        Select Category
                      </option>

                      <option value="Real Estate">
                        Real Estate
                      </option>

                      <option value="Colleges">
                        Colleges
                      </option>

                      <option value="Nursing College">
                        Nursing College
                      </option>

                      <option value="IT Company">
                        IT Company
                      </option>

                      <option value="Gym">
                        Gym
                      </option>

                      <option value="Manufacturing">
                        Manufacturing
                      </option>

                      <option value="Government Sector / NGO">
                        Government Sector / NGO
                      </option>

                      <option value="Media & Advertising">
                        Media & Advertising
                      </option>

                      <option value="Healthcare / Hospital">
                        Healthcare / Hospital
                      </option>

                      <option value="HiYath">
                        HiYath
                      </option>

                      <option value="Logistics & Transport">
                        Logistics & Transport
                      </option>

                      <option value="Banks">
                        Banks
                      </option>

                      <option value="E-Commerce">
                        E-Commerce
                      </option>

                      <option value="Professional Services">
                        Professional Services
                      </option>

                      <option value="Freelance">
                        Freelance
                      </option>

                    </select>

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

                      <option value="phone call">
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

                      <option value="proposed">
                        Proposed
                      </option>

                      <option value="offered">
                        Offered
                      </option>

                      <option value="meeting scheduled">
                        meeting scheduled
                      </option>

                      <option value="not interested">
                        Not Interested
                      </option>

                      <option value="converted">
                        Converted
                      </option>

                      <option value="sponsorship">
                        Sponsorship
                      </option>

                      <option value="invalid">
                        Invalid
                      </option>

                      <option value="not responded">
                        Not Responded 
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
                    IMPORT DATA
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
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
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
                    type="button"
                    className="uploadBtn"
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    {uploading ? "Importing..." : "Upload Excel"}
                  </button>
                  

                </div>
                <ExcelImportGuide />

              </div>

            </div>

          </div>
          
            {uploadResult && (
              <div className="excelModalOverlay">
                <div
                  className="excelModal"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="excelModalTitle"
                >
                  <button
                    type="button"
                    className="excelModalClose"
                    onClick={() => setUploadResult(null)}
                    aria-label="Close import summary"
                  >
                    ×
                  </button>

                  <div className="excelModalIcon">
                    {Number(uploadResult.inserted || 0) > 0 ? "✓" : "!"}
                  </div>

                  <h2 id="excelModalTitle">
                    {Number(uploadResult.inserted || 0) > 0
                      ? Number(uploadResult.duplicates || 0) > 0 ||
                        Number(uploadResult.invalid || 0) > 0
                        ? "Partially Imported"
                        : "Import Successful"
                      : Number(uploadResult.duplicates || 0) > 0
                        ? "No New Records"
                        : "Import Failed"}
                  </h2>

                  <p className="excelModalSubtitle">
                    {Number(uploadResult.inserted || 0) > 0
                      ? "Your Excel file has been processed."
                      : Number(uploadResult.duplicates || 0) > 0
                        ? "The uploaded records already exist or were skipped."
                        : uploadResult.message || "Unable to import records."}
                  </p>

                  <div className="excelModalStats">
                    {[
                      ["Total Rows", uploadResult.totalRows],
                      ["Imported", uploadResult.inserted],
                      ["Duplicates", uploadResult.duplicates],
                      ["Invalid", uploadResult.invalid]
                    ].map(([label, value]) => (
                      <div className="excelModalStat" key={label}>
                        <strong>{Number(value || 0)}</strong>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>

                  {uploadResult.errors?.length > 0 && (
                    <details className="excelModalErrors">
                      <summary>
                        View {uploadResult.errors.length} skipped or invalid rows
                      </summary>

                      <div className="excelModalErrorList">
                        {uploadResult.errors.map((error, index) => (
                          <p key={index}>
                            <strong>Row {error.row ?? "N/A"}:</strong>{" "}
                            {error.reason || "Record could not be imported"}
                          </p>
                        ))}
                      </div>
                    </details>
                  )}

                  <div className="excelModalActions">
                    <button
                      type="button"
                      className="excelModalSecondary"
                      onClick={() => setUploadResult(null)}
                    >
                      Close
                    </button>

                    <button
                      type="button"
                      className="excelModalPrimary"
                      onClick={() => {
                        setUploadResult(null);
                        navigate("/employee/my-leads");
                      }}
                    >
                      View Leads
                    </button>
                  </div>
                </div>
              </div>
            )}

          
    </EmployeLayout>

  );

}

export default AddLeads;