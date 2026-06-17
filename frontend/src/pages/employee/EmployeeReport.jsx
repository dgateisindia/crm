import { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  Briefcase,
  PhoneCall,
  BadgeCheck,
  Clock3
} from "lucide-react";

import EmployeeLayout from "../../layouts/EmployeeLayout";

import "../../styles/managerDashboard.css";
import "../../styles/report.css";

export default function EmployeeReports() {

  const user =
  JSON.parse(
    localStorage.getItem("user")
  );

  const employeeId =
  user.id;

  const [range, setRange] =
  useState("today");

  const [report, setReport] =
  useState({
    totalLeads: 0,
    totalFollowups: 0,
    convertedLeads: 0,
    pendingLeads: 0,
    conversionRate: 0
  });


  useEffect(() => {

    axios
      .get(
        `/reports/employee/${employeeId}?range=${range}`
      )
      .then((res) => {

        setReport(res.data);

      })
      .catch((err) => {

        console.log(err);

      });

  }, [employeeId, range]);

  return (

    <EmployeeLayout>

      <div className="reportsPage">

        <div className="employeesHeader">

          <div>

            <h1>
              My Report
            </h1>

            <p>
              My Performance Summary
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

        {/* Cards */}

        <div className="dashboard-grid">

          <div className="crm-card blue-card">

            <div className="crm-card-top">

              <div className="icon-circle blue-bg">

                <Briefcase size={20} />

              </div>

            </div>

            <h3>
              My Leads
            </h3>

            <h2>
              {report.totalLeads}
            </h2>

          </div>

          <div className="crm-card orange-card">

            <div className="crm-card-top">

              <div className="icon-circle orange-bg">

                <PhoneCall size={20} />

              </div>

            </div>

            <h3>
              Followups
            </h3>

            <h2>
              {report.totalFollowups}
            </h2>

          </div>

          <div className="crm-card green-card">

            <div className="crm-card-top">

              <div className="icon-circle green-bg">

                <BadgeCheck size={20} />

              </div>

            </div>

            <h3>
              Converted
            </h3>

            <h2>
              {report.convertedLeads}
            </h2>

          </div>

          <div className="crm-card purple-card">

            <div className="crm-card-top">

              <div className="icon-circle purple-bg">

                <Clock3 size={20} />

              </div>

            </div>

            <h3>
              Pending
            </h3>

            <h2>
              {report.pendingLeads}
            </h2>

          </div>

        </div>

        {/* Summary */}

        <div className="reportSection">

          <h3>
            Performance Summary
          </h3>

          <p>

            Conversion Rate :

            <strong>
              {" "}
              {report.conversionRate.toFixed(2)}%
            </strong>

          </p>

        </div>

      </div>

    </EmployeeLayout>

  );

}