import { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  Briefcase,
  PhoneCall,
  BadgeCheck,
  Clock3,
  Users,
  CalendarRange,
  //PencilLine
} from "lucide-react";import ManagerLayout from "../../layouts/ManagerLayout";
import "../../styles/managerDashboard.css";
import "../../styles/report.css";
import LeadStatusChart from "../../components/charts/LeadStatusChart";
import LeadTrendChart from "../../components/charts/LeadTrendChart";
import EmployeePerformanceChart from "../../components/charts/EmployeePerformanceChart";
export default function Reports() {

  const [range, setRange] =
  useState("today");
  const [showCustomFilter, setShowCustomFilter] = useState(false);

  const [selectedRange, setSelectedRange] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  const [report, setReport] =
  useState({
    totalLeads: 0,
    totalFollowups: 0,
    convertedLeads: 0,
    pendingLeads: 0,
    totalEmployees: 0,

    statusChart: [],
    trendChart: [],
    employeePerformance: [],
    
  });

  useEffect(() => {

  if (range === "custom" && !appliedStartDate) {
    return;
  }

  let url = `/reports/company?range=${range}`;

  if (range === "custom") {
    url += `&startDate=${appliedStartDate}&endDate=${appliedEndDate}`;
  }

  api.get(url)
    .then((res) => {
      setReport(res.data);
    })
    .catch(console.log);

}, [
  range,
  appliedStartDate,
  appliedEndDate
]);
const today = new Date().toISOString().split("T")[0];

  return (

    <ManagerLayout>

      <div className="reportsPage">

        <div className="employeesHeader">

          <div>

            <h1>Company Report</h1>

            <p>Company Performance Summary</p>

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
            onClick={() => {
              setRange("today");
               setShowCustomFilter(false);
               setSelectedRange("");
            }}
          >
            Today
          </button>

          <button
            className={
              range === "15days"
                ? "reportBtn active"
                : "reportBtn"
            }
            onClick={() =>{

            setRange("15days");
            setShowCustomFilter(false);
            setSelectedRange("");
            }}
          >
            Last 15 Days
          </button>

          <button
            className={
              range === "month"
                ? "reportBtn active"
                : "reportBtn"
            }
            onClick={() =>{ setRange("month");
              setShowCustomFilter(false);
              setSelectedRange("");
            }}
          >
            This Month
          </button>

          <button
            className={
              range === "year"
                ? "reportBtn active"
                : "reportBtn"
            }
            onClick={() =>{ setRange("year");
              setShowCustomFilter(false);
              setSelectedRange("");
            }}
          >
            This Year
          </button>
          <button
            className={
              range === "custom"
                ? "reportBtn active"
                : "reportBtn"
            }
            onClick={() => {

              setRange("custom");
              setShowCustomFilter(true);

            }}
          >
            Custom
          </button>
        </div>

           {
            !showCustomFilter && (

                <div className="reportInfo">

                    <div className="reportInfoLeft">

                      <div className="reportIcon">

                        <CalendarRange size={22} />

                      </div>

                      <div>

                        <h4>Report Period</h4>

                       <p>

                        {
                        range==="today"
                        ? "Today"

                        :range==="15days"
                        ? "Last 15 Days"

                        :range==="month"
                        ? "This Month"

                        :range==="year"
                        ? "This Year"

                        :selectedRange

                        }

                        </p>

                      </div>

                    </div>


                  </div>

              )
            }



        {/* Custom Date Filter */}

        {range === "custom" && showCustomFilter && (

          <div className="customDateFilter">

        <div className="dateField">

          <label>From Date</label>

          <input
            type="date"
            value={startDate}
            max={today}
            onChange={(e) => {

              setStartDate(e.target.value);

              // Clear To Date if it becomes invalid
              if (
                endDate &&
                endDate < e.target.value
              ) {
                setEndDate("");
              }

            }}
          />

        </div>

        <div className="dateField">

          <label>To Date (Optional)</label>

          <input
            type="date"
            value={endDate}
            min={startDate} 
            max={today}     // Cannot select before From Date
            disabled={!startDate} // Disabled until From Date is selected
            onChange={(e) =>
              setEndDate(e.target.value)
            }
          />

        </div>

          <button
            className="applyBtn"
            onClick={() => {

                  if (!startDate) {
                    alert("Please select From Date.");
                    return;
                  }

                  const finalEnd = endDate || startDate;

                  setAppliedStartDate(startDate);
                  setAppliedEndDate(finalEnd);

                  const format = (date) =>
                    new Date(date).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      }
                    );

                  if (startDate === finalEnd) {
                    setSelectedRange(format(startDate));
                  } else {
                    setSelectedRange(
                      `${format(startDate)} → ${format(finalEnd)}`
                    );
                  }

                  setShowCustomFilter(false);
                  // Optional: clear the inputs
                  setStartDate("");
                  setEndDate("");

                }}
          >
            Apply
          </button>
          

        </div>

        )}

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
          <div className="report-charts">

              <LeadStatusChart
                data={report.statusChart}
              />

              <EmployeePerformanceChart
                data={report.employeePerformance}
              />

              <LeadTrendChart
                data={report.trendChart}
              />

            </div>
             {/*<div className="reportSection">

               <h3>Company Performance Summary</h3>

                <p>

                  Conversion Rate :

                  <strong>

                    {" "}

                    {Number(report.conversionRate || 0).toFixed(2)}%

                  </strong>

                </p>

                <p>

                  Total Employees :

                  <strong>

                    {" "}

                    {report.totalEmployees}

                  </strong>

                </p>

              </div>*/}
      </div>

    </ManagerLayout>

  );

}