function Sidebar() {

    return (

        <div className="w-[250px] min-h-screen bg-[#051432] text-white flex flex-col justify-between p-5">

            {/* TOP SECTION */}

            <div>

                {/* LOGO */}

                <h1 className="text-3xl font-bold mb-10">
                    CRM
                </h1>


                {/* MENU ITEMS */}

                <div className="space-y-3">

                    <div className="bg-blue-600 p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition">
                        Dashboard
                    </div>

                    <div className="p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition">
                        Leads
                    </div>

                    <div className="p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition">
                        Employees
                    </div>

                    <div className="p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition">
                        Follow Ups
                    </div>

                    <div className="p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition">
                        Reports
                    </div>

                    <div className="p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition">
                        Settings
                    </div>

                </div>

            </div>


            {/* BOTTOM SECTION */}

            <div>

                <div className="p-3 rounded-lg cursor-pointer hover:bg-red-600 transition">

                    Logout

                </div>

            </div>

        </div>

    )

}

export default Sidebar;