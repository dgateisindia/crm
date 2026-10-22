import "../../styles/WelcomePopup.css";

import {
  Sunrise,
  Sun,
  Sunset,
  MoonStar,
  AlertTriangle,
  CalendarCheck,
  ClipboardList,
  ListTodo,
  Star,
} from "lucide-react";

export default function WelcomePopup({
  open,
  onClose,
  data,
  onOpenTasks,
}) {
  if (!open || !data) return null;

  // ==========================
  // Greeting Based on Time
  // ==========================
  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return {
        greeting: "Good Morning",
        Icon: Sunrise,
      };
    }

    if (hour >= 12 && hour < 17) {
      return {
        greeting: "Good Afternoon",
        Icon: Sun,
      };
    }

    if (hour >= 17 && hour < 21) {
      return {
        greeting: "Good Evening",
        Icon: Sunset,
      };
    }

    return {
      greeting: "Good Night",
      Icon: MoonStar,
    };
  };

  const { greeting, Icon: GreetingIcon } = getGreeting();

  // ==========================
  // Welcome Popup
  // ==========================
  return (
    <div className="welcomeOverlay">
      <div className="welcomeCard">
        {/* Header */}
        <div className="welcomeHeader">
          <h2 className="welcomeTitle">
            <GreetingIcon size={32} />

            <span>
              {greeting}, {data.employeeName}
            </span>
          </h2>

          <p>Welcome back to DGATE CRM</p>
        </div>

        {/* Statistics */}
        <div className="welcomeStats">
          {/* Overdue Followups */}
          <div className="welcomeStat overdue">
            <AlertTriangle size={26} />

            <h3>{data.overdueFollowups ?? 0}</h3>

            <p>Overdue Followups</p>
          </div>

          {/* Today's Followups */}
          <div className="welcomeStat today">
            <CalendarCheck size={26} />

            <h3>{data.todayFollowups ?? 0}</h3>

            <p>Today's Followups</p>
          </div>

          {/* Pending Tasks */}
          <div className="welcomeStat pending">
            <ClipboardList size={26} />

            <h3>{data.pendingTasks ?? 0}</h3>

            <p>Pending Tasks</p>
          </div>

          {/* Important Leads */}
          <div className="welcomeStat important">
            <Star size={26} />

            <h3>{data.importantLeads ?? 0}</h3>

            <p>Important Leads</p>
          </div>

         
        </div>

        {/* Footer */}
        <div className="welcomeButtons">
          <button
            className="taskBtn"
            onClick={onOpenTasks}
          >
            Open Task Followups
          </button>

          <button
            className="closeBtn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}