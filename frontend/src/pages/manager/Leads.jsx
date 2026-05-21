import axios from "axios";

import {
  useState,
  useEffect,
} from "react";

import ManagerLayout from "../../layouts/ManagerLayout";

import "../../styles/leads.css";

import {
  Search,
  Trash2,
} from "lucide-react";


export default function Leads() {

  const [allLeads,
    setAllLeads] =
    useState([]);

  const [search,
    setSearch] =
    useState("");

  const [statusFilter,
    setStatusFilter] =
    useState("all");


  // ==========================
  // Fetch Leads
  // ==========================
  const fetchLeads =
  async () => {

    try {

      const response =
      await axios.get(
        "http://localhost:5000/api/leads/all"
      );

      setAllLeads(
        response.data
      );

    }

    catch (error) {

      console.log(error);

      alert(
        "Failed to fetch leads"
      );

    }

  };


useEffect(() => {

  const loadLeads =
  async () => {

    await fetchLeads();

  };

  loadLeads();

}, []);


  // ==========================
  // Delete Lead
  // ==========================
  const handleDelete =
  async (id) => {

    const confirmDelete =
    window.confirm(
      "Are you sure you want to delete this lead?"
    );

    if (!confirmDelete)
    return;


    try {

      await axios.delete(

        `http://localhost:5000/api/leads/delete/${id}`

      );


      alert(
        "Lead Deleted Successfully"
      );


      fetchLeads();

    }

    catch (error) {

      console.log(error);

      alert(
        "Failed to Delete Lead"
      );

    }

  };


  // ==========================
  // Filter Leads
  // ==========================
  const filteredLeads =
  allLeads.filter(
  (lead) => {

    const company =

    lead.company_name
    ? lead.company_name
    .toLowerCase()
    : "";


    const contact =

    lead.contact_person_name
    ? lead.contact_person_name
    .toLowerCase()
    : "";


    const matchesSearch =

    company.includes(
      search.toLowerCase()
    )

    ||

    contact.includes(
      search.toLowerCase()
    );


    const matchesStatus =

    statusFilter ===
    "all"

    ||

    lead.lead_status ===
    statusFilter;


    return (
      matchesSearch &&
      matchesStatus
    );

  });


  return (

    <ManagerLayout>

      <div className="leads-container">


        {/* Header */}
        <div className="mb-6">

          <h1 className="leads-header-title">

            Total Leads

          </h1>

          <p className="leads-header-subtitle">

            View all CRM leads

          </p>

        </div>


        {/* Filters */}
        <div className="manager-filter-card md:flex-row">


          {/* Search */}
          <div className="manager-search-box md:w-[350px]">

            <Search size={18} />

            <input

              type="text"

              placeholder="Search company or contact..."

              className="manager-search-input"

              value={search}

              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }

            />

          </div>


          {/* Status Filter */}
          <select

            className="manager-filter-select"

            value={statusFilter}

            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }

          >

            <option value="all">
              All Status
            </option>

            <option value="new">
              New
            </option>

            <option value="contacted">
              Contacted
            </option>

            <option value="qualified">
              Qualified
            </option>

            <option value="proposal_sent">
              Proposal Sent
            </option>

            <option value="converted">
              Converted
            </option>

            <option value="lost">
              Lost
            </option>

          </select>

        </div>


        {/* Table */}
        <div className="leads-card overflow-x-auto">

          <table className="w-full">


            {/* Table Header */}
            <thead>

              <tr className="border-b">

                <th className="table-head">
                  Company
                </th>

                <th className="table-head">
                  Contact Person
                </th>

                <th className="table-head">
                  Phone
                </th>

                <th className="table-head">
                  Email
                </th>

                <th className="table-head">
                  Source
                </th>

                <th className="table-head">
                  Lead Mode
                </th>

                <th className="table-head">
                  Status
                </th>

                <th className="table-head text-center">
                  Action
                </th>

              </tr>

            </thead>


            {/* Table Body */}
            <tbody>

              {

                filteredLeads.length > 0 ? (

                  filteredLeads.map(
                  (lead) => (

                  <tr

                    key={lead.id}

                    className="table-row"

                  >


                    <td className="table-data">

                      {lead.company_name}

                    </td>


                    <td className="table-data">

                      {lead.contact_person_name}

                    </td>


                    <td className="table-data">

                      {lead.phone}

                    </td>


                    <td className="table-data">

                      {lead.email}

                    </td>


                    <td className="table-data">

                      {lead.source}

                    </td>


                    <td className="table-data">

                      {lead.lead_mode}

                    </td>


                    <td className="table-data">

                      {lead.lead_status}

                    </td>


                    <td className="table-data text-center">

                      <button

                        onClick={() =>
                          handleDelete(
                            lead.id
                          )
                        }

                        className="delete-btn"

                      >

                        <Trash2 size={18} />

                      </button>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="8"
                    className="text-center p-6 text-gray-500"
                  >

                    No Leads Found

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