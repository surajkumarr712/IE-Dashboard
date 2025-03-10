import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { Pie, Doughnut } from "react-chartjs-2";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend} from "chart.js";
 
import { SUMMARY_ENDPOINT, DAILY_BUILDS_SUMMARY_ENDPOINT, DAILY_BUILDS_GRAPH_ENDPOINT, WEEKLY_DEPLOYMENTS_ENDPOINT,} from "./api-url";

 
Chart.register(CategoryScale);
Chart.register(LinearScale);
Chart.register(PointElement);
Chart.register(LineElement);
Chart.register(Title);
Chart.register(Tooltip);
Chart.register(Legend);
 
 
 
const Overview = ({ activeSandboxesCount }) => {
  const navigate = useNavigate();
  const [totalBuilds, setTotalBuilds] = useState(0);
  const [Succeeded, setSucceeded] = useState(0);
  const [failed, setFailed] = useState(0);
  const [Inprogress, setInProgress] = useState(0);
  const [partiallySucceeded, setPartiallySucceeded] = useState(0);
  const [cancelled, setCancelled] = useState(0);
  const [qaBuilds, setQaBuilds] = useState(0);
  const [devBuilds, setDevBuilds] = useState(0);
  const [engBuilds, setEngBuilds] = useState(0);
  const [noneBuilds, setNoneBuilds] = useState(0);
  const [, setServerCount] = useState(0);
  const [dailyDeployments, setDailyDeployments] = useState([]);
  const [weeklyDeploymentsData, setWeeklyDeploymentsData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const summaryResponse = await axios.get(SUMMARY_ENDPOINT);
      setTotalBuilds(summaryResponse.data["Total Builds"]);
      setSucceeded(summaryResponse.data.Succeeded);
      setFailed(summaryResponse.data.Failed);
      setPartiallySucceeded(summaryResponse.data["Partially Succeeded"]);
      setCancelled(summaryResponse.data.Cancelled);
      setInProgress(summaryResponse.data["In Progress"]);
 
      const dailyResponse = await axios.get(DAILY_BUILDS_SUMMARY_ENDPOINT);
      setQaBuilds(dailyResponse.data.QA);
      setDevBuilds(dailyResponse.data.DEV);
      setEngBuilds(dailyResponse.data.ENG);
      setNoneBuilds(dailyResponse.data["Unknown Builds"]);
      setServerCount(dailyResponse.data.serverCount);
 
      const deploymentsResponse = await axios.get(DAILY_BUILDS_GRAPH_ENDPOINT);
      const dailyDeploymentsData = deploymentsResponse.data;
      const dailyDeploymentsArray = Object.keys(dailyDeploymentsData).map(
        (date) => ({
          date,
          ...dailyDeploymentsData[date],
        })
      );
      setDailyDeployments(dailyDeploymentsArray);
 
      const weeklyDeploymentsResponse = await axios.get(
        WEEKLY_DEPLOYMENTS_ENDPOINT
      );
      const weeklyDeploymentsData = weeklyDeploymentsResponse.data;
      const weeklyDeploymentsArray = Object.keys(weeklyDeploymentsData).map(
        (week) => ({
          week,
          count: weeklyDeploymentsData[week],
        })
      );
      setWeeklyDeploymentsData(weeklyDeploymentsArray);
    };
    fetchData();
  }, []);
 
  const handleDoughnutClick = (event) => {
    const activeElements = event.chart.getActiveElements();
  
    if (activeElements.length > 0) {
      const index = activeElements[0].index;
      const label = event.chart.data.labels[index];
  
      if (label) {
        // Navigate based on the specific label
        switch (label) {
          case "Succeeded":
            navigate(`/daily-builds?search=result:Succeeded`);
            break;
          case "Partially Succeeded":
            navigate(`/daily-builds?search=partiallySucceeded`);
            break;
          case "Cancelled":
            navigate(`/daily-builds?search=canceled`);
            break;
          default:
            navigate(`/daily-builds?search=${encodeURIComponent(label)}`);
            break;
        }
      }
    }
  };

  const buildStatusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Build Status",
        color:"black",
        font :{
          size:17,
        }
      },
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 10,
          color:"black"
        },
      },
    },
    onClick: handleDoughnutClick,
  };
 
  const chartOptions = {
    chart: {
      type: "spline",
      animation: true,
      events: {
        load(){
          this.reflow();
        }
      }
    },
    credits: {
      enabled: false, // Disable Highcharts branding
    },
    title: {
      text: "Daily Deployments",
      align: "center",
    },
    xAxis: {
      categories: dailyDeployments.map((deployment) => deployment.date),
      title: {
        text: "Date",
      },
    },
    yAxis: {
      title: {
        text: "Deployment Count",
      },
    },
    series: [
      {
        name: "IE-QA Builds",
        data: dailyDeployments.map((deployment) => deployment.QA || 0),
        color: "#073857",
      },
      {
        name: "IE-DEV Builds",
        data: dailyDeployments.map((deployment) => deployment.DEV || 0),
        color: "#7D9099",
      },
      {
        name: "IE-ENG Builds",
        data: dailyDeployments.map((deployment) => deployment.ENG || 0),
        color: "#4E91DD",
      },
      {
        name: "Unknown Builds",
        data: dailyDeployments.map(
          (deployment) => deployment["Unknown Builds"] || 0
        ),
        color: "#A13764",
      },
    ],
    plotOptions: {
      series: {
        marker: {
          enabled: false,
        },
      },
    },
  };
 
  const serverchartOptions = {
    chart: {
      type: "column",
      animation: true,
    },
    credits: {
      enabled: false, // Disable Highcharts branding
    },
    title: {
      text: "VM Count",
      align: "center",
    },
    xAxis: {
      categories: dailyDeployments.map((deployment) => deployment.date),
      title: {
        text: "Date",
      },
    },
    yAxis: {
      title: {
        text: "Deployment Count",
      },
    },
    series: [
      {
        name: "VM Count",
        data: dailyDeployments.map((deployment) => deployment.serverCount || 0),
        color: "#A13764",
      },
    ],
    plotOptions: {
      series: {
        marker: {
          enabled: false,
        },
      },
    },
  };
 
  const weeklyDeploymentsChartOptions = {
    chart: {
      type: "area",
      animation: true,
    },
    credits: {
      enabled: false, // Disable Highcharts branding
    },
    title: {
      text: "Weekly Deployments",
      align: "center",
    },
    xAxis: {
      categories: weeklyDeploymentsData.map((deployment) => deployment.week),
      title: {
        text: "Week",
      },
    },
    yAxis: {
      title: {
        text: "Deployment Count",
      },
    },
    series: [
      {
        name: "Weekly Deployments",
        data: weeklyDeploymentsData.map((deployment) => deployment.count || 0),
        color: "#4E91DD",
      },
    ],
    plotOptions: {
      area: {
        stacking: "normal",
        lineColor: "#4E91DD",
        lineWidth: 3,
        marker: {
          lineWidth: 1,
          lineColor: "#4E91DD",
        },
      },
    },
  };

 
  return (
    <div>
      <h1
        style={{
          margin: 0,
          padding: 15,
          marginTop: -45,
          paddingTop: 0,
          color: "black",
        }}
      >
        Overview
      </h1>
      <div
        className="tile-container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          marginTop: "10px",
        }}
      >
        <div
          className="tile"
          style={{
            backgroundColor: "#2F63A0",
            width: "23%",
            textAlign: "center",
            margin: "5px",
            borderRadius: "10px",
            border: "1px solid #2F63A0",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <h3 style={{ fontSize: 18, color: "white" }}>Provisioning Builds</h3>
          <p style={{ fontSize: 18, color: "white" }}>
            <b>{totalBuilds}</b>
          </p>
        </div>
        <div
          className="tile"
          style={{
            backgroundColor: "#2F63A0 ",
            width: "23%",
            textAlign: "center",
            margin: "5px",
            borderRadius: "10px",
            border: "1px solid #2F63A0",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <h3 style={{ fontSize: 18, color: "white" }}>Provisioning Failure</h3>
          <p style={{ fontSize: 18, color: "white" }}>
            <b>{failed}</b>
          </p>
        </div>
        <div
          className="tile"
          style={{
            backgroundColor: "#2F63A0",
            width: "23%",
            textAlign: "center ",
            margin: "5px",
            borderRadius: "10px",
            border: "1px solid #2F63A0",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <h3 style={{ fontSize: 18, color: "white" }}>Provisioning Success</h3>
          <p style={{ fontSize: 18, color: "white" }}>
            <b>{Succeeded}</b>
          </p>
        </div>
        <div
          className="tile"
          style={{
            backgroundColor: "#2F63A0",
            width: "23%",
            textAlign: "center ",
            margin: "5px",
            borderRadius: "10px",
            border: "1px solid #2F63A0",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <h3 style={{ fontSize: 18, color: "white" }}>Total Active Sandboxes</h3>
          <p style={{ fontSize: 18, color: "white" }}>
            <b>{activeSandboxesCount}</b>
          </p>
        </div>
      </div>
 
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "10px",
        }}
      >
        <div classname="chart" style={{ height: "auto", width: "30%", margin: "10px" }}>
        <Pie
            data={{
            labels: [
                      "IE-QA Builds",
                      "IE-DEV Builds",
                      "IE-ENG Builds",
                      "UNKNOWN Builds",
                    ],
              datasets: [
                {
                  data: [qaBuilds, devBuilds, engBuilds, noneBuilds],
                  backgroundColor: ["#073857", "#4E91DD", "#A13764", "#7D9099"],
                  hoverBackgroundColor: [
                    "#073857",
                    "#4E91DD",
                    "#A13764",
                    "#7D9099",
                  ],
                },
              ],
            }}
  options={{
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Builds Categorized by Team",
        color: "black",
        font: {
          size:17,
        }
      },
      legend: {
        position: "bottom",
        labels: {
          padding: 10,
          color:"black"
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const label = tooltipItem.label || '';
            const value = tooltipItem.raw || 0;
            return `${label}: ${value}`;
          },
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const sectorIndex = elements[0].index;
        const sectorLabel = [
          "qa-",
          "iedev-",
          "eng",
          "test",
        ][sectorIndex];
        navigate(`/daily-builds?search=${sectorLabel}`);
      }
    },
  }}
  width={500}
  height={300}
/>
        </div>
 
        <div className="chart" style={{ width: "24%" }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={weeklyDeploymentsChartOptions}
          />
        </div>
 
        <div className="chart" style={{ width: "25%", margin: "10px" }}>
        <Doughnut
            data={{
              labels: [
                "Succeeded",
                "Failed",
                "Cancelled",
                "In Progress",
                "Partially Succeeded",
              ],
              datasets: [
                {
                  data: [
                    Succeeded,
                    failed,
                    cancelled,
                    Inprogress,
                    partiallySucceeded,
                  ],
                  backgroundColor: [
                    "#073857",
                    "#4E91DD",
                    "#A13764",
                    "#7D9099",
                    "#EA6A47",
                  ],
                  hoverBackgroundColor: [
                    "#073857",
                    "#4E91DD",
                    "#A13764",
                    "#7D9099",
                    "#EA6A47",
                  ],
                },
              ],
            }}
            options={buildStatusChartOptions}
            width={500}
            height={300}
          />
        </div>
      </div>
 
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        <div style={{ width: "52%" }}>
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
 
        <div style={{ width: "48%" }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={serverchartOptions}
          />
        </div>
      </div>
    </div>
  );
};
 
export default Overview;
 