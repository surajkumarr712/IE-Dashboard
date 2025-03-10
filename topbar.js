import React from "react";
import { Link } from "react-router-dom";
import './topbar.css'; // Make sure to import your CSS file

function TopBar() {
  return (
    <nav className="topbar">
      <ul>
        <li>
          <Link to="/rp1-npvcf-int1">rp1-npvcf-int1</Link>
        </li>
        <li>
          <Link to="/rp1-npvcf-oracle1">rp1-npvcf-oracle1</Link>
        </li>
        {/* // vcf-vcloud ledhu */}
        <li>
          <Link to="/vms">VMS</Link>
        </li>
      </ul>
    </nav>
  );
}

export default TopBar;