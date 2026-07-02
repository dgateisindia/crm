import "../../styles/WelcomePopup.css";

import {
  Sunrise,
  Sun,
  Sunset,
  MoonStar,
  AlertTriangle,
  CalendarCheck,
  ClipboardList,
  Star,
  Clock3,
  Building2,
} from "lucide-react";

export default function WelcomePopup({
  open,
  onClose,
  data,
  onOpenTasks,
}) {

  if (!open || !data) return null;

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

          <p>

            Welcome back to DGATE CRM

          </p>

        </div>

        {/* Statistics */}

        <div className="welcomeStats">

          <div className="welcomeStat overdue">

            <AlertTriangle size={26} />

            <h3>

              {data.overdueFollowups}

            </h3>

            <p>

              Overdue Followups

            </p>

          </div>

          <div className="welcomeStat today">

            <CalendarCheck size={26} />

            <h3>

              {data.todayFollowups}

            </h3>

            <p>

              Today's Followups

            </p>

          </div>

          <div className="welcomeStat pending">

            <ClipboardList size={26} />

            <h3>

              {data.pendingTasks}

            </h3>

            <p>

              Pending Tasks

            </p>

          </div>

          <div className="welcomeStat important">

            <Star size={26} />

            <h3>

              {data.importantLeads}

            </h3>

            <p>

              Important Leads

            </p>

          </div>

        </div>

        {/* Today's Schedule */}

        <div className="todaySchedule">

          <h3>

            Today's Schedule

          </h3>

          {

            data.today?.length === 0

            ?

            (

              <p className="noTasks">

                🎉 No follow-ups scheduled for today.

              </p>

            )

            :

            (

              data.today?.map((item, index) => (

                <div

                  key={index}

                  className="scheduleItem"

                >

                  <div className="scheduleLeft">

                    <Clock3 size={16} />

                    <span>

                        {new Date(item.next_followup_date).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                        })}
                    </span>

                  </div>

                  <div className="scheduleRight">

                    <Building2 size={16} />

                    <strong>

                      {item.company_name}

                    </strong>

                  </div>

                </div>

              ))

            )

          }

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