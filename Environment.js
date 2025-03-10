import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Button,
} from "@mui/material";
import { ENV_ENDPOINT, RESOURCES_ENDPOINT } from "./api-url";
 
const EnvironmentList = () => {
  const [rowData, setRowData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [resourceData, setResourceData] = useState(null);
  const [showResourceDetails, setShowResourceDetails] = useState(false);
  const [resourceMessage, setResourceMessage] = useState("");
 
  useEffect(() => {
    const fetchEnvironments = async () => {
      try {
        const response = await fetch(ENV_ENDPOINT);
        const data = await response.json();
        setRowData(data);
        setTotalPages(Math.ceil(data.length / 10));
      } catch (error) {
        console.error("Error fetching environments:", error);
      }
    };
 
    fetchEnvironments();
  }, []);
 
  const handleMouseEnter = async (event, id) => {
    try {
      const response = await fetch(`${RESOURCES_ENDPOINT}/${id}`);
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setResourceData(data[0]);
        setResourceMessage(`Resources available for ID: ${id}`);
      } else {
        setResourceData(null);
        setResourceMessage(`No resources available for ID: ${id}`);
      }
      setShowResourceDetails(true);
    } catch (error) {
      console.error("Error fetching resources:", error);
      setResourceData(null);
      setResourceMessage(`Error fetching resources for ID: ${id}`);
    }
  };
 
  const firstRowIndex = currentPage * 10;
  const currentRows = rowData.slice(firstRowIndex, firstRowIndex + 10);
 
  return (
    <div style={{ width: "100%" }}>
      <h1 style={{ marginBottom: "20px" }}>Environments</h1>
 
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Environment ID</TableCell>
              <TableCell>Sandbox Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentRows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>
                  <Tooltip title={resourceMessage} arrow>
                    <span
                      style={{ cursor: "pointer" }}
                      onMouseEnter={(event) => handleMouseEnter(event, row.id)}
                      onMouseLeave={() => setShowResourceDetails(false)}
                    >
                      {row.name}
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell>{row.lastModifiedOn.split("T")[0]}</TableCell>
                {/* Updated Time Formatting */}
                <TableCell>{row.lastModifiedOn.split("T")[1].split(".")[0]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
 
      {/* Tooltip for resource details */}
      {showResourceDetails && resourceData && (
        <div style={{
          position: "absolute",
          backgroundColor: "white",
          padding: "10px",
          border: "1px solid #ddd",
          borderRadius: "5px",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
          zIndex: 1,
        }}>
          <h3>{resourceMessage}</h3>
          <div><strong>Resource ID:</strong> {resourceData.id}</div>
          <div><strong>Name:</strong> {resourceData.name}</div>
          <div><strong>Tags:</strong> {resourceData.tags.join(", ")}</div>
          <Button
            onClick={() => setShowResourceDetails(false)}
            style={{ marginTop: "10px" }}
            variant="contained"
            color="#2F63A0"
          >
            Close
          </Button>
        </div>
      )}
 
      {/* Pagination Controls */}
      <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
        >
          Previous
        </Button>
        <span>Page {currentPage + 1} of {totalPages}</span>
        <Button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
          }
          disabled={currentPage === totalPages - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
 
export default EnvironmentList;
 
 