import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BsFillHouseFill } from 'react-icons/bs'; // Overview
import { GiSettingsKnobs } from 'react-icons/gi'; // Sandbox
import { AiFillAppstore, AiFillProduct  } from 'react-icons/ai'; // vCenter Resources
import { MdAssessment } from 'react-icons/md'; // Performance metrics
import { FaBars, FaTimes, FaBox, FaCalendarAlt } from 'react-icons/fa'; // Hamburger and Close icons
import { GrVirtualMachine, GrStatusGood } from "react-icons/gr";
import { FaUsersRectangle } from "react-icons/fa6";
import { VscLayersActive, VscServerEnvironment} from "react-icons/vsc";
// import "./Navbar.css";

function Navbar() {
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [buildOpen, setBuildOpen] = useState(false);
  const [vCenterOpen, setVCenterOpen] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(true); // State for navbar toggle
  const [iconOnly, setIconOnly] = useState(false); // State for icon-only mode

  const toggleNavbar = () => {
    setNavbarOpen(!navbarOpen); // Toggle the navbar open/close state
    setIconOnly(!iconOnly); // Toggle the icon-only mode
  };

  const toggleSandbox = () => setSandboxOpen(!sandboxOpen);
  const toggleBuild = () => setBuildOpen(!buildOpen);
  const toggleVCenter = () => setVCenterOpen(!vCenterOpen);

  return (
    <nav className={`navbar ${navbarOpen ? 'open' : ''}`}>
      <div>
      <button className="navbar-toggle" onClick={toggleNavbar}>
        {navbarOpen ? <FaTimes /> : <FaBars />} {/* Toggle button */}
      </button>
      <div className="dashboard-title">
        <h1>IE-DASHBOARD</h1>
      </div>
      </div>
      <ul>
        <li>
          <Link to="/overview" ><BsFillHouseFill /> {!iconOnly && "Overview"}</Link>
        </li>
        <li>
          <Link to="/daily-builds"><GiSettingsKnobs /> {!iconOnly && "Daily Builds"}</Link>
        </li>
        <li onClick={toggleSandbox}>
         <div>
         <FaBox /> {!iconOnly && "Sandbox"}
               <span className="toggle-icon">{sandboxOpen ? '▲' : '▼'}</span>
         </div>
         </li>
         {sandboxOpen && (
          <ul style={{marginLeft: '30px'}}>
            <li><Link to="/sandbox-summary"><AiFillProduct />{!iconOnly && "Product based Sandbox"}</Link></li>
            {/* <li><Link to="/Active Sandboxes">{!iconOnly && "Active Sandboxes Count"}</Link></li> */}
          </ul>
        )}

        {/* condition when navbar is closed but toggle sandbox open */}
        {/* {sandboxOpen &&  !navbarOpen (
          
        )} */}
        
        <li onClick={toggleBuild}>
          <div>
            <MdAssessment /> {!iconOnly && "Build"}
              <span className="toggle-icon">{buildOpen ? '▲' : '▼'}</span>
          </div>
        </li>

        {buildOpen && (
          <ul style={{marginLeft: '30px'}}>
            <li><Link to="/builds-summary"><VscLayersActive />{!iconOnly && "Active Sandboxes"}</Link></li>
            {/* <li><Link to="/deprovision">{!iconOnly && "Deprovision"}</Link></li> */}
            <li><Link to="/users"><FaUsersRectangle />{!iconOnly && "Users"}</Link></li>
            <li><Link to="/environment"><VscServerEnvironment />{!iconOnly && "Environment"}</Link></li>
            <li><Link to="/agent-health"><GrStatusGood />{!iconOnly && "Agent Health"}</Link></li>
          </ul>
        )}
         <li onClick={toggleVCenter}>
         <div>
            <AiFillAppstore /> {!iconOnly && "vCenter Resources      "}
            <span className="toggle-icon">{vCenterOpen ? '▲' : '▼'}</span>
         </div>
         </li>
        {vCenterOpen && (
          <ul style={{marginLeft: '30px'}}>
            <li><Link to="/vcenter-resources">
            <GrVirtualMachine />
            {!iconOnly && "Data Stores & VM details"}</Link></li>
          </ul>
        )}
        <li>
          <Link to="/perf-metrics">
            <FaCalendarAlt /> {!iconOnly && "Performance Metrics"}
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;