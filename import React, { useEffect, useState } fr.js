import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import { useLocation } from "react-router-dom";
import { DataGrid } from '@mui/x-data-grid';
import { Tabs, Tab, Button, TextField } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { Link } from "react-router-dom";
 
const BuildsSummary = ({setActiveSandboxesCount}) => {
    const [sandboxData, setSandboxData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [deprovData, setDeprovData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [startDate, setStartDate] = useState(getDateOneWeekAgo());
    const [endDate, setEndDate] = useState(new Date());
    // const [activeSandboxesCount, setActiveSandboxesCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
    const location = useLocation();
 
    function getDateOneWeekAgo() {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date;
    }
 
    useEffect(() => {
        // Extract search parameters from the URL
        const params = new URLSearchParams(location.search);
        const searchQuery = params.get('search');
 
        if (searchQuery) {
            // Set the search term based on the query parameter
            // setSearchTerm(searchQuery.split(':')[1]); // Assuming format is "result:Succeeded"
            setSearchTerm(searchQuery); // Assuming format is "result:Succeeded"
           
        }
 
        fetchSandboxData();
 
    }, [location.search, setActiveSandboxesCount]);
 
    const fetchSandboxData = async () => {
        try {
            const provResponse = await axios.get("https://ie-dashboard-backend.realpage.com/daily_builds");
            const deprovResponse = await axios.get("https://ie-dashboard-backend.realpage.com/daily_builds_deprov");
 
            // Process provisioning data
            const completedProvisioningData = provResponse.data.filter(sandbox => sandbox.status === 'completed');
            const deprovMap = {};
 
            deprovResponse.data.forEach(sandbox => {
                if (sandbox.result === 'succeeded') {
                    deprovMap[`${sandbox.sandboxname}-${sandbox.applications}`] = true;
                }
            });
 
            const defaultApplications = "UPFM,AIRM,LS,OS,RPX,ACCT,MF,CD,BI";
 
            const mappedData = completedProvisioningData.map((sandbox) => ({
                id: sandbox.id || sandbox.sandboxname,
                sandboxname: sandbox.sandboxname || `pr-${sandbox.id}`,
                applications: sandbox.applications && sandbox.applications.trim() !== '' ? sandbox.applications : defaultApplications,
                source_branch: sandbox.sourcebranch,
                Start_Time: formatDateTime(sandbox.startTime),
                Finish_Time: formatDateTime(sandbox.finishTime),
                status: sandbox.status || 'unknown',
                Result: sandbox.result || ' ', // Ensure this field is correctly populated
                Active_Inactive: deprovMap[`${sandbox.sandboxname}-${sandbox.applications}`] ? 'Inactive' : 'Active',
            }));
           
            // Assuming completedProvisioningData is already defined and mappedData is created as per your logic
           
            const totalBuilds = completedProvisioningData.length; // Total builds
           
            // Debugging: Log mappedData to check its structure
            console.log("Mapped Data:", mappedData);
           
            // Calculate failed builds
            const failedBuilds = mappedData.filter(sandbox => sandbox.Result === 'failed').length;
            console.log("Failed Builds Count:", failedBuilds); // Debugging log
           
            const prBuildsCount = mappedData.filter(sandbox => sandbox.sandboxname.startsWith('pr-')).length; // Count of PR builds
            const inactiveBuildsCount = mappedData.filter(sandbox => sandbox.Active_Inactive === 'Inactive').length; // Count of inactive builds
           
            // Calculate active sandboxes count
            const activeSandboxesCount = totalBuilds - failedBuilds - prBuildsCount - inactiveBuildsCount;
            console.log("Active Sandboxes Count:", activeSandboxesCount); // Debugging log
           
            setSandboxData(mappedData);
            setFilteredData(mappedData);
            setActiveSandboxesCount(activeSandboxesCount);
           
 
            // Process deprovisioning data
            setDeprovData(deprovResponse.data.filter(sandbox => sandbox.result === 'succeeded'));
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };
 
    useEffect(() => {
        filterData();
    }, [searchTerm, startDate, endDate]);
 
    const filterData = () => {
        let filtered = sandboxData.filter(sandbox => {
            return Object.values(sandbox).some(value =>
                typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
 
        // Date filtering
        filtered = filtered.filter(sandbox => {
            const startTime = new Date(sandbox.Start_Time);
            return startTime >= startDate && startTime <= endDate;
        });
       
        setFilteredData(filtered);
    };
 
    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().slice(0, 19).replace('T', ' ');
    };
 
    // Columns for All Sandboxes
    const columns = [
        { field: "sandboxname", headerName: "Sandbox Name", flex: 1 },
        { field: "applications", headerName: "Application", flex: 1 },
        { field: "source_branch", headerName: "Branch Triggered", flex: 1 },
        { field: "Start_Time", headerName: "Start Time", flex: 1 },
        { field: "Finish_Time", headerName: "Finish Time", flex: 1 },
        { field: "status", headerName: "Status", flex: 1 },
        { field: "Result", headerName: "Result", flex: 1 },
        { field: "Active_Inactive", headerName: "Active/Inactive", flex: 1,
          renderCell: (params) => (
              <Button onClick={() => handleInactiveClick(params.row)}>
                  {params.value}
              </Button>
          )
        },
    ];
 
   // Columns for Deprovisioned Sandboxes
   const deprovColumns = [
       { field: "sandboxname", headerName: "Sandbox Name", flex: 1 },
       { field: "applications", headerName: "Application", flex: 1 },
       { field: "result", headerName: "Result", flex: 1 }
   ];
 
   // Handling click on inactive sandboxes
   const handleInactiveClick = (row) => {
       if (row.Active_Inactive === 'Inactive') {
           setTabValue(1); // Set tab index for Deprovisioned Sandboxes
           setSearchTerm(row.sandboxname); // Set the search term to the selected sandbox name
       }
   };
 
   // Exporting data to CSV
   const exportToCSV = () => {
       let csvContent =
           'data:text/csv;charset=utf-8,' +
           filteredData.map(e => Object.values(e).join(",")).join("\n");
       const link = document.createElement("a");
       link.setAttribute("href", encodeURI(csvContent));
       link.setAttribute("download", `sandbox_data_${new Date().toISOString()}.csv`);
       document.body.appendChild(link);
       link.click();
   };
 
 
 
   return (
       <Box sx={{ width: '100%' }}>
           <Tabs value={tabValue} onChange={(event, newValue) => {
               setTabValue(newValue);
               if (newValue === 0) { // When switching back to All Sandboxes tab
                   setSearchTerm(''); // Clear search term when returning to All Sandboxes
               }
           }}>
               <Tab label="All Sandboxes" />
               <Tab label="Deprovisioned Sandboxes" component={Link} to="/deprovision" />
               <Link to="/overview" component={Tab} label="Overview" />
                <Link to={`/builds-summary?search=${searchTerm}`} component={Tab} label="BuildsSummary" />
           </Tabs>
           <Box sx={{ display: 'flex', mb: '16px', alignItems: 'center' }}>
               <TextField
                   variant="outlined"
                   placeholder="Search..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   sx={{ width: '50%', mr: '16px' }}
               />
               {/* From and To Date Fields - Only show for All Sandboxes tab */}
               {tabValue === 0 && (
                   <>
                       <Box sx={{ display: 'flex', alignItems: 'center', mr: '16px' }}>
                           <label>From:</label>
                           <TextField
                               type="date"
                               value={startDate.toISOString().split('T')[0]}
                               onChange={(e) => {
                                   const value = e.target.value;
                                   if (value) {
                                       setStartDate(new Date(value));
                                   } else {
                                       setStartDate(getDateOneWeekAgo()); // Reset to default date if input is cleared
                                   }
                               }}
                               sx={{ ml: '8px' }}
                           />
                       </Box>
                       <Box sx={{ display: 'flex', alignItems: 'center', mr: '16px' }}>
                           <label>To:</label>
                           <TextField
                               type="date"
                               value={endDate.toISOString().split('T')[0]}
                               onChange={(e) => {
                                   const value = e.target.value;
                                   if (value) {
                                       setEndDate(new Date(value));
                                   } else {
                                       setEndDate(new Date()); // Reset to today's date if input is cleared
                                   }
                               }}
                               sx={{ ml: '8px' }}
                           />
                       </Box>
 
                   </>
               )}
               <Button variant="contained" startIcon={<DownloadIcon />} onClick={exportToCSV}>
                   Export Data
               </Button>
           </Box>
           {tabValue === 0 && (
               <Box sx={{ height: '400px', width: '100%' }}>
                   <DataGrid
                       autoHeight
                       paginationModel={paginationModel}
                       onPaginationModelChange={setPaginationModel}
                       rows={filteredData}
                       columns={columns}
                       loading={loading}
                   />
               </Box>
           )}
           {tabValue === 1 && (
               <Box sx={{ height: '400px', width: '100%' }}>
                   <DataGrid
                       autoHeight
                       paginationModel={paginationModel}
                       onPaginationModelChange={setPaginationModel}
                       rows={deprovData.filter(sandbox =>
                           (sandbox.sandboxname && sandbox.sandboxname.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (sandbox.applications && sandbox.applications.toLowerCase().includes(searchTerm.toLowerCase()))
                       )}
                       columns={deprovColumns}
                       loading={loading}
                   />
               </Box>
           )}
       </Box>
   );
};
 
export default BuildsSummary;
 
 