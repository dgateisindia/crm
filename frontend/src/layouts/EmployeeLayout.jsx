import EmployeeSidebar from "../components/EmployeeSidebar";

export default function EmployeeLayout({
  children,
}) {
  return (
    <div className="flex">

      <EmployeeSidebar />

      <div className="flex-4 bg-gray-100 h-screen overflow-hidden">
        {children}
      </div>

    </div>
  );
}