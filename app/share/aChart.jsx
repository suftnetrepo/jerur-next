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
    });
  }

  records.forEach((item) => {
    const recordDate = new Date(item.checkInTime)
      .toISOString()
      .split("T")[0];

    const existingDay = last7Days.find(d => d.key === recordDate);

    if (existingDay) {
      existingDay.total += item.count;
    }
  });

  return {
    labels: last7Days.map(d => d.label),
    values: last7Days.map(d => d.total),
  };
};

export default function AttendanceChart({ data = [], loading = false }) {
  const [chartType, setChartType] = useState("bar");

  const { labels, values } = transformData(data || []);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Attendance",
        data: values,
        backgroundColor: "rgba(13,110,253,0.6)",
        borderColor: "#0d6efd",
        borderWidth: 2,
        borderRadius: 6,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#e9ecef" } },
      x: { grid: { display: false } },
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
        ) : data?.length === 0 ? (
          <div className="text-center text-muted mt-5">
            No attendance data available
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