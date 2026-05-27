import axios from "axios";

import {useEffect,useState}from "react";


import ManagerLayout from "../../layouts/ManagerLayout";
import "../../styles/leads.css";

export default function NotInterestedLeads() {


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

"http://localhost:5000/api/leads/not-interested"

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

Not Interested Leads

</h1>

<p className="leads-header-subtitle">

Manage not interested CRM leads

</p>

</div>


<input

type="text"

placeholder="Search not interested leads..."

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

No Not Interested Leads Found

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