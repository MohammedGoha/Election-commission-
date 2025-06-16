import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import CreateElection from "./pages/CreateElection";
import ManageElection from "./pages/ManageElection";
import PublishElection from "./pages/PublishElection";
// import VoterParticipation from "./pages/VoterParticipation";
import CurrentElection from "./pages/CurrentElection";
// import Welcome from "./pages/welcome";
import RegisterPage from "./login/RegisterPage";
import Login from "./login/Login";
import UsersPage from "./pages/UsersPage";
import ChainCodeEvents from "./pages/ChaincodeEvents";
import { useAuth } from "./context/AuthContext";
import TallyVerification from "./pages/TallyVerification";
import VoterActivityLog from "./pages/VoterActivityLog";
// import SecurityAlerts from "./pages/SecurityAlerts";
import { useEffect } from "react";

function App() {
  const { isLoggedIn, isAuthorized, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Save current route to localStorage when it changes
  useEffect(() => {
    if (isLoggedIn && isAuthorized) {
      localStorage.setItem("last_route", location.pathname + location.search);
    }
  }, [location, isLoggedIn, isAuthorized]);

  // Redirect to last route after login/authorization
  useEffect(() => {
    if (isLoggedIn && isAuthorized) {
      const lastRoute = localStorage.getItem("last_route");
      if (
        lastRoute &&
        lastRoute !== window.location.pathname + window.location.search
      ) {
        navigate(lastRoute, { replace: true });
      }
    }
  }, [isLoggedIn, isAuthorized, navigate]);

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/*" element={<RegisterPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  if (!isAuthorized) {
    return (
      <Routes>
        <Route path="/*" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  // Authenticated + Authorized view
  let routes = null;
  if (role === "election_commission") {
    routes = (
      <Routes>
        <Route path="/currentElection/:id" element={<CurrentElection />} />
        <Route path="/election/create" element={<CreateElection />} />
        <Route path="/election/manage" element={<ManageElection />} />
        <Route path="/election/results" element={<PublishElection />} />
        <Route path="/users/manage" element={<UsersPage />} />
        <Route path="/system/logs" element={<ChainCodeEvents />} />
        <Route path="/audits/voter-activity" element={<VoterActivityLog />} />
        <Route path="*" element={<Navigate to="/election/create" />} />
      </Routes>
    );
  } else if (role === "auditor") {
    routes = (
      <Routes>
        <Route path="/currentElection/:id" element={<CurrentElection />} />
        <Route path="/election/manage" element={<ManageElection />} />
        <Route path="/users/manage" element={<UsersPage />} />
        <Route path="/system/logs" element={<ChainCodeEvents />} />
        <Route
          path="/audit/tally-verification"
          element={<TallyVerification />}
        />
        <Route path="/audits/voter-activity" element={<VoterActivityLog />} />
        <Route path="*" element={<Navigate to="/election/manage" />} />
      </Routes>
    );
  } else {
    // fallback: show nothing or a message
    routes = <div>غير مصرح</div>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">{routes}</main>
    </div>
  );
}

export default App;
