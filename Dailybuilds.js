import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { DAILY_BUILDS_ENDPOINT } from "./api-url";
import './App.css';
import { FcClearFilters, FcRefresh } from "react-icons/fc"; // Import reset icon
import DatePicker from 'react-datepicker'; // Import DatePicker
import 'react-datepicker/dist/react-datepicker.css'; // Import DatePicker styles
import { AiOutlineCalendar } from "react-icons/ai"; // Import calendar icon
 
const DailyBuilds = () => {
    const [builds, setBuilds] = useState([]);
    const [searchId, setSearchId] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilterOptions, setShowFilterOptions] = useState(false);
    const [filterType, setFilterType] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 14;
    const [userInputPage, setUserInputPage] = useState(currentPage + 1); // User input for page number
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null); // State for selected date
    const location = useLocation();
    const filterRef = useRef(null); // Ref for the filter options dropdown
 
    useEffect(() => {
        const query = new URLSearchParams(location.search).get("search");
        if (query) {
            setSearchId(query);
        }
        fetchBuilds();
    }, [location.search]);
 
    const fetchBuilds = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(DAILY_BUILDS_ENDPOINT);
            setBuilds(response.data);
        } catch (error) {
            console.error("Error fetching builds:", error.message);
            setError("Failed to fetch data. Please check the API endpoint.");
        } finally {
            setLoading(false);
        }
    };
 
 
    const exportFilteredBuildsAsCSV = () => {
        // Determine which builds to export based on selected date
        const filteredByDate = selectedDate
            ? builds.filter((build) => {
                const buildDate = build.startTime.split("T")[0]; // Extract date from timestamp
                return buildDate === selectedDate; // Match with selected date
            })
            : builds; // If no date is selected, use all builds
     
        // Prepare CSV data
        const csvRows = [];
        const headers = ['ID', 'Status', 'Result', 'Deployed By', 'Sandbox Name', 'VM Count', 'Date', 'Start Time'];
        csvRows.push(headers.join(',')); // Add headers
     
        filteredByDate.forEach(build => {
            const row = [
                build.id,
                build.status,
                build.result,
                build.displayName,
                build.sandboxname,
                // build.applications,
                build.serverCount,
                build.startTime.split("T")[0], // Date
                formatTimestamp(build.startTime), // start TimeStamp
                // formatTimestamp(build.finishTime) //end timestamp
            ];
            csvRows.push(row.join(',')); // Add each row
        });
     
        // Determine file name based on selected date
        const fileName = selectedDate ? `${selectedDate}_builddetails.csv` : 'builddetails.csv';
     
        // Create a Blob from the CSV string and trigger download
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', fileName); // Use dynamic file name
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    // Filtering logic
    const filteredBuilds = builds.filter((build) => {
        const buildDate = build.startTime.split("T")[0]; // Extract date from timestamp
        const searchLower = searchId.toLowerCase();
       
        // If no search ID and no date selected, show all builds
        if (!searchId && !selectedDate) return true;
       
        return (
            (searchId && (
                build.id.toString().includes(searchId) ||
                (build.status && build.status.toLowerCase().includes(searchLower)) ||
                (build.displayName && build.displayName.toLowerCase().includes(searchLower)) ||
                (build.sandboxname && build.sandboxname.toLowerCase().includes(searchLower)) ||
                // (build.applications && build.applications.toLowerCase().includes(searchLower)) ||
                (build.result && build.result.toString().toLowerCase().includes(searchLower))
            )) ||
            (selectedDate && buildDate === selectedDate) // Date filtering
        );
      });
 
 
    const applyFilter = () => {
        if (!filterType) return filteredBuilds;
        if (filterType === 'unknown') {
            return filteredBuilds.filter(build =>
                !build.sandboxname?.toLowerCase().includes('iedev-') &&
                !build.sandboxname?.toLowerCase().includes('qa-') &&
                !build.sandboxname?.toLowerCase().includes('eng-')
            );
        }
        return filteredBuilds.filter(build =>
            build.sandboxname?.toLowerCase().includes(filterType)
        );
    };
 
    const totalPages = Math.ceil(applyFilter().length / itemsPerPage);
    const currentItems = applyFilter().slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
 
    // Filter options
    const filterOptions = [
        { value: 'iedev-', label: 'IE-Dev Builds' },
        { value: 'qa-', label: 'IE-QA Builds' },
        { value: 'eng-', label: 'IE-Eng Builds' },
        { value: 'unknown', label: 'Unknown Builds' },
    ];
 
    // Handle user input for page change
    const handleUserInputChange = (e) => {
        const value = e.target.value;
        if (!isNaN(value) && value > 0 && value <= totalPages) {
            setUserInputPage(value);
            setCurrentPage(value - 1); // Convert to zero-based index
        }
      };
 
    // Update current page based on user input
    useEffect(() => {
        setUserInputPage(currentPage + 1); // Sync user input with current page (1-based index)
    }, [currentPage]);
 
    // Function to format timestamp
    const formatTimestamp = (startTime) => {
        if (!startTime) return "";
        return startTime.split("T")[1].split(".")[0];
    };
 
    // Function to reset filters
    const resetFilters = () => {
        setSearchId("");
        setFilterType("");
        setCurrentPage(0); // Reset to the first page
        setUserInputPage(1); // Reset user input for page number
        fetchBuilds(); // Optionally refetch data if needed
        setSelectedDate(null); // Reset selected date
    };
 
    // Close filter options when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setShowFilterOptions(false);
            }
        };
 
        document.addEventListener("mousedown", handleClickOutside);
       
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
 
 
  return (
    <div>
    <h1 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  Daily Builds
  <div style={{ display: 'flex', alignItems: 'center' }}>
      <AiOutlineCalendar
          style={{ marginLeft: '10px', cursor: 'pointer' }}
          onClick={() => setShowCalendar(!showCalendar)}
      />
      <button
          onClick={exportFilteredBuildsAsCSV} // Ensure this function is defined
          style={{ marginLeft: '10px', padding: '5px 10px', cursor: 'pointer' }}
      >
          Export as CSV
      </button>
  </div>
</h1>
      {/* Calendar Popup */}
      {showCalendar && (
              <div style={{ position: 'absolute', zIndex: 1000, top: 'calc(10% - 15px)', left: 'calc(78% + 50px)' }}>
                  <DatePicker
  selected={selectedDate}
  onChange={(date) => {
      setSelectedDate(date ? date.toISOString().split('T')[0] : null); // Update selected date
      setShowCalendar(false); // Optionally close calendar on date selection
  }}
  dateFormat="yyyy/MM/dd"
  placeholderText="Select a date"
/>
              </div>
          )}
 
<div className="search-filter-container" ref={filterRef} style={{ width: "100%", maxHeight: "40vh", marginTop: "30px" }}>
 
              <input
                  id="search-input"
                  type="text"
                  placeholder="Search"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="search-input"
              />
              {/* <FcClearFilters
                  size="2em"
                  className="filter-icon"
                  onClick={() => setShowFilterOptions(!showFilterOptions)}
              /> */}
              {/* Reset Filters Button */}
              <FcRefresh
                  size="2em"
                  className="reset-icon"
                  onClick={resetFilters}
                  style={{ marginLeft: '10px', cursor: 'pointer' }}
              />
              {showFilterOptions && (
                  <div className="filter-options-dropdown">
                      {filterOptions.map(option => (
                          <div
                              key={option.value}
                              className="filter-option"
                              onClick={() => {
                                  setFilterType(option.value);
                                  setShowFilterOptions(false);
                              }}
                          >
                              {option.label}
                          </div>
                      ))}
                  </div>
              )}
          </div>
 
          {loading && <div className="spinner">Loading...</div>}
          {error && <p style={{ color: "red" }}>{error}</p>}
 
          <div className="ag-theme-alpine" style={{ width: "100%", maxHeight: "80vh", overflow: "auto", marginTop: "20px" }}>
              <AgGridReact
                  rowData={currentItems}
                  columnDefs={[
                      { headerName: "ID", field: "id" },
                      { headerName: "Status", field: "status" },
                      { headerName: "Result", field: "result" },
                      { headerName: "Deployed By", field: "displayName" },
                      { headerName: "Sandbox Name", field: "sandboxname" },
                    //   { headerName: "Applications", field: "applications" },
                    //   { headerName: "VM Count", field: "serverCount" },
                      { headerName: "Date", field: "startTime", cellRenderer: (params) => params.value.split("T")[0], },
                      { headerName: "Start Time", field: "startTime", cellRenderer: (params) => formatTimestamp(params.value), },
                    //   { headerName: "Finish Time", field: "finishTime", cellRenderer: (params) => formatTimestamp(params.value), },
                  ]}
                  pagination={false}
                  domLayout="autoHeight"
                  suppressRowClickSelection={true}
                  headerHeight={40}
              />
          </div>
 
          <div className="pagination-controls">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))} disabled={currentPage === 0}>
                  Previous
              </button>
 
              {/* Container for page display */}
              <div className="page-display">
                  {/* Current page in a square box */}
                  <div className="page-box">
                      <input
                          type="number"
                          min="1"
                          max={totalPages}
                          value={userInputPage}
                          onChange={handleUserInputChange}
                          style={{ width: '40px', textAlign: 'center', borderRadius: '4px', borderColor: '#ccc', borderWidth: '0', outline:'none' }}
                      />
                  </div>
                 
                  {/* Display total pages beside the square box */}
                  <span>{` of ${totalPages}`}</span>
              </div>
 
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))} disabled={currentPage === totalPages - 1}>
                  Next
              </button>
          </div>
         
          {/* CSS Styles */}
          <style>{`
              .pagination-controls {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 20px;
              }
 
              .page-display {
                display: flex;
                align-items: center;
                margin-left: auto; /* Centering */
                margin-right: auto; /* Centering */
              }
 
              .page-box {
                display: flex;
                justify-content: center;
                align-items: center;
                width: fit-content;
                height: fit-content;
                border-bottom: solid #ccc; /* Only bottom border */
                padding-left: 5px;
                padding-right: 5px;
              }
 
              .page-box input {
                 border-width: thin;
                 outline:none;
                 text-align:center;
                 width:auto; /* Adjust width as necessary */
                 height:auto; /* Adjust height as necessary */
                 background-color:white; /* Ensures background is white */
                 border:none; /* Removes default border */
                 font-size:.9em; /* Adjust font size */
               }
               
               .pagination-controls button {
                 padding: 5px;
               }
           `}</style>
         
      </div>
  );
};
 
export default DailyBuilds;
 