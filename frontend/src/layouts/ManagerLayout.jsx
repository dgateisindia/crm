import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";


export default function ManagerLayout({children}){
    return(
        <div className="flex">
            <Sidebar/>

            <div className="flex-1 bg-gray-100 min-h-screen">
                <Topbar/>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}