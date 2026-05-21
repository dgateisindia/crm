import Sidebar from "../components/Sidebar";

import Topbar from "../components/Topbar";


export default function ManagerLayout({
  children
}) {

  return (

    <div className="flex min-h-screen">


      {/* Sidebar */}
      <Sidebar />


      {/* Main Content */}
      <div className="flex-1 bg-gray-100 h-screen overflow-hidden">


        {/* Topbar */}
        <Topbar />


        {/* Page Content */}
        <div className="p-6">

          {children}

        </div>

      </div>

    </div>

  );

}