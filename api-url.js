/* global ENV_ENDPOINT */
export const API_URL = "https://ie-dashboard-backend.realpage.com"; // Base URL for primary APIs
// export const API_URLS = "http://10.35.32.35:8000"; // Base URL for secondary APIs

// Define various endpoints using the base URLs
export const SUMMARY_ENDPOINT = `${API_URL}/summary`;
export const DAILY_BUILDS_SUMMARY_ENDPOINT = `${API_URL}/daily_builds_summary`;
export const DAILY_BUILDS_GRAPH_ENDPOINT = `${API_URL}/dailyBuildsGraph`;
export const WEEKLY_DEPLOYMENTS_ENDPOINT = `${API_URL}/weekly_deployments`;
export const DAILY_BUILDS_ENDPOINT = `${API_URL}/daily_builds`;
export const ENV_ENDPOINT = `${API_URL}/environments`;
export const RESOURCES_ENDPOINT = `${API_URL}/resources`;

// Grouped API endpoints for specific functionalities
const API_ENDPOINTS = {
    INT1: `${API_URL}/datastores/rp1-npvcf-int1`, // Endpoint for specific datastore
    VMS: `${API_URL}/vm`, // Endpoint for VMs
    ORACLE1: `${API_URL}/datastores/rp1-npvcf-oracle1`, // Endpoint for Oracle datastore
    UTILIZATION: `${API_URL}/utilization`, // Endpoint for utilization data
};

// Export the grouped API endpoints
export default API_ENDPOINTS;