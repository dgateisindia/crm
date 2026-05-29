import axios from "axios";

import {
  useEffect,
  useState
} from "react";

import ManagerLayout from "../../layouts/ManagerLayout";

import "../../styles/leads.css";

export default function FollowUps() {

  const [
    followups,
    setFollowups
  ] = useState([]);


  // ==========================
  // Fetch Followups
  // ==========================
  const fetchFollowups =
  async () => {

    try {

      const response =
      await axios.get(

"http://localhost:5000/api/followups/all"

      );

      setFollowups(
        response.data
      );

    }

    catch (error) {

      console.log(error);

      alert(
"Failed to fetch followups"
      );

    }

  };


  useEffect(() => {

    const loadFollowups =
    async () => {

      await fetchFollowups();

    };

    loadFollowups();

  }, []);


  return (

    <ManagerLayout>

      <div className="leads-container">

        {/* Header */}
        <div className="mb-6">

          <h1 className="leads-header-title">

            Follow Ups

          </h1>

          <p className="leads-header-subtitle">

            Manage all CRM followups

          </p>

        </div>


        {/* Table */}
        <div className="leads-card tableWrapper">

          <table className="w-full">

            {/* Table Header */}
            <thead>

              <tr className="border-b">

                <th className="table-head">

                  Company

                </th>

                <th className="table-head">

                  Employee

                </th>

                <th className="table-head">

                  Mode

                </th>

                <th className="table-head">

                  Remarks

                </th>

                <th className="table-head">

                  Lead Status

                </th>

              </tr>

            </thead>


            {/* Table Body */}
            <tbody>

              {

            followups.length > 0

            ? (

            followups.map(

            (item) => (

            <tr

            key={
            item.followup_id
            }

            className="table-row"

            >

              {/* Company */}
              <td className="table-data">

                {
            item.company_name
                }

              </td>


              {/* Employee */}
              <td className="table-data">

                {

            item.full_name ||

            "N/A"

                }

              </td>


              {/* Mode */}
              <td className="table-data">

                {
            item.followup_mode
                }

              </td>


              {/* Remarks */}
              <td className="table-data">

                {

            item.remarks ||

            "No remarks"

                }

              </td>


  {/* Lead Status */}
  <td className="table-data">

    <span
      className={`followupStatus ${item.lead_status}`}
    >

      {

      item.lead_status
      ?.replace(
      "_",
      " "
      )

      }

    </span>

  </td>

</tr>

)

)

)

: (

<tr>

<td colSpan="5"className="text-center p-6 text-gray-500">

No Followups Found

</td>

</tr>

)

}

            </tbody>

          </table>

        </div>

      </div>

    </ManagerLayout>

  );

}