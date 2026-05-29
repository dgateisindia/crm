
import EmployeeSidebar from "../components/EmployeeSidebar";
import EmployeeTopbar from "../components/EmployeeTopbar";

export default function EmployeeLayout({
  children
}) {

  return (

    <div className="flex bg-gray-100">

      {/* Sidebar */}
      <EmployeeSidebar />

      {/* Main Content */}
      <main
        className="
        flex-1
        min-h-screen
        "
      >

        {/* Topbar */}
        <EmployeeTopbar />

        {/* Page Content */}
        <div className="p-6">

          {children}

        </div>

      </main>

    </div>

  );

}

