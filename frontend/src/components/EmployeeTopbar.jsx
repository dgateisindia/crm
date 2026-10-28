import TodayFollowups from "./common/TodayFollowups";
import { CRM_API_URL } from "../config/urls";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useClerk, useAuth } from "@clerk/react";
import {
  CalendarDays,
  FileUp,
  FileDown,
  UserRound,
  ChevronDown,
  User,
  LogOut,
  X,
} from "lucide-react";
import "../styles/topbar.css";

const API_URL = CRM_API_URL;

const STATUS_OPTIONS = [
  ["all", "All statuses"],
  ["new", "New"],
  ["interested", "Interested"],
  ["connected", "Connected"],
  ["proposal", "Proposal"],
  ["meeting scheduled", "Meeting Scheduled"],
  ["offered", "Offered"],
  ["converted", "Converted"],
  ["not_interested", "Not Interested"],
  
];

const PERIOD_OPTIONS = [
  ["today", "Today"],
  ["15days", "Last 15 days"],
  ["month", "This month"],
  ["year", "This year"],
  ["custom", "Custom date range"],
  ["all", "All dates"],
];

export default function EmployeeTopbar() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [period, setPeriod] = useState("15days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [categories, setCategories] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const formattedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const [employeeDisplayName, setEmployeeDisplayName] = useState("");

  useEffect(() => {
    if (!user?.id) {
      setEmployeeDisplayName("");
      return;
    }

    let cancelled = false;

    const loadEmployeeName = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const response = await fetch(
          `${API_URL}/employee/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) return;

        const result = await response.json();
        const profile = result.data || result;

        const name =
          typeof profile.full_name === "string"
            ? profile.full_name.trim()
            : "";

        if (!cancelled) {
          setEmployeeDisplayName(name);
        }
      } catch (error) {
        console.warn("Employee profile name unavailable");
      }
    };

    setEmployeeDisplayName("");
    loadEmployeeName();

    return () => {
      cancelled = true;
    };
  }, [user?.id, getToken]);

  const fullName =
    employeeDisplayName ||
    user?.fullName ||
    user?.firstName ||
    "Employee";

  const email = user?.primaryEmailAddress?.emailAddress || "";

  const openImport = () => {
    navigate("/employee/add-leads", {
      state: { openFilePicker: true },
    });
  };

  useEffect(() => {
    if (!exportOpen) return;

    let cancelled = false;

    const loadFilters = async () => {
      setLoadingFilters(true);
      setError("");

      try {
        const token = await getToken();

        const response = await fetch(
          `${API_URL}/leads/export-filters`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load export filters.");
        }

        if (!cancelled) {
          setCategories(
            (data.categories || [])
              .map((item) =>
                typeof item === "string" ? item : item.category
              )
              .filter(Boolean)
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load export filters.");
        }
      } finally {
        if (!cancelled) setLoadingFilters(false);
      }
    };

    loadFilters();

    return () => {
      cancelled = true;
    };
  }, [exportOpen, getToken]);

  const downloadExcel = async () => {
    setError("");

    if (period === "custom") {
      if (!startDate || !endDate) {
        setError("Select both the start date and end date.");
        return;
      }

      if (startDate > endDate) {
        setError("Start date cannot be later than end date.");
        return;
      }
    }

    setDownloading(true);

    try {
      const token = await getToken();
      const params = new URLSearchParams();

      if (status !== "all") params.set("status", status);
      if (category !== "all") params.set("category", category);

      params.set("period", period);

      if (period === "custom") {
        params.set("startDate", startDate);
        params.set("endDate", endDate);
      }

      const response = await fetch(
        `${API_URL}/leads/export?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const message = await response.text();

        try {
          const parsed = JSON.parse(message);
          throw new Error(parsed.message || "Excel export failed.");
        } catch (err) {
          if (err.message !== "Excel export failed.") throw err;
          throw new Error(message || "Excel export failed.");
        }
      }

      const blob = await response.blob();

      if (!blob.size) {
        throw new Error("The export file is empty.");
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "Employee_Leads.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
      setExportOpen(false);
    } catch (err) {
      setError(err.message || "Unable to export leads.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="topbar">
      <h1 className="topbar-title">Employee Dashboard</h1>

      <div className="topbar-actions">
        <TodayFollowups role="employee" />
        <div className="date-box">
          <CalendarDays size={16} className="date-icon" />
          <span className="date-text">{formattedDate}</span>
        </div>

        <button
          type="button"
          className="topbar-action-btn import-btn"
          onClick={openImport}
        >
          <FileUp size={17} />
          <span>Import</span>
        </button>

        <button
          type="button"
          className="topbar-action-btn export-btn"
          onClick={() => {
            setProfileOpen(false);
            setExportOpen(true);
          }}
        >
          <FileDown size={17} />
          <span>Export</span>
        </button>

        <div className="profile-wrapper">
          <button
            type="button"
            className="profile-trigger"
            onClick={() => {
              setProfileOpen((open) => !open);
              setExportOpen(false);
            }}
            aria-expanded={profileOpen}
            aria-label="Open user profile menu"
          >
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="Profile"
                className="profile-avatar"
              />
            ) : (
              <span className="profile-avatar profile-avatar-fallback">
                <UserRound size={19} />
              </span>
            )}

            <span className="profile-user-info">
              <span className="profile-user-name">{fullName}</span>
              <span className="profile-user-role">Employee</span>
            </span>

            <ChevronDown size={16} />
          </button>

          {profileOpen && (
            <div className="profile-menu">
              <div className="profile-menu-header">
                <strong>{fullName}</strong>
                <span>{email}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/employee/profile");
                }}
              >
                <User size={16} />
                My Profile
              </button>

              <button
                type="button"
                className="profile-logout"
                onClick={async () => {
                  await signOut({ redirectUrl: "/sign-in" });
                }}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {exportOpen && (
        <div
          className="export-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !downloading) {
              setExportOpen(false);
            }
          }}
        >
          <div
            className="export-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-export-title"
          >
            <div className="export-modal-header">
              <div>
                <h2 id="employee-export-title">Export Leads</h2>
                <p>Choose which leads to export.</p>
              </div>

              <button
                type="button"
                className="export-close-btn"
                disabled={downloading}
                onClick={() => setExportOpen(false)}
                aria-label="Close export dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="export-form">
              <label>
                Lead status
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Category
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={loadingFilters}
                >
                  <option value="all">All categories</option>
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Date range
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  {PERIOD_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              {period === "custom" && (
                <>
                  <label>
                    Start date
                    <input
                      type="date"
                      value={startDate}
                      max={endDate || undefined}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </label>

                  <label>
                    End date
                    <input
                      type="date"
                      value={endDate}
                      min={startDate || undefined}
                      max={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </label>
                </>
              )}

              {error && (
                <p className="export-error" role="alert">
                  {error}
                </p>
              )}

              <div className="export-modal-actions">
                <button
                  type="button"
                  className="export-cancel-btn"
                  disabled={downloading}
                  onClick={() => setExportOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="export-download-btn"
                  disabled={downloading || loadingFilters}
                  onClick={downloadExcel}
                >
                  <FileDown size={16} />
                  {downloading ? "Preparing Excel..." : "Download Excel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
