import axios from "axios";

import {useEffect,useState}from "react";


import ManagerLayout from "../../layouts/ManagerLayout";
import "../../styles/leads.css";
import {

Star,
BadgeCheck,
PhoneCall,
UserX

}
from "lucide-react";

export default function ImportantLeads() {


const [

leads,

setLeads

] =
useState([]);

const [

search,

setSearch

] =
useState("");


// ==========================
// Fetch Important Leads
// ==========================
const fetchLeads =
async () => {

try {

const response =
await axios.get(

"http://localhost:5000/api/leads/important"

);

setLeads(
response.data
);

}

catch (error) {

console.log(error);

}

};


// ==========================
// Load Data
// ==========================
useEffect(() => {

const loadLeads =
async () => {

await fetchLeads();

};

loadLeads();

}, []);

// ==========================
// Search Filter
// ==========================
const filteredLeads =

leads.filter((lead) => {

const searchText =
search.toLowerCase();

return (

lead.company_name
?.toLowerCase()
.includes(searchText)

||

lead.contact_person_name
?.toLowerCase()
.includes(searchText)

||

lead.phone
?.includes(search)

||

lead.city
?.toLowerCase()
.includes(searchText)

);

});


return (

<ManagerLayout>

<div className="leads-container">

<div className="mb-6">

<h1 className="leads-header-title">

Important Leads

</h1>

<p className="leads-header-subtitle">

Manage important CRM leads

</p>

</div>
        {/* Top Cards */}
        <div className="dashboard-grid mb-4">

        {/* Important Leads */}
        <div className="crm-card blue-card">

            <div className="crm-card-top">

            <div className="icon-circle blue-bg">

                <Star size={20} />

            </div>

            </div>

            <h3>

            Important Leads

            </h3>

            <h2>

            {
                leads.length
            }

            </h2>

        </div>


        {/* Connected */}
        <div className="crm-card green-card">

            <div className="crm-card-top">

            <div className="icon-circle green-bg">

                <PhoneCall size={20} />

            </div>

            </div>

            <h3>

            Connected

            </h3>

            <h2>

            {

        leads.filter(
        lead =>
        lead.lead_status ===
        "connected"
        ).length

            }

            </h2>

        </div>


        {/* Converted */}
        <div className="crm-card purple-card">

            <div className="crm-card-top">

            <div className="icon-circle purple-bg">

                <BadgeCheck size={20} />

            </div>

            </div>

            <h3>

            Converted

            </h3>

            <h2>

            {

        leads.filter(
        lead =>
        lead.lead_status ===
        "converted"
        ).length

            }

            </h2>

        </div>


        {/* Not Interested */}
        <div className="crm-card orange-card">

            <div className="crm-card-top">

            <div className="icon-circle orange-bg">

                <UserX size={20} />

            </div>

            </div>

            <h3>

            Not Interested

            </h3>

            <h2>

            {

        leads.filter(
        lead =>
        lead.lead_status ===
        "not_interested"
        ).length

            }

            </h2>

        </div>

        </div>


<input

type="text"

placeholder="Search important leads..."

className="manager-search-input mb-4"

value={search}

onChange={(e) =>
setSearch(
e.target.value
)
}

/>


<div className="leads-card tableWrapper">

<table className="w-full">

<thead>

<tr className="border-b">

<th className="table-head">
Company
</th>

<th className="table-head">
Contact Person
</th>

<th className="table-head">
Designation
</th>

<th className="table-head">
Phone
</th>

<th className="table-head">
Status
</th>

</tr>

</thead>

<tbody>

{

filteredLeads.length > 0

? (

filteredLeads.map(
(lead) => (

<tr

key={lead.id}

className="table-row"

>

<td className="table-data">

{
lead.company_name
}

</td>

<td className="table-data">

{
lead.contact_person_name
||

"N/A"
}

</td>

<td className="table-data">

{
lead.designation
||

"N/A"
}

</td>

<td className="table-data">

{
lead.phone
||

"N/A"
}

</td>

<td className="table-data">

<span
className={`status-badge ${lead.lead_status}`}
>

{
lead.lead_status
}

</span>

</td>

</tr>

))

)

: (

<tr>

<td

colSpan="5"

className="text-center p-6 text-gray-500"

>

No Important Leads Found

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