export default function StatCard({
  type = "small",
  title,
  value,
  subtitle = "",
  trend = "",
  icon,
  color,
  onClick,
}) {
  // ==========================
  // Large Summary Card
  // ==========================
  if (type === "summary") {
    return (
      <div
        className="summary-card cursor-pointer"
        onClick={onClick}
      >
        <div className="summary-left">

          <div className={`summary-icon ${color}-bg`}>
            {icon}
          </div>

          <div>

            <h3 className="summary-title">
              {title}
            </h3>

            <h1 className="summary-value">
              {value}
            </h1>

            <p className="summary-subtitle">
              {subtitle}
            </p>

          </div>

        </div>

        {trend && (
          <div className="summary-trend">
            {trend}
          </div>
        )}

      </div>
    );
  }

  // ==========================
  // Small Cards
  // ==========================
  return (
    <div
      className={`dashboard-card ${color}-card cursor-pointer`}
      onClick={onClick}
    >
      <div className="dashboard-card-top">

        <div className={`icon-circle ${color}-bg`}>
          {icon}
        </div>

      </div>

      <h3>{title}</h3>

      <h2>{value}</h2>

      

    </div>
  );
}