import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";
import api from "../../utils/api";
import ManagerLayout from "../../layouts/ManagerLayout";

export default function ManagerNotResponded() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        setError("");

    const response = await api.get("/dashboard/manager/not-responded");

    setLeads(Array.isArray(response.data) ? response.data : []);
    
      } catch (err) {
        console.error("MANAGER NOT RESPONDED ERROR:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load Not Responded leads."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  return (
    <ManagerLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Not Responded Leads</h1>
            <p className="mt-1 text-gray-500">
              Leads that have not responded to contact attempts.
            </p>
          </div>

          <button
            onClick={() => navigate("/manager/dashboard")}
            className="flex items-center gap-2 rounded-lg border px-4 py-2"
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>
        </div>

        <div className="mb-4 rounded-lg border bg-white p-4">
          <span className="text-sm text-gray-500">
            Total Not Responded Leads
          </span>
          <p className="mt-1 text-2xl font-bold">{leads.length}</p>
        </div>

        {loading ? (
          <div className="rounded-lg border bg-white p-8 text-center">
            Loading leads...
          </div>
        ) : error ? (
          <div className="rounded-lg border bg-white p-8 text-center text-red-600">
            {error}
          </div>
        ) : leads.length === 0 ? (
          <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
            No Not Responded leads found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Company</th>
                  <th className="p-3 text-left">Contact Person</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">City</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>

              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t">
                    <td className="p-3">
                      {lead.company_name || "N/A"}
                    </td>
                    <td className="p-3">
                      {lead.contact_person_name || "N/A"}
                    </td>
                    <td className="p-3">
                      {lead.phone ? (
                        <a
                          href={`tel:${lead.phone}`}
                          className="flex items-center gap-2 text-blue-600"
                        >
                          <Phone size={15} />
                          {lead.phone}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="p-3">{lead.email || "N/A"}</td>
                    <td className="p-3">{lead.city || "N/A"}</td>
                    <td className="p-3">
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700">
                        Not Responded
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ManagerLayout>
  );
}