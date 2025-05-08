import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./login/Login";
import Sidebar from "./components/Sidebar";
import CreateElection from "./pages/CreateElection";
import ManageElection from "./pages/ManageElection";
import VoterParticipation from "./pages/VoterParticipation";
import ElectionResults from "./pages/ElectionResults";
import CurrentElection from "./pages/CurrentElection";
import AuditLogs from "./pages/AuditLogs";
import SecurityAlerts from "./pages/SecurityAlerts";
import Welcome from "./pages/welcome";
import { useState } from "react";
function App() {
  const [logedIn, setLogedIn] = useState(false);
  const loged = (): void => {
    setLogedIn(true);
  };
  if (logedIn) {
    return (
      <BrowserRouter>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/election/create" element={<CreateElection />} />
              <Route path="/election/manage" element={<ManageElection />} />
              <Route
                path="/voters/participation"
                element={<VoterParticipation />}
              />
              <Route path="/election/results" element={<ElectionResults />} />
              <Route
                path="/currentElection"
                element={<CurrentElection />}
              />
              <Route path="/audits/logs" element={<AuditLogs />} />
              <Route path="/security/alerts" element={<SecurityAlerts />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    );
  } else {
    return <Login getMeIn={loged} />;
  }
}

export default App;
