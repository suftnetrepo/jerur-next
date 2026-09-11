import { useState } from "react";
import { Card, Button, ButtonGroup, Row, Col, Spinner } from "react-bootstrap";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

const transformData = (records) => {
  const today = new Date();
  const last7Days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);

    const key = date.toISOString().split("T")[0];

    last7Days.push({
      key,
      label: date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      }),
      total: 0,
      male: 0,
      female: 0,
    });
  }

  const safeRecords = Array.isArray(records) ? records : [];

  safeRecords.forEach((item) => {
    const recordDate = new Date(item.checkInTime)
      .toISOString()
      .split("T")[0];

    const existingDay = last7Days.find(d => d.key === recordDate);

    if (existingDay) {
      existingDay.total += Number(item.count || 0);
      existingDay.male += Number(item.male || 0);
      existingDay.female += Number(item.female || 0);
    }
  });

  return {
    labels: last7Days.map(d => d.label),
    totals: last7Days.map(d => d.total),
    male: last7Days.map(d => d.male),
    female: last7Days.map(d => d.female),
  };
};

export default function AttendanceChart({ data = [], loading = false }) {
  const [chartType, setChartType] = useState("bar");

  const { labels, totals, male, female } = transformData(data || []);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Male",
        data: male,
        backgroundColor: "rgba(13, 148, 136, 0.75)",
        borderColor: "#0d9488",
        borderWidth: 2,
        borderRadius: 6,
        tension: 0.4,
      },
      {
        label: "Female",
        data: female,
        backgroundColor: "rgba(14, 165, 233, 0.65)",
        borderColor: "#0ea5e9",
        borderWidth: 2,
        borderRadius: 6,
        tension: 0.4,
      },
      {
        type: "line",
        label: "Total attendance",
        data: totals,
        yAxisID: "total",
        borderColor: "#172554",
        backgroundColor: "#172554",
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.35,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: "bottom" } },
    scales: {
      y: { beginAtZero: true, stacked: true, grid: { color: "#e9ecef" } },
      total: { beginAtZero: true, position: "right", display: false },
      x: { stacked: true, grid: { display: false } },
    },
  };

  return (
    <Card className="shadow-sm border-0 h-100">
      <Card.Header className="bg-white border-0">
        <Row className="align-items-center">
          <Col>
            <h5 className="mb-0 fw-semibold">
              {chartType === "bar" ? "Attendance" : "Line"} 
            </h5>
            <small className="text-muted">
              Attendance count per service over the last 7 days
            </small>
          </Col>

          <Col xs="auto">
            <ButtonGroup size="sm">
              <Button
                variant={chartType === "bar" ? "primary" : "outline-primary"}
                onClick={() => setChartType("bar")}
              >
                Bar
              </Button>
              <Button
                variant={chartType === "line" ? "primary" : "outline-primary"}
                onClick={() => setChartType("line")}
              >
                Line
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      </Card.Header>

      <Card.Body style={{ height: 350 }}>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <Spinner animation="border" />
          </div>
        ) : chartType === "bar" ? (
          <Bar data={chartData} options={options} />
        ) : (
          <Line data={chartData} options={options} />
        )}
      </Card.Body>
    </Card>
  );
}
