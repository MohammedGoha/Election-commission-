import { useEffect, useState } from "react";

type alert = {
  id: number;
  type: string;
  timestamp: string;
  description: string;
};
const SecurityAlerts = () => {
  const [refresh, setRef] = useState(0);
  const [alerts, setAlerts] = useState<alert[]>([]);
  const fetchSecurityAlerts = async () => {
    console.log("fetching");
    const res = await fetch("http://localhost:4000/security/alerts");
    const data = await res.json();
    setAlerts(data);
  };
  setTimeout(() => {
    setRef(refresh + 1);
  }, 10000);
  useEffect(() => {
    fetchSecurityAlerts();
  }, [refresh]);
  let showThat;
  if (alerts.length > 0) {
    showThat = alerts.map((oneAlert) => {
      if (oneAlert.type == "تنبيه أمني") {
        return (
          <div key={oneAlert.timestamp} className="Alerts">
            <div className="p-6 rounded-xl shadow-lg border border-gray-200 bg-red-300">
              <h1>{oneAlert.type}</h1>
              <h2>{oneAlert.description}</h2>
              <h2>{oneAlert.timestamp}</h2>
            </div>
          </div>
        );
      } else {
        return (
          <div key={oneAlert.timestamp} className="Alerts">
            <div className="p-6 rounded-xl shadow-lg border border-gray-200 bg-orange-300">
              <h1>{oneAlert.type}</h1>
              <h2>{oneAlert.description}</h2>
              <h2>{oneAlert.timestamp}</h2>
            </div>
          </div>
        );
      }
    });
  } else {
    showThat = <h1>كل شئ يسير كما هو مخطط له</h1>;
  }
  return (
    <div>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">
          تنبيهات الامان في الانتخابات الحالية
        </h1>
        {showThat}
      </div>
    </div>
  );
};

export default SecurityAlerts;
