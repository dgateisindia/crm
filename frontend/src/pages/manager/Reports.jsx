import { useState, useEffect } from "react";
import axios from "axios";
import { Briefcase, PhoneCall, BadgeCheck, Clock3, Users } from "lucide-react" ;
import ManagerLayout from "../../layouts/ManagerLayout";
import "../../styles/managerDashboard.css";
import "../../styles/report.css";
export default function Reports() {

  const [range, setRange] =
  useState("today");

  const [report, setReport] =
  useState({
    totalLeads: 0,
    totalFollowups: 0,
    convertedLeads: 0,
    pendingLeads: 0,
    totalEmployees: 0
  });

  useEffect(() => {

    axios
      .get(
        `http://localhost:5000/api/reports/company?range=${range}`
      )
      .then((res) => {

        setReport(res.data);

      })
      .catch((err) => {

        console.log(err);

      });

  }, [range]);

  return (

    <ManagerLayout>

      <div className="reportsPage">

        <div className="reportsHeader">

          <div>

            <h1>
              Reports
            </h1>

            <p>
              Company Performance Report
            </p>

          </div>

        </div>

        {/* Filters */}

        <div className="reportFilters">

          <button
            className={
              range === "today"
                ? "reportBtn active"
                : "reportBtn"
            }
            onClick={() =>
              setRange("today")
            }
          >
            Today
          </button>

          <button
            className={
              range === "15days"
                ? "reportBtn active"
                : "reportBtn"
            }
            onClick={() =>
              setRange("15days")
            }
          >
            Last 15 Days
          </button>

          <button
            className={
              range === "month"
                ? "reportBtn active"
                : "reportBtn"
            }
            onClick={() =>
              setRange("month")
            }
          >
            This Month
          </button>

          <button
            className={
              range === "year"
                ? "reportBtn active"
                : "reportBtn"
            }
            onClick={() =>
              setRange("year")
            }
          >
            This Year
          </button>

        </div>

        {/* Report Cards */}

          <div className="dashboard-grid report-grid">

            <div className="crm-card blue-card">
              <div className="crm-card-top">
                <div className="icon-circle blue-bg">
                  <Briefcase size={20} />
                </div>
              </div>

              <h3>Total Leads</h3>
              <h2>{report.totalLeads}</h2>
            </div>

            <div className="crm-card orange-card">
              <div className="crm-card-top">
                <div className="icon-circle orange-bg">
                  <PhoneCall size={20} />
                </div>
              </div>

              <h3>Followups</h3>
              <h2>{report.totalFollowups}</h2>
            </div>

            <div className="crm-card green-card">
              <div className="crm-card-top">
                <div className="icon-circle green-bg">
                  <BadgeCheck size={20} />
                </div>
              </div>

              <h3>Converted</h3>
              <h2>{report.convertedLeads}</h2>
            </div>

            <div className="crm-card purple-card">
              <div className="crm-card-top">
                <div className="icon-circle purple-bg">
                  <Clock3 size={20} />
                </div>
              </div>

              <h3>Pending</h3>
              <h2>{report.pendingLeads}</h2>
            </div>

            <div className="crm-card blue-card">
              <div className="crm-card-top">
                <div className="icon-circle blue-bg">
                  <Users size={20} />
                </div>
              </div>

              <h3>Employees</h3>
              <h2>{report.totalEmployees}</h2>
            </div>

          </div>
          {/* Overview */}

          <div className="reportSection">

            <h3>Report Overview</h3>

            <p>
              Showing company performance for
              <strong> {range}</strong>
            </p>

          </div>

          {/* Future Section */}

          <div className="reportSection">

            <h3>Top Employees</h3>

            <p>
              Top employee performance data will appear here.
            </p>

          </div>

          <div className="reportSection">

            <h3>Lead Status Breakdown</h3>

            <p>
              Lead status analytics will appear here.
            </p>

          </div>
      </div>

    </ManagerLayout>

  );

}