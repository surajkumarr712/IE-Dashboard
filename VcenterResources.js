import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './VcenterResources.css';
import API_ENDPOINTS from './api-url';
import '@fortawesome/fontawesome-free/css/all.min.css';
 
const PercentageBar = ({ capacity, freeSpace }) => {
    const used = parseFloat(capacity) - parseFloat(freeSpace);
    const percentage = capacity > 0 ? (used / capacity) * 100 : 0;
    let barColor;
 
    if (percentage > 75) {
        barColor = '#ff5733'; // Moderate Red for usage > 75%
    } else if (percentage >= 65) {
        barColor = '#ffcc00'; // Golden Yellow for usage between 65% and 75%
    } else {
        barColor = '#4caf50'; // Moderate Green for usage < 65%
    }
 
    return (
        <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '5px' }}>
            <div style={{ width: `${percentage}%`, backgroundColor: barColor, height: '100%', borderRadius: '5px', textAlign: 'center', lineHeight: '20px' }}>
                {percentage.toFixed(2)}%
            </div>
        </div>
    );
};
 
function VcenterResources() {
    const [datastores, setDatastores] = useState([]);
    const [oracleDatastores, setOracleDatastores] = useState([]);
    const [vms, setVms] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingOracle, setLoadingOracle] = useState(false);
    const [loadingVms, setLoadingVms] = useState(false);
    const [selectedDatastore, setSelectedDatastore] = useState('int1');
 
    // Notification states
    const [showNotifications, setShowNotifications] = useState(false);
    const [highUsageDatastores, setHighUsageDatastores] = useState([]);
 
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const vmsPerPage = 10; // Number of VMs per page
 
    const apiEndpointInt1 = API_ENDPOINTS.INT1;
    const apiEndpointOracle1 = API_ENDPOINTS.ORACLE1;
    const apiEndpointVms = "https://ie-dashboard-backend.realpage.com/vm";
 
    useEffect(() => {
        const fetchDatastores = async () => {
            try {
                const response = await axios.get(apiEndpointInt1);
                const datastoreData = response.data.map(datastore => ({
                    datastoreId: datastore.datastore,
                    name: datastore.name,
                    capacity: (datastore.capacity / 1_099_511_627_776).toFixed(2),
                    freeSpace: (datastore.free_space / 1_099_511_627_776).toFixed(2),
                    type: datastore.type,
                }));
                setDatastores(datastoreData);
 
                // Check for high usage datastores
                const highUsage = datastoreData.filter(ds => {
                    const usedSpace = parseFloat(ds.capacity) - parseFloat(ds.freeSpace);
                    return (usedSpace / parseFloat(ds.capacity)) * 100 > 75;
                });
                setHighUsageDatastores(highUsage);
            } catch (error) {
                console.error("Error fetching Int1 datastores:", error);
                setError("Failed to load Int1 datastores.");
            } finally {
                setLoading(false);
            }
        };
        fetchDatastores();
    }, [apiEndpointInt1]);
 
    const handleInt1Click = () => {
        setSelectedDatastore('int1');
        setLoading(false);
        setCurrentPage(1); // Reset to first page when changing datastore
    };
 
    const handleOracleClick = async () => {
        setSelectedDatastore('oracle');
        setLoadingOracle(false);
        try {
            const response = await axios.get(apiEndpointOracle1);
            const oracleData = response.data.map(datastore => ({
                datastoreId: datastore.datastore,
                name: datastore.name,
                capacity: (datastore.capacity / 1_099_511_627_776).toFixed(2),
                freeSpace: (datastore.free_space / 1_099_511_627_776).toFixed(2),
                type: datastore.type,
            }));
            setOracleDatastores(oracleData);
 
            // Check for high usage in Oracle datastores
            const highUsageOracle = oracleData.filter(ds => {
                const usedSpace = parseFloat(ds.capacity) - parseFloat(ds.freeSpace);
                return (usedSpace / parseFloat(ds.capacity)) * 100 > 75;
            });
            setHighUsageDatastores(prev => [...prev, ...highUsageOracle]);
        } catch (error) {
            console.error("Error fetching Oracle datastores:", error);
            setError("Failed to load Oracle datastores.");
        } finally {
            setLoadingOracle(false);
        }
    };
 
    const handleVmsClick = async () => {
        setSelectedDatastore('vms');
        setLoadingVms(false);
        try {
            const response = await axios.get(apiEndpointVms);
            const vmData = response.data.map(vm => ({
                vmId: vm.vm,
                name: vm.name,
                memorySizeMiB: vm.memory_size_MiB,
                cpuCount: vm.cpu_count,
                powerState: vm.power_state,
            }));
            setVms(vmData);
            setCurrentPage(1); // Reset to first page when changing to VMs
        } catch (error) {
            console.error("Error fetching Virtual Machines:", error);
            setError("Failed to load Virtual Machines.");
        } finally {
            setLoadingVms(false);
        }
    };
 
    // Function to send email alert
    const sendEmailAlert = (datastoreName) => {
        alert(`Email alert sent for ${datastoreName}`); // Replace with actual email sending logic
    };
 
    // Pagination logic
    const indexOfLastVm = currentPage * vmsPerPage;
    const indexOfFirstVm = indexOfLastVm - vmsPerPage;
    const currentVms = vms.slice(indexOfFirstVm, indexOfLastVm);
 
    // Change page
    const paginateNext = () => {
        if ((currentPage * vmsPerPage) < vms.length) { // Check if next page exists
            setCurrentPage(currentPage + 1);
        }
    };
 
    const paginatePrev = () => {
        if (currentPage > 1) { // Check if previous page exists
            setCurrentPage(currentPage - 1);
        }
    };
 
    if (loading) return <p>Loading data...</p>;
    if (error) return <p className="error-message">{error}</p>;
 
    return (
        <div className="vcenter-resources-container">
            <div className="cluster-row-container">
                <div className="cluster-row">
                    <span onClick={handleInt1Click}>rp1-npvcf-int1</span>
                    <span onClick={handleOracleClick}>rp1-npvcf-oracle1</span>
                    <span onClick={handleVmsClick}>Virtual Machines</span>
                    {/* <span>VCF-vCloud</span> */}
                </div>
            </div>
 
            {/* Notification Button */}
            <div className="notification-button-wrapper">
                <button className="notification-button" onClick={() => setShowNotifications(!showNotifications)}>
                    <i className="fas fa-bell"></i>
                    {highUsageDatastores.length > 0 && (
                        <span className="notification-dot"></span> // Orange dot for notifications
                    )}
                </button>
 
                {/* Notification Container */}
                {showNotifications && (
                    <div className="notification-container">
                        {highUsageDatastores.length > 0 ? (
                            highUsageDatastores.map(datastore => (
                                <div key={datastore.datastoreId} className="notification-item">
                                    <h4>Storage Limit Exceeded:</h4>
                                    <p>{datastore.name}: {((parseFloat(datastore.capacity) - parseFloat(datastore.freeSpace)) / parseFloat(datastore.capacity) * 100).toFixed(1)}%</p>
                                    <button onClick={() => sendEmailAlert(datastore.name)} className="send-email-alert">
                                        Send Email Alert <i className="fas fa-arrow-right"></i>
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p>No datastores are over 75% usage.</p>
                        )}
                    </div>
                )}
            </div>
 
            {/* Datastore Tables */}
            <h2>Datastores</h2>
           
            {selectedDatastore === 'int1' && (
                <table className="datastore-table">
                    <thead>
                        <tr>
                            <th>Datastore ID</th>
                            <th style={{ cursor: 'pointer' }}>Name &#x21C5;</th>
                            <th>Capacity (TB)</th>
                            <th>Free Space (TB)</th>
                            <th>Usage Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datastores.map((datastore) => (
                            <tr key={datastore.datastoreId}>
                                <td>{datastore.datastoreId}</td>
                                <td>{datastore.name}</td>
                                <td>{datastore.capacity}</td>
                                <td>{datastore.freeSpace}</td>
                                <td><PercentageBar capacity={datastore.capacity} freeSpace={datastore.freeSpace} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
           
            {selectedDatastore === 'oracle' && (
                <>
                    {loadingOracle ? (
                        <p>Loading Oracle data...</p>
                    ) : (
                        <table className="datastore-table">
                            <thead>
                                <tr>
                                    <th>Datastore ID</th>
                                    <th style={{ cursor: 'pointer' }}>Name &#x21C5;</th>
                                    <th>Capacity (TB)</th>
                                    <th>Free Space (TB)</th>
                                    <th>Usage Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {oracleDatastores.map((oracleDatastore) => (
                                    <tr key={oracleDatastore.datastoreId}>
                                        <td>{oracleDatastore.datastoreId}</td>
                                        <td>{oracleDatastore.name}</td>
                                        <td>{oracleDatastore.capacity}</td>
                                        <td>{oracleDatastore.freeSpace}</td>
                                        <td><PercentageBar capacity={oracleDatastore.capacity} freeSpace={oracleDatastore.freeSpace} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            )}
 
            {selectedDatastore === 'vms' && (
                <>
                    {loadingVms ? (
                        <p>Loading Virtual Machines data...</p>
                    ) : (
                        <>
                            {/* VM Table */}
                            <table className="vm-table">
                                <thead>
                                    <tr>
                                        <th>VM ID</th>
                                        <th>Name</th>
                                        <th>Memory Size (MiB)</th>
                                        <th>CPU Count</th>
                                        {/* Power State with Toggle */}
                                        <th>Power State</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentVms.map((vm) => (
                                        <tr key={vm.vmId}>
                                            <td>{vm.vmId}</td>
                                            <td>{vm.name}</td>
                                            {/* Convert MiB to GB */}
                                            <td>{(vm.memorySizeMiB / 1024).toFixed(2)} GB</td>
                                            <td>{vm.cpuCount}</td>
 
                                            {/* Toggle Button for Power State */}
                                            {/* Change color based on power state */}
                                            {/* Placeholder functionality for toggling power state */}
                                            {/* You can replace the alert with actual toggle functionality */}
                                            {vm.powerState === 'POWERED_ON' ? (
                                                <td><button style={{ backgroundColor: 'green', color: 'white', borderRadius: '5px', border: 'none', padding: '5px 10px' }} >On</button></td>
                                            ) : (
                                                <td><button style={{ backgroundColor: 'red', color: 'white', borderRadius: '5px', border: 'none', padding: '5px 10px' }} >Off</button></td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
 
                            {/* Pagination Controls */}
                            {/* Previous and Next buttons */}
                            {vms.length > vmsPerPage && (
                                <>
                                    {/* Page indicator */}
                                    <div className="pagination-info">
                                        Page {currentPage} of {Math.ceil(vms.length / vmsPerPage)}
                                    </div>
 
                                    {/* Previous and Next buttons */}
                                    {currentPage > 1 && (
                                        <button onClick={paginatePrev} className="page-button">Previous</button>
                                    )}
                                   
                                    {currentPage * vmsPerPage <= vms.length && (
                                        <button onClick={paginateNext} className="page-button">Next</button>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </>
            )}
        </div >
    );
}
 
export default VcenterResources;
 