import ManagerLayout from "../../layouts/ManagerLayout";
import "../../styles/leads.css";
import { Upload, UserPlus } from "lucide-react";

export default function Leads() {
  return (
    <ManagerLayout>
      <div className="leads-container">
        {/* Header */}
        <div className="mb-6">
          <h1 className="leads-header-title">Add Leads</h1>
          <p className="leads-header-subtitle">
            Add leads manually or upload bulk leads using Excel.
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* Left Side - Manual Entry */}
          <div className="xl:col-span-3 leads-card">
            
            {/* Card Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="icon-wrapper-dark">
                <UserPlus size={22} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#071739]">Lead Information</h2>
                <p className="text-sm text-gray-500">Fill in lead details manually</p>
              </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input type="text" placeholder="Company Name" className="leads-input" />
              <input type="text" placeholder="Contact Person Name" className="leads-input" />
              <input type="number" placeholder="Phone Number" className="leads-input" />
              <input type="email" placeholder="Email Address" className="leads-input" />
              <input type="text" placeholder="Address" className="leads-input" />
              <input type="text" placeholder="Website" className="leads-input" />

              <select className="leads-select">
                <option>Lead Status</option>
                <option>New Lead</option>
                <option>Interested</option>
                <option>Follow-up</option>
                <option>Converted</option>
              </select>

              <select className="leads-select">
                <option>Assign Employee</option>
                <option>Employee 1</option>
                <option>Employee 2</option>
              </select>
            </div>

            <textarea rows="4" placeholder="Remarks / Notes" className="leads-textarea w-full mt-5" />

            <div className="flex justify-end mt-5">
              <button className="leads-btn-primary">Save Lead</button>
            </div>
          </div>

          {/* Right Side - Excel Upload */}
          <div className="leads-card h-fit">
            <div className="flex items-center gap-3 mb-5">
              <div className="icon-wrapper-light">
                <Upload size={22} />
              </div>
              <div>
                <h2 className="font-semibold text-[#071739] text-lg">Import Leads</h2>
                <p className="text-sm text-gray-500">Upload Excel or CSV file</p>
              </div>
            </div>

            <div className="upload-dropzone">
              <Upload size={50} className="mx-auto text-[#071739] mb-4" />
              <h3 className="font-medium text-[#071739] text-lg">Upload Excel File</h3>
              <p className="text-sm text-gray-500 mt-2">Drag & drop .xlsx or .csv file</p>
              <button className="leads-btn-primary px-5 py-2 mt-5 text-sm">
                Choose File
              </button>
            </div>

            <div className="info-box">
              <h4 className="font-semibold text-[#071739] mb-2">Supported Formats</h4>
              <p className="text-sm text-gray-500">.xlsx, .xls, .csv</p>
              <p className="text-sm text-gray-500 mt-1">Max file size: 20MB</p>
            </div>
          </div>

        </div>
      </div>
    </ManagerLayout>
  );
}