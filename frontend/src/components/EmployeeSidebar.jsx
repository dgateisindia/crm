import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  PhoneCall,
  User,
  LogOut,
} from "lucide-react";

export default function EmployeeSidebar() {

  const navigate =
    useNavigate();

  const handleLogout = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "role"
    );

    navigate("/", {
      replace: true,
    });
  };

  return (
    <div className="w-[260px] h-screen bg-[#071739] text-white fixed p-5 flex flex-col justify-between">

      {/* Top */}
      <div>

        <h1 className="text-3xl font-bold mb-10">
          DGATE CRM
        </h1>

        <div className="space-y-3">

          <Link to="/employee/dashboard">
            <div className="bg-blue-600 p-4 rounded-xl flex gap-3">
              <LayoutDashboard />
              Dashboard
            </div>
          </Link>

          <Link to="/employee/followups">
            <div className="p-4 rounded-xl hover:bg-blue-600 flex gap-3">
              <PhoneCall />
              Follow Ups
            </div>
          </Link>

          <Link to="/employee/profile">
            <div className="p-4 rounded-xl hover:bg-blue-600 flex gap-3">
              <User />
              Profile
            </div>
          </Link>

        </div>

      </div>

      {/* Bottom */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 transition py-3 rounded-xl"
      >
        <LogOut size={18} />
        Logout
      </button>

    </div>
  );
}