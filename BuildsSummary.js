import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import { useLocation } from "react-router-dom";
import { DataGrid } from '@mui/x-data-grid';
import { Tabs, Tab, Button, TextField } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { Link } from "react-router-dom";

const BuildsSummary = ({ setActiveSandboxesCount }) => {
    const [sandboxData, setSandboxData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [deprovData, setDeprovData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [startDate, setStartDate] = useState(getDateOneWeekAgo());
    const [endDate, setEndDate] = useState(new Date());
    const [activeSandboxesCount, setActiveSandboxesCountLocal] = useState(0);
    const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
    const location = useLocation();

    function getDateOneWeekAgo() {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date;
    }

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchQuery = params.get('search');
        if (searchQuery) setSearchTerm(searchQuery);
        fetchSandboxData();
    }, [location.search]);

    const fetchSandboxData = async () => {
        try {
            const provResponse = await axios.get("https://ie-dashboard-backend.realpage.com/daily_builds");
            const deprovResponse = await axios.get("https://ie-dashboard-backend.realpage.com/daily_builds_deprov");

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
                applications: sandbox.applications?.trim() || defaultApplications,
                source_branch: sandbox.sourcebranch,
                Start_Time: formatDateTime(sandbox.startTime),
                Finish_Time: formatDateTime(sandbox.finishTime),
                status: sandbox.status || 'unknown',
                Result: sandbox.result || ' ',
                Active_Inactive: deprovMap[`${sandbox.sandboxname}-${sandbox.applications}`] ? 'Inactive' : 'Active',
            }));

            setSandboxData(mappedData);
            setFilteredData(mappedData);
            setDeprovData(deprovResponse.data);
            calculateActiveSandboxesCount(mappedData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => filterData(), [searchTerm, startDate, endDate]);

    const filterData = () => {
        let filtered = sandboxData.filter(sandbox => 
            Object.values(sandbox).some(value =>
                typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );

        filtered = filtered.filter(sandbox => {
            const startTime = new Date(sandbox.Start_Time);
            return startTime >= startDate && startTime <= endDate;
        });

        setFilteredData(filtered);
        calculateActiveSandboxesCount(filtered);
    };

    const calculateActiveSandboxesCount = (data) => {
        const sandboxMap = new Map();

        data.forEach(sandbox => {
            const name = sandbox.sandboxname;
            if (!sandboxMap.has(name)) {
                sandboxMap.set(name, {
                    hasPr: name.includes('pr-'),
                    hasFailed: false,
                    isInactive: false
                });
            }

            const entry = sandboxMap.get(name);
            entry.hasFailed ||= sandbox.Result === 'failed';
            entry.isInactive ||= sandbox.Active_Inactive === 'Inactive';
        });

        let activeCount = 0;
        sandboxMap.forEach(value => {
            if (!value.hasPr && !value.hasFailed && !value.isInactive) {
                activeCount++;
            }
        });

        setActiveSandboxesCountLocal(activeCount);
        setActiveSandboxesCount(activeCount);
    };

    const formatDateTime = (dateString) => 
        dateString ? new Date(dateString).toISOString().slice(0, 19).replace('T', ' ') : '';

    const columns = [
        { field: "sandboxname", headerName: "Sandbox Name", flex: 1 },
        { field: "applications", headerName: "Application", flex: 1 },
        { field: "source_branch", headerName: "Branch Triggered", flex: 1 },
        { field: "Start_Time", headerName: "Start Time", flex: 1 },
        { field: "Finish_Time", headerName: "Finish Time", flex: 1 },
        { field: "status", headerName: "Status", flex: 1 },
        { field: "Result", headerName: "Result", flex: 1 },
        { 
            field: "Active_Inactive", 
            headerName: "Active/Inactive", 
            flex: 1,
            renderCell: (params) => (
                <Button onClick={() => handleInactiveClick(params.row)}>
                    {params.value}
                </Button>
            )
        },
    ];

    const deprovColumns = [
        { field: "sandboxname", headerName: "Sandbox Name", flex: 1 },
        { field: "applications", headerName: "Application", flex: 1 },
        { field: "result", headerName: "Result", flex: 1 }
    ];

    const handleInactiveClick = (row) => {
        if (row.Active_Inactive === 'Inactive') {
            setTabValue(1);
            setSearchTerm(row.sandboxname);
        }
    };

    const exportToCSV = () => {
        const csvContent = 'data:text/csv;charset=utf-8,' +
            filteredData.map(e => Object.values(e).join(",")).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `sandbox_data_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
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
                
                {tabValue === 0 && (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: '16px' }}>
                            <label>From:</label>
                            <TextField
                                type="date"
                                value={startDate.toISOString().split('T')[0]}
                                onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : getDateOneWeekAgo())}
                                sx={{ ml: '8px' }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: '16px' }}>
                            <label>To:</label>
                            <TextField
                                type="date"
                                value={endDate.toISOString().split('T')[0]}
                                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : new Date())}
                                sx={{ ml: '8px' }}
                            />
                        </Box>
                    </>
                )}
                
                <Button variant="contained" startIcon={<DownloadIcon />} onClick={exportToCSV}>
                    Export Data
                </Button>
                
                <Box sx={{ ml: '16px', p: '8px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f5f5f5' }}>
                    Active Sandboxes: {activeSandboxesCount}
                </Box>
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
                        rows={deprovData.filter(sandbox => (
                            sandbox.sandboxname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            sandbox.applications?.toLowerCase().includes(searchTerm.toLowerCase())
                        ))} 
                        columns={deprovColumns} 
                        loading={loading}
                    />
                </Box>
            )}
        </Box>
    );
};

export default BuildsSummary;