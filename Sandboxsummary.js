import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import Papa from 'papaparse';
import { Button, TextField } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
 
const SandboxSummary = () => {
  const [sandboxData, setSandboxData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(getDateOneWeekAgo());
  const [endDate, setEndDate] = useState(new Date());
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
 
 
  function getDateOneWeekAgo() {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  }
 
  // Function to format date as YYYY-MM-DD HH:mm:ss
  const formatDateTime = (date) => {
    if (!date) return '';
    return date.toISOString().slice(0, 19).replace('T', ' '); // Format as YYYY-MM-DD HH:mm:ss
  };
 
  // Fetch sandbox data
  const fetchSandboxData = async () => {
    try {
      const response = await axios.get("https://ie-dashboard-backend.realpage.com/daily_builds");

      const defaultApplications = "UPFM,AIRM,LS,OS,RPX,ACCT,MF,CD,BI"; 

      const mappedData = response.data.flatMap((sandbox) => {
        // Ensure applications is always treated as an array
        const applicationsArray = sandbox.applications && sandbox.applications.trim() !== '' ? sandbox.applications.split(',').map(app => app.trim()) : defaultApplications.split(',').map(app => app.trim());

       

        if (sandbox.status === 'inProgress') return [];
        const startTime = new Date(sandbox.startTime);
        let finishTime;
 
        if (sandbox.status === 'inProgress') {
          finishTime = null;
        } else {
          finishTime = new Date(sandbox.finishTime);
        }
 
        let totalMinutes = 0;
        if (finishTime && !isNaN(finishTime.getTime())) {
          const differenceInMs = finishTime - startTime;
          totalMinutes = Math.floor(differenceInMs / (1000 * 60));
        }
 
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
 
        // Parse application counts
        const applicationCounts = parseApplicationCount(sandbox.application_count);

        // Split applications into separate rows
        return applicationsArray.map(application => ({
          id: `${sandbox.id}-${application}`, // Unique ID for each row
          sandboxname: sandbox.sandboxname || `pr-${sandbox.id}`,
          application,
          source_branch: sandbox.sourcebranch,
          Start_Time: formatDateTime(startTime),
          Finish_Time: finishTime ? formatDateTime(finishTime) : '',
          Total_Time: finishTime ? `${hours}hr ${minutes}min` : '',
          vmsCount: applicationCounts[application.toLowerCase()] || 0, // Get VM count for each application
          status: sandbox.status || 'unknown',
          Result: sandbox.result || ' ',
        }));
      });
 
      setSandboxData(mappedData);
      setFilteredData(mappedData);
    } catch (error) {
      setError("Failed to fetch data: " + error.message);
    } finally {
      setLoading(false);
    }
  };
 
  // Helper function to parse application counts
  const parseApplicationCount = (applicationCountString) => {
    if (!applicationCountString) return {};
    return applicationCountString.split(', ').reduce((acc, entry) => {
      const [key, value] = entry.split(': ');
      acc[key.trim().toLowerCase()] = parseInt(value.trim(), 10); // Store counts in lowercase for consistency
      return acc;
    }, {});
  };


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
 
  useEffect(() => {
    fetchSandboxData();
  }, []);
 
  useEffect(() => {
    filterData(); // Call filterData whenever searchTerm or date range changes
  }, [searchTerm, startDate, endDate]);
 
  if (error) {
    return <div>Error: {error}</div>;
  }
 
  if (loading) {
    return <div>Loading...</div>;
  }
 
  const columns = [
    { field: "sandboxname", headerName: "Sandbox Name", flex: 1 },
    { field: "application", headerName: "Application", flex: 1 },
    { field: "source_branch", headerName: "Branch Triggered", flex: 1 },
    { field: "Start_Time", headerName: "Start Time", flex: 1 },
    { field: "Finish_Time", headerName: "Finish Time", flex: 1 },
    { field: "Total_Time", headerName: "Execution Time", flex: 1 },
    { field: "vmsCount", headerName: "VM Count", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    { field: "Result", headerName: "Result", flex: 1 },
  ];
 
  const exportToCSV = (data, filename) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
 
  const handleExportFilteredData = () => {
    exportToCSV(filteredData, 'sandbox_data.csv');
  };
 
 
   return (
     <>
       <Box sx={{ display: 'flex', mb: 2 }}>
         <TextField
           variant="outlined"
           placeholder="Search..."
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           sx={{ width: '50%', mr: 2 }}
         />
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
         <Button
           variant="contained"
           startIcon={<DownloadIcon />}
           onClick={handleExportFilteredData}
         >
           Export All Sandboxes
         </Button>
       </Box>
 
       <Box sx={{ height: '400px', width: '100%' }}>
         <DataGrid
           autoHeight
           paginationModel={paginationModel}
           onPaginationModelChange={setPaginationModel}
           rows={filteredData}
           columns={columns}
         />
       </Box>
     </>
   );
};
 
export default SandboxSummary;