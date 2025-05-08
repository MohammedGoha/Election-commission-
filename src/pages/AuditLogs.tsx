import { useState, useEffect } from "react";
type AuditLogs = {
  auditorId: string;
  action: string;
  timestamp: string;
};
const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLogs[]>([]);
  const FetchLogs = async () => {
    const res = await fetch("http://localhost:4000/audits/logs");
    const data = await res.json();
    setLogs(data);
  };
  useEffect(() => {
    FetchLogs();
  },[]);

  const showThat =
    logs.length > 0 ? (
      logs.map((log) => (
        <div key={log.timestamp} className="Alerts">
          <div className="p-6 rounded-xl shadow-lg border border-gray-200">
            <h1>{log.auditorId}</h1>
            <h2>{log.action}</h2>
            <h2>{log.timestamp}</h2>
          </div>
        </div>
      ))
    ) : (
      <h1>كل شئ يسير كما هو مخطط له</h1>
    );
  console.log(logs);
  return (
    <div>
      <div>
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-center mb-8">
            سجلات المراجعة
          </h1>
          {showThat}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
