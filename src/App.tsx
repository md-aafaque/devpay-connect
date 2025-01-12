import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import ClientDashboard from "@/pages/ClientDashboard";
import DeveloperDashboard from "@/pages/DeveloperDashboard";
import DeveloperProfile from "@/pages/DeveloperProfile";
import Authform from "@/pages/Authform";
import CallRoom from "@/pages/CallRoom";
import { Toaster } from "sonner";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Authform />} />
        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="/developer-dashboard" element={<DeveloperDashboard />} />
        <Route path="/developers" element={<DeveloperProfile />} />
        <Route path="/call-room/:callId" element={<CallRoom />} />
      </Routes>
      <Toaster richColors />
    </Router>
  );
}

export default App;