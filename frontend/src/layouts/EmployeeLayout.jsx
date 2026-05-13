import EmployeeSidebar from "../components/EmployeeSidebar";

export default function EmployeeLayout({
  children,
}) {
  return (
    <div className="flex">

      <EmployeeSidebar />

      <div className="flex-1 ml-[260px] bg-gray-100 min-h-screen p-6">
        {children}
      </div>

    </div>
  );
}