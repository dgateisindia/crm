import Sidebar from "../components/Sidebar";

function Dashboard() {

    return (

        <div className="flex">

            <Sidebar />

            <div className="flex-1 p-5 bg-gray-100">

                <h1 className="text-3xl font-bold">
                    Manager Dashboard
                </h1>

            </div>

        </div>

    )

}

export default Dashboard;