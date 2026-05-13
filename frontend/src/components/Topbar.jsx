import "../styles/Topbar.css";

export default function Topbar(){
    const today = new Date().toLocaleDateString();


    return(
        <div className="topbar">
            <h1 className="topbar-title">
                Manager  Dashboard
            </h1>
            <p className="topbar-date">
                {today}
            </p>
        </div>
    );
}