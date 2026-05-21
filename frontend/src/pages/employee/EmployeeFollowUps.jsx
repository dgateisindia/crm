import axios
from "axios";

import {

  useEffect,
  useState

} from "react";

import EmployeeLayout
from "../../layouts/EmployeeLayout";

import "../../styles/leads.css";


export default function FollowUps() {

  const [

    followups,

    setFollowups

  ] =
  useState([]);


  useEffect(() => {

    const fetchFollowups =
    async () => {

      try {

        const user =
        JSON.parse(

          localStorage.getItem(
            "user"
          )

        );

        const employeeId =

          user?.employee_id ||

          user?.id;


        const response =
        await axios.get(

`http://localhost:5000/api/followups/employee/${employeeId}`

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

    fetchFollowups();

  }, []);

  return (

    <EmployeeLayout>

      <div className="leads-container">

        <div className="mb-6">

          <h1 className="leads-header-title">

            Follow Ups

          </h1>

          <p className="leads-header-subtitle">

            Manage all CRM followups

          </p>

        </div>



        <div className="leads-card tableWrapper">

          <table className="w-full">

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
                  Next Followup
                </th>

                <th className="table-head">
                  Status
                </th>

              </tr>

            </thead>


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

<td className="table-data">

{
item.company_name
}

</td>

<td className="table-data">

{

item.full_name ||

"N/A"

}

</td>

<td className="table-data">

{
item.followup_mode
}

</td>

<td className="table-data">

{
item.remarks
}

</td>

<td className="table-data">

{

item
.next_followup_date

?

new Date(

item
.next_followup_date

)
.toLocaleString()

:

"N/A"

}

</td>

<td className="table-data">

<span
className="status-badge"
>

{
item.status
}

</span>

</td>

</tr>

)

)

)

: (

<tr>

<td

colSpan="6"

className="text-center p-6 text-gray-500"

>

No Followups Found

</td>

</tr>

)

}

            </tbody>

          </table>

        </div>

      </div>

    </EmployeeLayout>

  );
}