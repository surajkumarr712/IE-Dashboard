import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
 
const AgentPools = () => {
  const [provisioningAgents, setProvisioningAgents] = useState([]);
  const [deprovisioningAgents, setDeprovisioningAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [showTable, setShowTable] = useState(false); // New state for toggling view
 
  // Pagination states
  const [currentPageProv, setCurrentPageProv] = useState(0);
  const [currentPageDeprov, setCurrentPageDeprov] = useState(0);
  const rowsPerPage = 7; // Set number of rows per page to 7
 
  const fetchAgents = async () => {
    try {
      const provisioningResponse = await fetch("https://ie-dashboard-backend.realpage.com/prov");
      if (!provisioningResponse.ok) throw new Error(`HTTP error! Status: ${provisioningResponse.status}`);
      const provisioningData = await provisioningResponse.json();
      setProvisioningAgents(provisioningData.agents); // Ensure agents include id
 
      const deprovisioningResponse = await fetch("https://ie-dashboard-backend.realpage.com/deprov");
      if (!deprovisioningResponse.ok) throw new Error(`HTTP error! Status: ${deprovisioningResponse.status}`);
      const deprovisioningData = await deprovisioningResponse.json();
      setDeprovisioningAgents(deprovisioningData.agents); // Ensure agents include id
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchAgents();
  }, []);
 
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
 
  // Count online and offline agents
  const countStatus = (agents) => {
    if (!Array.isArray(agents)) {
      console.error("Expected an array but got:", agents);
      return {};
    }
 
    return agents.reduce((acc, agent) => {
      acc[agent.status] = (acc[agent.status] || []).concat(agent.name); // Store names in an array
      return acc;
    }, {});
  };
 
  const provisioningStatusCount = countStatus(provisioningAgents);
  const deprovisioningStatusCount = countStatus(deprovisioningAgents);
 
  // Data for Doughnut charts
  const provisioningData = {
    labels: ['Online', 'Offline'],
    datasets: [{
      data: [provisioningStatusCount['online']?.length || 0, provisioningStatusCount['offline']?.length || 0],
      backgroundColor: ['#28a745', '#dc3545'], // Green and red colors
    }],
  };
 
  const deprovisioningData = {
    labels: ['Online', 'Offline'],
    datasets: [{
      data: [deprovisioningStatusCount['online']?.length || 0, deprovisioningStatusCount['offline']?.length || 0],
      backgroundColor: ['#28a745', '#dc3545'], // Green and red colors
    }],
  };
 
  // Inline styles
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    padding: '20px',
    boxSizing: 'border-box',
    position: 'relative',
    backgroundColor: '#f8f9fa', // Light background color
    borderRadius: '8px', // Rounded corners for the container
    boxShadow: '0px 2px 10px rgba(0,0,0,0.1)', // Subtle shadow for depth
  };
 
  const titleStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '1200px',
    marginBottom: '10px',
    marginTop: '20px',
    color: '#343a40', // Dark text color
  };
 
  const statusStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '1200px',
    marginBottom: '20px',
    color: '#6c757d', // Muted text color for status counts
  };
 
  const tableContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '1200px',
    marginBottom: '20px',
  };
 
 
// Button style for "Switch View"
const buttonStyle = {
position: 'absolute',
top: '10px',
right: '30px',
padding: '10px 20px',
backgroundColor: '#007bff', // Bootstrap primary color
color: '#fff',
border: 'none',
borderRadius: '5px',
cursor: 'pointer',
transition: 'background-color 0.3s ease', // Smooth transition for hover effect
};
 
const buttonHoverStyle = {
backgroundColor: '#0056b3', // Darker blue on hover
};
 
// Modal styles
const modalStyle = {
display: modalIsOpen ? 'block' : 'none',
position: 'fixed',
zIndex: '1000',
left: '0',
top: '0',
width: '100%',
height: '100%',
overflow: 'auto',
backgroundColor: 'rgba(0,0,0,0.5)',
};
 
const modalContentStyle = {
backgroundColor: '#fff',
margin: '15% auto',
padding: '20px',
borderRadius: '5px',
width: '80%',
maxWidth: '500px',
};
 
// Handle segment clicks to show agent names
const handleSegmentClick = (event, elements) => {
if (elements.length > 0) {
const index = elements[0].index;
const statusKey = index === 0 ? 'online' : 'offline';
const agents = provisioningStatusCount[statusKey] || [];
setSelectedAgents(agents);
setModalIsOpen(true);
}
};
 
// Pagination logic for tables
const handleNextProvPage = () => {
if ((currentPageProv +1) * rowsPerPage < provisioningAgents.length) {
setCurrentPageProv(currentPageProv +1);
}
};
 
const handlePrevProvPage = () => {
if (currentPageProv >0) {
setCurrentPageProv(currentPageProv -1);
}
};
 
const handleNextDeprovPage = () => {
if ((currentPageDeprov +1) * rowsPerPage < deprovisioningAgents.length) {
setCurrentPageDeprov(currentPageDeprov +1);
}
};
 
const handlePrevDeprovPage = () => {
if (currentPageDeprov >0) {
setCurrentPageDeprov(currentPageDeprov -1);
}
};
 
// Calculate displayed rows based on current page and rows per page
const displayedProvisioningAgents =
        provisioningAgents.slice(
          currentPageProv * rowsPerPage,
          (currentPageProv +1) * rowsPerPage,
        );
 
