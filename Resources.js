import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { RESOURCES_ENDPOINT } from "./api-url";

const Resources = () => {
  const { id } = useParams();
  const [resourceData, setResourceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResource = async () => {
      setLoading(true);
      try {
        const response = await fetch(RESOURCES_ENDPOINT + "/" + id);
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setResourceData(data[0]);
        } else {
          setResourceData(null);
        }
      } catch (error) {
        console.error("Error fetching resources:", error);
        setResourceData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!resourceData) {
    return <div>No resource found for ID: {id}</div>;
  }

  // Set up column definitions for AG Grid
  const columnDefs = [
    { headerName: "Resource ID", field: "id" },
    { headerName: "Name", field: "name" },
    {
      headerName: "Tags",
      field: "tags",
      cellRenderer: (params) => params.value.join(", "),
    },
  ];

  // Prepare row data for AG Grid
  const rowData = [resourceData];

  return (
    <div>
      <h1>Resource Details</h1>
      <div
        className="ag-theme-alpine"
        style={{ height: "400px", width: "40%", marginTop: "20px" }}
      >
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData}
          domLayout="autoHeight"
          suppressRowClickSelection={true}
          pagination={false}
        />
      </div>
    </div>
  );
};

export default Resources;
