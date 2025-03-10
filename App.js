import React, { useState } from "react"; // Import useState here
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
// import Navbar from "./components/Sidebar";
import Overview from "./Overview";
import VcenterResources from "./VcenterResources";
import DailyBuilds from "./Dailybuilds";
import "./App.css";
import BuildsSummary from "./BuildsSummary";
import SandboxSummary from "./Sandboxsummary";
import MyComponent from "./DailyDeployments";
import EnvironmentList from "./Environment";
import AgentPools from "./AgentPools";
import Users from "./users";

function App() {
  const [activeSandboxesCount, setActiveSandboxesCount] = useState(0); // Initialize state

  return (
    <Router>
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Overview activeSandboxesCount={activeSandboxesCount} />} />
          <Route path="/overview" element={<Overview activeSandboxesCount={activeSandboxesCount} />} />
          <Route path="/sandbox-summary" element={<SandboxSummary />} />
          <Route path="/daily-builds" element={<DailyBuilds />} />
          <Route path="/builds-summary" element={<BuildsSummary setActiveSandboxesCount={setActiveSandboxesCount} />} />
          <Route path="/deprovision" element={<BuildsSummary  />} />
          <Route path="/environment" element={<EnvironmentList />} />
          <Route path="/agent-health" element={<AgentPools />} />            
          <Route path="/users" element={<Users />} />      
          <Route path="/vcenter-resources" element={<VcenterResources />} />
          <Route path="/perf-metrics" element={<MyComponent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
