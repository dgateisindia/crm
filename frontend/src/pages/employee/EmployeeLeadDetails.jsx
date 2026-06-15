import {
  useEffect,
  useState
} from "react";

import {
  useParams,
  useNavigate,
  useLocation
} from "react-router-dom";

import axios from "axios";

import EmployeeLayout from "../../layouts/EmployeeLayout";


import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  FileText,
  User
} from "lucide-react";

export default function EmployeeLeadDetails() {

  const { id } =
  useParams();

  const navigate =
  useNavigate();

  const location = useLocation();

  const [
    lead,
    setLead
  ] =
  useState(null);

  const [
    followups,
    setFollowups
  ] =
  useState([]);


  // ==========================
  // Fetch Lead
  // ==========================
  const fetchLead =
  async () => {

    try {

      const response =
      await axios.get(

`http://localhost:5000/api/leads/${id}`

      );

      setLead(
        response.data
      );

    }

    catch (error) {

      console.log(
        error
      );

    }

  };


  // ==========================
  // Fetch Followups
  // ==========================
  const fetchFollowups =
  async () => {

    try {

      const response =
      await axios.get(

`http://localhost:5000/api/followups/lead/${id}`

      );

      setFollowups(
        response.data
      );

    }

    catch (error) {

      console.log(
        error
      );

    }

  };


  // ==========================
  // Load Data
  // ==========================
  useEffect(() => {

    const loadData =
    async () => {

      await fetchLead();

      await fetchFollowups();

    };

    loadData();

  }, [id]);


  // ==========================
  // Loading State
  // ==========================
  if (!lead) {

    return (

      <EmployeeLayout>

        <div className="flex justify-center items-center h-[60vh]">

          <p className="text-lg text-gray-500">

            Loading Lead Details...

          </p>

        </div>

      </EmployeeLayout>
    );

  }


  return (

    <EmployeeLayout>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">

        <div>

          <h1 className="text-3xl font-bold text-[#071739]">

            Lead Details

          </h1>

          <p className="text-gray-500">

            Complete Lead Information

          </p>

        </div>

        <button

          onClick={() =>
            navigate(location.state?.from || "/employee/my-leads")
          }

          className="flex items-center gap-2 border px-4 py-2 rounded-xl hover:bg-gray-100"

        >

          <ArrowLeft
            size={18}
          />

          Back

        </button>

      </div>


      {/* Lead Details Card */}
      <div className="bg-white rounded-3xl shadow-md p-8">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <InfoCard
            icon={<Building2 />}
            label="Company"
            value={lead.company_name}
          />

          <InfoCard
            icon={<User />}
            label="Contact Person"
            value={lead.contact_person_name}
          />

          <InfoCard
            icon={<Phone />}
            label="Phone"
            value={lead.phone}
          />

          <InfoCard
            icon={<Mail />}
            label="Email"
            value={lead.email}
          />

          <InfoCard
            icon={<MapPin />}
            label="City"
            value={lead.city}
          />

          <InfoCard
            icon={<Globe />}
            label="Website"
            value={lead.website}
          />

          <InfoCard
            icon={<FileText />}
            label="Lead Status"
            value={lead.lead_status}
          />

          <InfoCard
            icon={<Phone />}
            label="Lead Mode"
            value={lead.lead_mode}
          />

        </div>


        {/* Remarks */}
        <div className="mt-8">

          <h2 className="font-semibold text-lg mb-3">

            Remarks

          </h2>

          <div className="bg-gray-50 rounded-2xl p-4 text-gray-600">

            {

lead.remarks ||

"No remarks added"

            }

          </div>

        </div>


        {/* Followup History */}
        <div className="mt-10">

          <h2 className="font-semibold text-xl mb-4">

            Followup History

          </h2>

          <div className="border rounded-2xl overflow-hidden">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="p-4 text-left">

                    Mode

                  </th>

                  <th className="p-4 text-left">

                    Status

                  </th>

                  <th className="p-4 text-left">

                    Remarks

                  </th>

                  <th className="p-4 text-left">

                    Employee

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

className="border-b"

>

<td className="p-4">

{
item.followup_mode
}

</td>

<td className="p-4">

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

<td className="p-4">

{

item.remarks ||

"No remarks"

}

</td>

<td className="p-4">

{

item.full_name ||

"N/A"

}

</td>

</tr>

)

)

)

: (

<tr>

<td
colSpan="4"
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

      </div>

    </EmployeeLayout>

  );

}


// ==========================
// Info Card
// ==========================
function InfoCard({

  icon,
  label,
  value

}) {

  return (

    <div className="border rounded-2xl p-5">

      <div className="flex items-center gap-2 text-[#071739] mb-2">

        {icon}

        <span className="font-medium">

          {label}

        </span>

      </div>

      <p className="text-gray-600">

        {value || "N/A"}

      </p>

    </div>

  );

}