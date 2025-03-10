import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { useNavigate } from 'react-router-dom';
import './DD.css'; // Ensure this file contains your styles
import { DAILY_BUILDS_GRAPH_ENDPOINT, DAILY_BUILDS_SUMMARY_ENDPOINT } from './api-url';
import { BsFillFileEarmarkBarGraphFill, BsTable } from "react-icons/bs";

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip, Legend);

function MyComponent() {
  const navigate = useNavigate();
  const [isGraphical, setIsGraphical] = useState(false);
  const [dailyData, setDailyData] = useState({});
  const [summaryData, setSummaryData] = useState([]);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [weeklyData, setWeeklyData] = useState({});
  const [loadingWeekly, setLoadingWeekly] = useState(true);

  // Fetch daily builds data
  useEffect(() => {
    const fetchDailyData = async () => {
      try {
        const response = await axios.get(DAILY_BUILDS_GRAPH_ENDPOINT);
        setDailyData(response.data);
      } catch (error) {
        console.error("Error fetching daily builds data:", error);
      } finally {
        setLoadingDaily(false);
      }
    };

    fetchDailyData();
  }, []);

  // Fetch summary data
  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const response = await axios.get(DAILY_BUILDS_SUMMARY_ENDPOINT);
        const transformedData = [
          { name: "Unknown Builds", value: response.data["Unknown Builds"] },
          { name: "IE-ENG", value: response.data["ENG"] },
          { name: "IE-QA", value: response.data.QA },
          { name: "IE-DEV", value: response.data.DEV },
        ];
        setSummaryData(transformedData);
      } catch (error) {
        console.error("Error fetching summary data:", error);
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchSummaryData();
  }, []);

  // Fetch weekly deployments data
  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        const response = await axios.get('https://ie-dashboard-backend.realpage.com/weekly_deployments');
        setWeeklyData(response.data);
      } catch (error) {
        console.error("Error fetching weekly deployments:", error);
      } finally {
        setLoadingWeekly(false);
      }
    };

    fetchWeeklyData();
  }, []);

  // Prepare table data
  const tableData = Object.keys(dailyData).map(date => ({
    date,
    QA: dailyData[date].QA || 0,
    ENG: dailyData[date].ENG || 0,
    DEV: dailyData[date].DEV || 0,
    UnknownBuilds: dailyData[date]['Unknown Builds'] || 0,
    serverCount: dailyData[date].serverCount || 0,
  }));

  // Handle pagination
  const paginatedTableData = tableData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Toggle between graphical and tabular views
  const handleButtonClick = () => {
    setIsGraphical(!isGraphical);
  };

  // Navigate to detailed view on date click
  const handleDateClick = (date) => {
    navigate({
      pathname: '/daily-builds',
      search: `?search=${date.date}`,
    });
  };

  return (
    <>
      <div className="header-container">
        <h1>Daily Deployments</h1>
        <button className="change-view-button" onClick={handleButtonClick}>
          {isGraphical ? (
            <>
              <BsTable /> Tabular View
            </>
          ) : (
            <>
              <BsFillFileEarmarkBarGraphFill /> Graphical View
            </>
          )}
        </button>
      </div>

      {/* Daily Deployments Section */}
      {isGraphical ? (
        <GraphicalFormat data={tableData} />
      ) : (
        <table style={{ fontSize: '0.85rem' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>IE-QA</th>
              <th>IE-ENG</th>
              <th>IE-DEV</th>
              <th>Unknown Builds</th>
              <th>Server Count</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTableData.map((date, index) => (
              <tr key={index} onClick={() => handleDateClick(date)}>
                <td>{date.date}</td>
                <td>{date.QA}</td>
                <td>{date.ENG}</td>
                <td>{date.DEV}</td>
                <td>{date.UnknownBuilds}</td>
                <td>{date.serverCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination Controls */}
      <div className="pagination-controls">
        {Array.from({ length: Math.ceil(tableData.length / rowsPerPage) }, (_, index) => (
          <button key={index} onClick={() => setCurrentPage(index + 1)}>
            {index + 1}
          </button>
        ))}
      </div>

      {/* Build Status Summary Section */}
      <BuildStatusSummary
        data={summaryData}
        loading={loadingSummary}
        weeklyDeployments={weeklyData}
        loadingWeekly={loadingWeekly}
      />
    </>
  );
}

function GraphicalFormat({ data }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
      <BarChart width={950} height={400} data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => new Intl.NumberFormat('en').format(value)} />
        <Bar dataKey="IE-QA" fill="#073857" />
        <Bar dataKey="IE-ENG" fill="#4E91DD" />
        <Bar dataKey="IE-DEV" fill="#7D9099" />
        <Bar dataKey="UnknownBuilds" fill="#A13764" />
      </BarChart>
    </div>
  );
}

const BuildStatusSummary = ({ data, loading, weeklyDeployments, loadingWeekly }) => {
  // Prepare weekly data for rendering
  const formattedWeeklyData = Object.entries(weeklyDeployments).map(([week, count]) => ({ week, count }));

  // Prepare doughnut chart data
  const chartData = {
    labels: data.map((entry) => entry.name),
    datasets: [
      {
        data: data.map((entry) => entry.value),
        backgroundColor: [
          "#3E76A4", // DEV
          "#B68ABA", // QA
          "#54B8C1", // ENG
          "#655B90", // Unknown
        ],
        hoverBackgroundColor: [
          "#3E76A4",
          "#B68ABA",
          "#54B8C1",
          "#655B90",
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ fontSize: "1.5rem" }}>Builds Status Summary</h2>
      {loading || loadingWeekly ? (
        <p>Loading...</p>
      ) : (
        <div className="summary-container">
          {/* Doughnut Chart */}
          <div className="summary-item">
            <Doughnut
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "right" },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        let label = context.label || "";
                        if (context.parsed > 0) {
                          label += `:${context.parsed}`;
                        }
                        return label;
                      },
                    },
                  },
                },
              }}
              width={200}
              height={200}
            />
          </div>

          {/* Builds Summary Table */}
          <div className="summary-item">
            <SummaryTable title="Builds Summary" data={data} />
          </div>

          {/* Weekly Deployments Table */}
          <div className="summary-item">
            <SummaryTable title="Weekly Deployments" data={formattedWeeklyData} />
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Summary Table Component
const SummaryTable = ({ title, data }) => (
  <div>
    <h3 style={{ textAlign: 'center' }}>{title}</h3>
    <table className="center" style={{ borderCollapse: "collapse", width: "100%", marginTop: "10px", fontSize: "0.85rem" }}>
      <thead>
        <tr style={{ backgroundColor: "#656565" }}>
          <th style={{ padding: "5px", textAlign: "center" }}>Status</th>
          <th style={{ padding: "5px", textAlign: "center" }}>Count</th>
        </tr>
      </thead>
      <tbody>
        {data.map((entry, index) => (
          <tr key={index} style={{ backgroundColor: "#F9F9F9" }}>
            <td style={{ padding: "5px", textAlign: "center" }}>{entry.name || entry.week}</td>
            <td style={{ padding: "5px", textAlign: "center" }}>{entry.value || entry.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// CSS styles (can be moved to DD.css)
const styles = `
.summary-container {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 20px;
}

.summary-item {
  flex: 1;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  padding: 10px;
  background-color: #fff;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
`;

// Exporting the main component
export default MyComponent;