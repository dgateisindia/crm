import api from "../../utils/api";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Upload, UserPlus } from "lucide-react";
import {
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import ManagerLayout from "../../layouts/ManagerLayout";
import "../../styles/addLead.css";
import ExcelImportGuide from "../../components/ExcelImportGuide.jsx";


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
  important_lead: false,
  assigned_employee_id: ""
};

const [

leadData,

setLeadData

] =
useState(
initialState
);
  
  const navigate = useNavigate();
  

  const{id} = useParams();

  const [selectedFile, setSelectedFile] =
  useState(null);

  const [employees, setEmployees] = useState([]);

  const [previewData, setPreviewData] = useState(null);

  const [allocation, setAllocation] = useState({});

  const [uploading, setUploading] = useState(false);

  const [showAllocationModal, setShowAllocationModal] =
  useState(false);

  const location = useLocation();

  const fileInputRef = useRef(null);
  const autoPickerOpened = useRef(false);

  const [employeeSearch, setEmployeeSearch] = useState("");

 useEffect(() => {
  if (!location.state?.openFilePicker) {
    autoPickerOpened.current = false;
    return;
  }

  if (autoPickerOpened.current || !fileInputRef.current) {
    return;
  }

  autoPickerOpened.current = true;

  fileInputRef.current.click();

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
  useEffect(() => {
  const fetchEmployees = async () => {
    try {
      const response = await api.get(
        "/leads/assignment-employees"
      );

      setEmployees(
        response.data.employees || []
      );

    } catch (error) {
      console.error(
        "Failed to fetch employees:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to load employees."
      );
    }
  };

  fetchEmployees();

}, []);

    useEffect(() => {

    if (!id) {
      return;
    }

    const fetchLead = async () => {

        try {
          const response = await  api.get(
            `/leads/${id}`
          );
          console.log(response.data);

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
            assigned_employee_id:
              response.data.assigned_employee_id || "",
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
  const handleUpload = async () => {

  if (!selectedFile) {
    return alert("Please select file");
  }


  // ======================================
  // STEP 1 — PREVIEW
  // ======================================

  if (!previewData) {

    try {

      setUploading(true);


      const formData = new FormData();

      formData.append(
        "file",
        selectedFile
      );


      const response = await api.post(
        "/leads/upload-preview",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data"
          }
        }
      );

// ======================================
// Check if there are any new leads
// ======================================

if (Number(response.data.validRows || 0) === 0) {

  alert(
    "No new leads found. All records in this file already exist."
  );

  setPreviewData(null);
  setAllocation({});
  setShowAllocationModal(false);

  return;
}


// ======================================
// Store preview data
// ======================================

setPreviewData(response.data);


// ======================================
// Auto-allocate if only one employee
// ======================================

if (
  employees.length === 1 &&
  response.data.validRows > 0
) {

  setAllocation({
    [employees[0].employee_id]:
      response.data.validRows
  });

} else {

  setAllocation({});

}


setShowAllocationModal(true);

    setShowAllocationModal(true);

      // ----------------------------------
      // If only one employee exists,
      // automatically suggest all leads
      // to that employee.
      // ----------------------------------

      if (
        employees.length === 1 &&
        response.data.validRows > 0
      ) {

        setAllocation({
          [employees[0].employee_id]:
            response.data.validRows
        });

      } else {

        setAllocation({});

      }


    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to preview Excel file."
      );

    } finally {

      setUploading(false);

    }

    return;
  }


  // ======================================
  // STEP 2 — FINAL UPLOAD
  // ======================================

  try {

    setUploading(true);


    const allocationArray =
      Object.entries(allocation)
        .filter(
          ([, count]) =>
            Number(count) > 0
        )
        .map(
          ([employee_id, count]) => ({
            employee_id:
              Number(employee_id),

            count:
              Number(count)
          })
        );


    // ----------------------------------
    // Check allocation total
    // ----------------------------------

    const allocatedTotal =
      allocationArray.reduce(
        (total, item) =>
          total + item.count,
        0
      );


    if (
      allocatedTotal !==
      previewData.validRows
    ) {

      alert(
        `Allocated leads (${allocatedTotal}) must equal valid leads (${previewData.validRows}).`
      );

      return;
    }


    // ----------------------------------
    // Prepare final upload
    // ----------------------------------

    const formData = new FormData();


    formData.append(
      "file",
      selectedFile
    );


    formData.append(
      "allocation",
      JSON.stringify(
        allocationArray
      )
    );


    const response =
      await api.post(
        "/leads/upload",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data"
          }
        }
      );


    // ----------------------------------
    // Result message
    // ----------------------------------

    let message =
      `${response.data.inserted} Records Inserted\n\n`;


    if (
      response.data.errors &&
      response.data.errors.length > 0
    ) {

      message +=
        `${response.data.duplicates} Rows Skipped\n\n`;


      response.data.errors.forEach(
        (error) => {

          message +=
            `Row ${error.row} : ${error.reason}\n`;

        }
      );

    }


    alert(message);


    navigate(
      "/manager/leads"
    );


  } catch (error) {

    console.error(error);

    alert(
      error.response?.data?.message ||
      "Failed to Upload Leads"
    );

  } finally {

    setUploading(false);

  }

};
const handleAllocationChange = (
  employeeId,
  value
) => {

  if (!previewData) return;

  const validLeads =
    Number(previewData.validRows || 0);

  if (value === "") {

    setAllocation(prev => ({
      ...prev,
      [employeeId]: ""
    }));

    return;
  }

  let numericValue =
    Number(value);

  if (
    Number.isNaN(numericValue)
  ) {
    numericValue = 0;
  }

  numericValue =
    Math.max(
      0,
      Math.floor(numericValue)
    );


  // --------------------------------------
  // Calculate allocation of other employees
  // --------------------------------------

  const otherAllocated =
    Object.entries(allocation)
      .filter(
        ([id]) =>
          Number(id) !==
          Number(employeeId)
      )
      .reduce(
        (total, [, count]) =>
          total +
          Number(count || 0),
        0
      );


  const maximumAllowed =
    Math.max(
      0,
      validLeads -
      otherAllocated
    );


  numericValue =
    Math.min(
      numericValue,
      maximumAllowed
    );


  setAllocation(prev => ({
    ...prev,
    [employeeId]:
      numericValue
  }));

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
                        proposed
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

                <div className="formGroup fullWidth">
                  <label>
                    Assign To Employee *
                  </label>

                  <select
                    name="assigned_employee_id"
                    value={leadData.assigned_employee_id}
                    onChange={handleChange}
                    required={!id}
                  >
                    <option value="">
                      Select Employee
                    </option>

                    {employees.map((employee) => (
                      <option
                        key={employee.employee_id}
                        value={employee.employee_id}
                      >
                        {employee.full_name} - {employee.employee_code}
                      </option>
                    ))}
                  </select>
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

                  <label className="fileUploadLabel">
                    Choose Excel File

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                      hidden
                    />
                  </label>

                  {selectedFile && (
                    <p className="fileName">
                      {selectedFile.name}
                    </p>
                  )}

                  <button
                    className="uploadBtn"
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    {uploading
                      ? "Processing..."
                      : previewData
                        ? "Preview Again"
                        : "Preview Leads"}
                  </button>

                </div>
                <ExcelImportGuide />

              </div>

            </div>

          </div>
          {/* End addLeadWrapper */}


          {/* Allocation Modal */}
          {showAllocationModal && previewData && (
            <div className="allocationModalOverlay">

              <div className="allocationModal">

                {/* Header */}
                <div className="allocationModalHeader">

                  <div>
                    <h2>
                      Assign Leads
                    </h2>

                    <p>
                      Distribute the valid leads among employees.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="allocationCloseBtn"
                    onClick={() =>
                      setShowAllocationModal(false)
                    }
                  >
                    ×
                  </button>

                </div>


                {/* Summary */}
                <div className="allocationModalSummary">

                  <div className="allocationStat">

                    <span>
                      Valid Leads
                    </span>

                    <strong>
                      {previewData.validRows}
                    </strong>

                  </div>


                  <div className="allocationStat">

                    <span>
                      Allocated
                    </span>

                    <strong>
                      {
                        Object.values(allocation).reduce(
                          (total, count) =>
                            total + Number(count || 0),
                          0
                        )
                      }

                      {" / "}

                      {previewData.validRows}
                    </strong>

                  </div>

                </div>

                  {/* Employees */}
                  <div className="allocationEmployeeSection">
                    <div className="allocationEmployeeToolbar">
                      <label htmlFor="allocationEmployeeSearch">
                        Employees
                      </label>

                      <span>
                        {employees.filter((employee) =>
                          `${employee.full_name || ""} ${employee.employee_code || ""} ${employee.email || ""}`
                            .toLowerCase()
                            .includes(employeeSearch.trim().toLowerCase())
                        ).length}{" "}
                        found
                      </span>
                    </div>

                    <div className="allocationSearchBox">
                      <input
                        id="allocationEmployeeSearch"
                        type="text"
                        placeholder="Search by employee name, code or email..."
                        value={employeeSearch}
                        onChange={(e) => setEmployeeSearch(e.target.value)}
                        autoComplete="off"
                      />

                      {employeeSearch && (
                        <button
                          type="button"
                          onClick={() => setEmployeeSearch("")}
                          aria-label="Clear employee search"
                          className="allocationSearchClear"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    <div className="allocationEmployees">
                      {employees
                        .filter((employee) =>
                          `${employee.full_name || ""} ${employee.employee_code || ""} ${employee.email || ""}`
                            .toLowerCase()
                            .includes(employeeSearch.trim().toLowerCase())
                        )
                        .map((employee) => (
                          <div
                            className="allocationEmployeeRow"
                            key={employee.employee_id}
                          >
                            <div className="allocationEmployeeInfo">
                              <strong>{employee.full_name}</strong>

                              <span>
                                {employee.employee_code}
                              </span>
                            </div>

                            <input
                              type="number"
                              aria-label={`Number of leads assigned to ${employee.full_name}`}
                              min="0"
                              max={previewData.validRows}
                              value={allocation[employee.employee_id] ?? ""}
                              onChange={(e) =>
                                handleAllocationChange(
                                  employee.employee_id,
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        ))}

                      {employees.filter((employee) =>
                        `${employee.full_name || ""} ${employee.employee_code || ""} ${employee.email || ""}`
                          .toLowerCase()
                          .includes(employeeSearch.trim().toLowerCase())
                      ).length === 0 && (
                        <div className="allocationNoResults">
                          No employees found.
                        </div>
                      )}
                    </div>
                  </div>



                {/* Footer */}
                <div className="allocationModalFooter">

                  <button
                    type="button"
                    className="allocationCancelBtn"
                    onClick={() =>
                      setShowAllocationModal(false)
                    }
                    disabled={uploading}
                  >
                    Cancel
                  </button>


                  <button
                    type="button"
                    className="allocationConfirmBtn"
                    onClick={handleUpload}
                    disabled={
                      uploading ||
                      Object.values(allocation).reduce(
                        (total, count) =>
                          total + Number(count || 0),
                        0
                      ) !==
                        Number(previewData.validRows)
                    }
                  >
                    {uploading
                      ? "Uploading..."
                      : "Confirm & Upload"}
                  </button>

                </div>

              </div>

            </div>
          )}

        </div>
        {/* End addLeadContainer */}

      </div>
      {/* End addLeadPage */}

    </ManagerLayout>

  );

}


export default AddLeads;