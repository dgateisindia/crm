import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Download,
  FileSpreadsheet,
  Info,
  X
} from "lucide-react";
import "../styles/ExcelImportGuide.css";

const fields = [
  { name: "Company Name", key: "company_name", examples: "company, company name, organization, organization name, business, business name, firm, firm name", required: "Optional" },
  { name: "Contact Person", key: "contact_person_name", examples: "name, person name, contact, contact name, contact person, contacted name", required: "Optional" },
  { name: "Designation", key: "designation", examples: "job title, position, role, title", required: "Optional" },
  { name: "Phone", key: "phone", examples: "phone number, mobile, mobile number, contact number, telephone, telephone number, whatsapp, whatsapp number", required: "Phone or email" },
  { name: "Email", key: "email", examples: "email id, email address, mail, mail id", required: "Phone or email" },
  { name: "Address", key: "address", examples: "full address, location address", required: "Optional" },
  { name: "Website", key: "website", examples: "web, web url, website url", required: "Optional" },
  { name: "Source", key: "source", examples: "lead source, source name", required: "Optional" },
  { name: "City", key: "city", examples: "location, town, district", required: "Optional" },
  { name: "Category", key: "category", examples: "lead category, business category, industry", required: "Required" },
  { name: "Remarks", key: "remarks", examples: "remark, notes, note, comments, comment, description", required: "Optional" },
  { name: "Lead Status", key: "lead_status", examples: "status", required: "Optional" },
  { name: "Lead Mode", key: "lead_mode", examples: "mode, contact mode", required: "Optional" },
  { name: "Important Lead", key: "important_lead", examples: "important, priority, high priority", required: "Optional" }
];

export default function ExcelImportGuide() {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      openerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <div className="excel-help-card">
        <div className="excel-help-heading">
          <span className="excel-help-icon"><FileSpreadsheet size={22} /></span>
          <div>
            <strong>New to Excel import?</strong>
            <p>View supported columns and download a blank template.</p>
          </div>
        </div>
        <button
          ref={openerRef}
          type="button"
          className="excel-help-open"
          onClick={() => setOpen(true)}
        >
          <BookOpen size={17} /> View Excel Format
        </button>
      </div>

      {open && (
        <div className="excel-guide-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <section
            className="excel-guide-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="excel-guide-title"
          >
            <header className="excel-guide-header">
              <div className="excel-guide-header-title">
                <span className="excel-guide-logo"><FileSpreadsheet size={27} /></span>
                <div>
                  <small>D-GATE CRM · IMPORT HELP</small>
                  <h2 id="excel-guide-title">Excel Import Guide</h2>
                  <p>Prepare your lead file in the right format.</p>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                className="excel-guide-close"
                aria-label="Close import guide"
                onClick={() => setOpen(false)}
              >
                <X size={21} />
              </button>
            </header>

            <div className="excel-guide-body">
              <div className="excel-guide-summary">
                <div><strong>14</strong><span>Supported fields</span></div>
                <div><strong>1</strong><span>Required category</span></div>
                <div><strong>Excel / CSV</strong><span>Accepted formats</span></div>
              </div>

              <div className="excel-guide-download-panel">
                <div>
                  <h3>Blank lead template</h3>
                  <p>Column headings only. Add your leads from row 2 onward.</p>
                </div>
                <a
                  className="excel-guide-download"
                  href="/DGATE_Lead_Import_Template.xlsx"
                  download="DGATE_Lead_Import_Template.xlsx"
                >
                  <Download size={17} /> Download .xlsx
                </a>
              </div>

              <div className="excel-guide-section-title">
                <h3>Supported columns & alternate names</h3>
                <p>Use template headings or the aliases below. Spaces, hyphens, and underscores are treated alike.</p>
              </div>

              <div className="excel-guide-table-scroll" tabIndex="0" aria-label="Supported Excel fields">
                <table className="excel-guide-table">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Template heading</th>
                      <th>Also accepted</th>
                      <th>Rule</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field) => (
                      <tr key={field.key}>
                        <td><strong>{field.name}</strong></td>
                        <td><code>{field.key}</code></td>
                        <td>{field.examples}</td>
                        <td>
                          <span className={`excel-guide-rule ${field.required === "Required" ? "must" : field.required === "Optional" ? "optional" : "either"}`}>
                            {field.required}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="excel-guide-tips">
                <Info size={19} />
                <div>
                  <strong>Before importing</strong>
                  <p>Category is required. Enter at least a phone or email. Phone numbers must be 10 digits (an Indian +91 prefix is accepted). Avoid duplicate phone numbers or emails within the same file. Leave optional fields empty if unknown.</p>
                </div>
              </div>

              <div className="excel-guide-steps">
                <h3>How to upload</h3>
                <ol>
                  <li>Download the blank Excel template.</li>
                  <li>Add lead details under the headings; keep row 1 unchanged.</li>
                  <li>Select the completed file using <b>Choose Excel File</b>.</li>
                  <li>Click <b>Preview Leads</b>, review errors, then confirm the import.</li>
                </ol>
              </div>
            </div>

            <footer className="excel-guide-footer">
              <span>No sample customer data is included in the download.</span>
              <button type="button" onClick={() => setOpen(false)}>Done</button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