const displayedDeprovisioningAgents =
        deprovisioningAgents.slice(
          currentPageDeprov * rowsPerPage,
          (currentPageDeprov +1) * rowsPerPage,
        );
 
return (
<div style={containerStyle}>
{/* Switch View Button */}
<h1>Agents Status</h1>
<button style={buttonStyle} onClick={() => setShowTable(!showTable)}>
Switch View
</button>
 
{/* Static Titles with Counts */}
<div style={titleStyle}>
<h2 style={{ marginRight:"20px" }}>
ie-provision-pool (Count = {
   (provisioningStatusCount['online']?.length || 0) +
   (provisioningStatusCount['offline']?.length || 0)
})
</h2>
<h2>
ie-deprovision-pool (Count = {
   (deprovisioningStatusCount['online']?.length || 0) +
   (deprovisioningStatusCount['offline']?.length || 0)
})
</h2>
</div>
 
{/* Status Counts */}
<div style={statusStyle}>
<span>
Online Count (Provisioning): {provisioningStatusCount['online']?.length || 0}
</span>
<span>
Online Count (Deprovisioning): {deprovisioningStatusCount['online']?.length || 0}
</span>
</div>
<div style={statusStyle}>
<span>
Offline Count (Provisioning): {provisioningStatusCount['offline']?.length || 0}
</span>
<span>
Offline Count (Deprovisioning): {deprovisioningStatusCount['offline']?.length || 0}
</span>
</div>
 
{/* Conditional Rendering for Tables */}
<div style={tableContainerStyle}>
{showTable ? (
<>
<div style={{ flexBasis:"48%", marginRight:"4%" }}>
<table style={{ width:'100%', borderCollapse:'collapse', backgroundColor:'#fff' }}>
<thead>
<tr>
<th>ID</th>
<th>Name</th>
<th>Status</th>
</tr>
</thead>
<tbody>
{displayedProvisioningAgents.map((agent, index) => (
<tr key={agent.id} style={{
backgroundColor:index %2 ===0 ? '#f9f9f9' : '#ffffff', // Alternating row colors
transition:'background-color .3s' }}>
<td>{agent.id}</td>
<td>{agent.name}</td>
<td>{agent.status}</td>
</tr>
))}
</tbody>
</table>
 
{/* Pagination Controls for Provisioning Agents */}
<div style={{ display:'flex', justifyContent:'space-between'}}>
<button onClick={handlePrevProvPage} disabled={currentPageProv ===0}>
Previous
</button>
<button onClick={handleNextProvPage} disabled={(currentPageProv +1)*rowsPerPage >= provisioningAgents.length}>
Next
</button>
<span> Page {currentPageProv +1} of {Math.ceil(provisioningAgents.length / rowsPerPage)}</span>
</div>
</div>
 
<div style={{ flexBasis:"48%" }}>
<table style={{ width:'100%', borderCollapse:'collapse', backgroundColor:'#fff' }}>
<thead>
<tr>
<th>ID</th>
<th>Name</th>
<th>Status</th>
</tr>
</thead>
<tbody>
{displayedDeprovisioningAgents.map((agent, index) => (
<tr key={agent.id} style={{
backgroundColor:index %2 ===0 ? '#f9f9f9' : '#ffffff', // Alternating row colors
transition:'background-color .3s' }}>
<td>{agent.id}</td>
<td>{agent.name}</td>
<td>{agent.status}</td>
</tr>
))}
</tbody>
</table>
 
{/* Pagination Controls for Deprovisioning Agents */}
<div style={{ display:'flex', justifyContent:'space-between'}}>
<button onClick={handlePrevDeprovPage} disabled={currentPageDeprov ===0}>
Previous
</button>
<button onClick={handleNextDeprovPage} disabled={(currentPageDeprov +1)*rowsPerPage >= deprovisioningAgents.length}>
Next
</button>
<span> Page {currentPageDeprov +1} of {Math.ceil(deprovisioningAgents.length / rowsPerPage)}</span>
</div>
 
</div>
 
</>
 
) : (
<>
<div style={{ flexBasis:"50%" }}>
<Doughnut data={provisioningData} onElementsClick={handleSegmentClick} />
</div>
<div style={{ flexBasis:"50%" }}>
<Doughnut data={deprovisioningData} onElementsClick={handleSegmentClick} />
</div>
</>
)}
</div>
 
{/* Custom Modal for displaying agent names */}
<div style={modalStyle} onClick={() => setModalIsOpen(false)}>
<div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
<h2>Agent Names</h2>
<ul>
{selectedAgents.map((agent, index) => (
<li key={index}>{agent}</li>
))}
</ul>
<button onClick={() => setModalIsOpen(false)}>Close</button>
</div>
</div>
 
{/* Adding some basic styles for tables */}
<style jsx>{`
table {
width : calc(100% -20px);
margin-bottom :20px;
border-collapse :collapse;
}
th, td{
border :1px solid #ddd;
padding :8px;
text-align :left;
}
th{
background-color :#007bff; /* Header background color */
color:#fff; /* Header text color */
}
/* Hover effect for table rows */
tr:hover {
background-color:#e9ecef; /* Light gray background on hover */
}
/* Ensuring tables are responsive */
@media(max-width :600px){
table{
width:auto; /* Allow tables to shrink on small screens */
}
}
`}</style>
 
</div>
 
);
 
};
 
export default AgentPools;
 
 