import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import ManagerLayout from "../../layouts/ManagerLayout";

export default function EmployeeDetails() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);

  const [stats, setStats] = useState({
      totalLeads: 0,
      totalFollowups: 0,
      convertedLeads: 0,
      pendingLeads: 0
    });


  useEffect(() => {

            axios
              .get(`http://localhost:5000/api/employee/${id}`)
              .then((res) => {

                setEmployee(res.data);

              })
              .catch((err) => {

                console.log(err);

              });

            axios
              .get(`http://localhost:5000/api/employee/stats/${id}`)
              .then((res) => {

                console.log("Stats:", res.data);

                setStats(res.data);

              })
              .catch((err) => {

                console.log(err);

              });

          }, [id]);

  if (!employee) {

    return (
      <ManagerLayout>
        <div style={{ padding: "20px" }}>
          Loading...
        </div>
      </ManagerLayout>
    );

  }

  return (

    <ManagerLayout>

      <div style={{ padding: "25px" }}>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
        <button
          onClick={() => navigate("/manager/employees")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#ffffff",
            color: "#000000",
            border: "1px solid #e5e7eb",
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >

            <ArrowLeft size={16} />

            Back to Employees

          </button>

        </div>

        {/* Profile Card */}
        <div
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "30px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            marginBottom: "20px",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              marginBottom: "25px",
            }}
          >

            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "#ebecf0",
                color: "#071739",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "30px",
                fontWeight: "bold",
              }}
            >

              {employee.full_name?.charAt(0)}

            </div>

            <div>

              <h1
                style={{
                  fontSize: "28px",
                  marginBottom: "5px",
                }}
              >

                {employee.full_name}

              </h1>

              <p
                style={{
                  color: "#666",
                }}
              >

                {employee.email}

              </p>

            </div>

          </div>

          {/* Employee Information */}
          <h2
            style={{
              marginBottom: "15px",
              color: "#071739",
            }}
          >
            Employee Information
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, 1fr)",
              gap: "20px",
            }}
          >

            <div>

              <strong>
                Employee Code:
              </strong>

              <p>
                {employee.employee_code}
              </p>

            </div>

            <div>

              <strong>
                Employee ID:
              </strong>

              <p>
                #{employee.employee_id}
              </p>

            </div>

            <div>

              <strong>
                Phone:
              </strong>

              <p>
                {employee.phone}
              </p>

            </div>

            <div>

              <strong>
                Department:
              </strong>

              <p>
                {employee.department}
              </p>

            </div>

            <div>

              <strong>
                Designation:
              </strong>

              <p>
                {employee.designation}
              </p>

            </div>

            <div>

              <strong>
                Status:
              </strong>

              <p>
                {employee.status}
              </p>

            </div>

          </div>

        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4, 1fr)",
            gap: "20px",
          }}
        >

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "16px",
              boxShadow:
                "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >

            <h4>Total Leads</h4>

            <h2>{stats.totalLeads}</h2>

          </div>

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "16px",
              boxShadow:
                "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >

            <h4>Followups</h4>

            <h2>{stats.totalFollowups}</h2>

          </div>

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "16px",
              boxShadow:
                "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >

            <h4>Converted</h4>

            <h2>{stats.convertedLeads}</h2>

          </div>

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "16px",
              boxShadow:
                "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >

            <h4>Pending</h4>

            <h2>{stats.pendingLeads}</h2>

          </div>

        </div>

      </div>

    </ManagerLayout>

  );
}