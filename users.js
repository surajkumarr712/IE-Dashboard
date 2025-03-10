import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
 
const Users = () => {
    const [userData, setUserData] = useState([]); // State for user data
    const [userDeployments, setUserDeployments] = useState([]); // State for user deployments
    const [selectedUser, setSelectedUser] = useState(null); // State for selected user
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const [userPage, setUserPage] = useState(0); // Current page for users
    const [buildPage, setBuildPage] = useState(0); // Current page for builds
 
    const itemsPerPageUsers = 5; // Number of items per page for users
    const itemsPerPageBuilds = 10; // Number of items per page for builds
 
    // Fetch user data on component mount
    useEffect(() => {
        fetchUserData();
    }, []);
 
    const fetchUserData = async () => {
        try {
            const response = await axios.get('https://ie-dashboard-backend.realpage.com/count');
            const usersMappedData = response.data.map((userdata, index) => ({
                id: index,
                name: userdata.name,
                count: userdata.count,
            }));
            setUserData(usersMappedData);
        } catch (error) {
            console.error("Failed to fetch user data:", error);
            setError("Failed to load user data.");
        } finally {
            setLoading(false);
        }
    };
 
    // Mapping usernames to API routes
    const userRouteMapping = {
        "Kameswararao Thota": "kamesh",
        "Gopi Damerla": "gopi",
        "Srinivas Pagidimarry": "srinivas",
        "Kacham Soumya": "soumya",
        "pradeepkumar Badugu": "pradeep",
        "svc-dvo-ie_sandboxUI": "svc",
        "Patrick Collins": "patrick",
        "Daniel Vela": "daniel",
        "Krishna Balumuri": "krishna",
        "Stephen Barnes": "stephen",
        "Suresh Yellamelli": "suresh",
        "NarendraKumar Bodempudi":"narendra",
        "Sairam Prasad Adipudi":"sairam",
        "Alan Ream":"alan",
       "Project Collection Build Service (Realpage)":"",
        "TFS Service Account":"",
        "Matthew Hamous":"matthew",
        // Add more mappings as needed...
    };
 
    // Handling user row click to fetch deployments
    const handleUserRowClick = async (username) => {
        const apiRoute = userRouteMapping[username];
       
        if (apiRoute) {
            try {
                const response = await axios.get(`https://ie-dashboard-backend.realpage.com/${apiRoute}`);
                const filteredDeployments = response.data.map(deployment => ({
                    id: deployment.id || '',
                    sandbox_name: deployment.sandboxname || '',
                    result: deployment.result || 'unknown',
                }));
                setUserDeployments(filteredDeployments);
                setSelectedUser(username);
                setBuildPage(0); // Reset build page when a new user is selected
            } catch (error) {
                console.error("Failed to fetch user deployments:", error);
                setError("Failed to load deployments for this user.");
            }
        } else {
            console.error("No API route found for user:", username);
            setError("No API route found for this user.");
        }
    };
 
    // Calculate the current users and builds based on the current page
    const paginatedUsers = userData.slice(userPage * itemsPerPageUsers, (userPage + 1) * itemsPerPageUsers);
    const paginatedBuilds = userDeployments.slice(buildPage * itemsPerPageBuilds, (buildPage + 1) * itemsPerPageBuilds);
 
    // Count successful, failed, partially succeeded, and canceled builds
    const countBuildResults = () => {
        if (!userDeployments.length) return { succeeded: 0, failed: 0, partiallySucceeded: 0, canceled: 0 };
       
        let succeededCount = 0;
        let failedCount = 0;
        let partiallySucceededCount = 0;
        let canceledCount = 0;
 
        userDeployments.forEach(deployment => {
            switch (deployment.result) {
                case 'succeeded':
                    succeededCount++;
                    break;
                case 'failed':
                    failedCount++;
                    break;
                case 'partiallySucceeded':
                    partiallySucceededCount++;
                    break;
                case 'canceled':
                    canceledCount++;
                    break;
                default:
                    break;
            }
        });
 
        return { succeeded: succeededCount, failed: failedCount, partiallySucceeded: partiallySucceededCount, canceled: canceledCount };
    };
 
    const { succeeded, failed, partiallySucceeded, canceled } = countBuildResults();
 
    return (
        <Box sx={{ width: '100%', padding: 2 }}>
            <Typography variant="h4" gutterBottom>
                Users
            </Typography>
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <Box sx={{ display: 'flex', height: '450px', width: '100%' }}>
                    {/* User List Table */}
                    <Card sx={{ width: '50%', marginRight: 2 }}>
                        <Box p={2}>
                            <Typography variant="h6">User List</Typography>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>Action</th>
                                        <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>User Name</th>
                                        <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>Build Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>
                                                <Button variant="outlined" onClick={() => handleUserRowClick(user.name)}>
                                                    {'>>>'}
                                                </Button>
                                            </td>
                                            <td style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>{user.name}</td>
                                            <td style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>{user.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
 
                            {/* Pagination for Users */}
                            <Box display="flex" justifyContent="space-between" marginTop={2}>
                                <Button
                                    disabled={userPage === 0}
                                    onClick={() => setUserPage(userPage - 1)}
                                >
                                    Previous
                                </Button>
                                <Button
                                    disabled={(userPage + 1) * itemsPerPageUsers >= userData.length}
                                    onClick={() => setUserPage(userPage + 1)}
                                >
                                    Next
                                </Button>
                            </Box>
                        </Box>
                    </Card>
 
                    {/* Builds Table */}
                    {selectedUser && (
                        <Card sx={{ width: '50%', height: '600px' }}> {/* Increased height here */}
                            <Box p={2}>
                                <Typography variant="h6">Builds by {selectedUser}</Typography>
                                {/* Set a fixed height and allow scrolling */}
                                <div style={{ height: '700px', overflowY: 'auto' }}> {/* Adjusted height */}
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>ID</th>
                                                <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>Sandbox Name</th>
                                                <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>Result</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedBuilds.map((deployment) => (
                                                <tr key={deployment.id}>
                                                    <td style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>{deployment.id}</td>
                                                    <td style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>{deployment.sandbox_name}</td>
                                                    <td style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>{deployment.result}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
 
                                    {/* Pagination for Builds */}
                                    {userDeployments.length > 0 && (
                                        <>
                                            <Box display="flex" justifyContent="space-between" marginTop={2}>
                                                <Button
                                                    disabled={buildPage === 0}
                                                    onClick={() => setBuildPage(buildPage - 1)}
                                                >
                                                    Previous
                                                </Button>
                                                <Button
                                                    disabled={(buildPage + 1) * itemsPerPageBuilds >= userDeployments.length}
                                                    onClick={() => setBuildPage(buildPage + 1)}
                                                >
                                                    Next
                                                </Button>
                                            </Box>
 
                                            {/* Display Success and Failure Counts */}
                                            <Box display="flex" flexDirection="column" marginTop={2}>
                                                {/* First Line */}
                                                <Box display="flex" justifyContent="space-between">
                                                    <Typography variant="body2">
                                                        Successful Builds: {succeeded} | Failed Builds: {failed}
                                                    </Typography>
                                                </Box>
 
                                                {/* Second Line */}
                                                <Box display="flex" justifyContent="space-between">
                                                    <Typography variant="body2">
                                                        Partially Succeeded Builds: {partiallySucceeded} | Canceled Builds: {canceled}
                                                    </Typography>
                                                </Box>
                                            </Box>
 
                                        </>
                                    )}
                                </div> {/* End of scrollable div */}
                            </Box>
                        </Card>
                    )}
                </Box>
            )}
        </Box>
    );
};
 
export default Users;
 
 