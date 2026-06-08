import "../styles/topbar.css";
import { CalendarDays,  } from "lucide-react";

export default function Topbar() {

  const today = new Date();

  const formattedDate =
    today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

  return (
    <div className="topbar">

      <h1 className="topbar-title">
        Employee Dashboard
      </h1>

      <div className="date-box">

        <CalendarDays
          size={16}
          className="date-icon"
        />

        <span className="date-text">
          {formattedDate}
        </span>

        
      </div>

    </div>
  );
}