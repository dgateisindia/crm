function StatsCards() {

  const stats = [
    {
      title: "Total Leads",
      value: "1248"
    },
    {
      title: "New Leads",
      value: "342"
    },
    {
      title: "Contacted",
      value: "620"
    },
    {
      title: "Converted",
      value: "286"
    }
  ];

  return (
    <div className="stats-container">

      {stats.map((item, index) => (
        <div className="card" key={index}>

          <h4>{item.title}</h4>

          <h2>{item.value}</h2>

        </div>
      ))}

    </div>
  );
}

export default StatsCards;