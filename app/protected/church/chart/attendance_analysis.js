// 'use client';

// import React, { useState, useEffect } from 'react';
// import dynamic from 'next/dynamic';
// import { Container, Row, Col, Card } from 'react-bootstrap';

// const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// const DAY_COLORS = {
//   Sunday: '#4C51BF',
//   Monday: '#4299E1',
//   Tuesday: '#48BB78',
//   Wednesday: '#ED8936',
//   Thursday: '#9F7AEA',
//   Friday: '#F56565',
//   Saturday: '#ECC94B'
// };

// const getDayOfWeek = (dateString) => {
//   const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//   const date = new Date(dateString);
//   return days[date.getDay()];
// };

// const AttendanceAnalysis = ({ data }) => {
//   const [chartLoaded, setChartLoaded] = useState(false);
//   const [chartData, setChartData] = useState({
//     options: {
//       chart: {
//         id: 'attendance-bar-chart',
//         toolbar: {
//           show: false
//         },
//         background: '#fff'
//       },
//       xaxis: {
//         categories: []
//       },
//       colors: [], 

//       plotOptions: {
//         bar: {
//           borderRadius: 4,
//           horizontal: false,
//           distributed: true, 
//           dataLabels: {
//             position: 'top'
//           }
//         }
//       },
//       dataLabels: {
//         enabled: true,
//         offsetY: -20,
//         style: {
//           fontSize: '12px',
//           colors: ['#304758']
//         }
//       },
//       legend: {
//         show: false,
//         position: 'bottom',
//         markers: {
//           fillColors: Object.values(DAY_COLORS)
//         },
//         labels: {
//           colors: Object.values(DAY_COLORS),
//           useSeriesColors: false
//         }
//       }
//     },
//     series: [
//       {
//         name: 'Attendance',
//         data: []
//       }
//     ]
//   });

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       setChartLoaded(true);
//     }

//     const attendanceData = [...data];

//     const categories = attendanceData.map((item) => {
//       const date = new Date(item.checkInTime);
//       return `${item.service.title} (${date.toLocaleDateString()})`;
//     });

//     const counts = attendanceData.map((item) => item.count);

//     const colors = attendanceData.map((item) => {
//       const day = getDayOfWeek(item.checkInTime);
//       return DAY_COLORS[day];
//     });

//     const newChartData = {
//       options: {
//         chart: {
//           id: 'attendance-bar-chart',
//           toolbar: { show: false },
//           background: '#fff'
//         },
//         xaxis: { categories },
//         colors,
//         title: {
//           text: '',
//           align: 'center',
//           style: {
//             fontSize: '18px',
//             fontWeight: 'bold'
//           }
//         },
//         plotOptions: {
//           bar: {
//             borderRadius: 4,
//             horizontal: false,
//             distributed: true,
//             dataLabels: { position: 'top' }
//           }
//         },
//         dataLabels: {
//           enabled: true,
//           offsetY: -20,
//           style: {
//             fontSize: '12px',
//             colors: ['#304758']
//           }
//         },
//         legend: { show: false },
//         tooltip: {
//           custom: function ({ series, seriesIndex, dataPointIndex }) {
//             const day = getDayOfWeek(attendanceData[dataPointIndex].checkInTime);
//             return `
//               <div class="apexcharts-tooltip">
//                 <div><strong>${categories[dataPointIndex]}</strong></div>
//                 <div>${day}</div>
//                 <div>Attendance: ${series[seriesIndex][dataPointIndex]}</div>
//               </div>
//             `;
//           }
//         }
//       },
//       series: [
//         {
//           name: 'Attendance',
//           data: counts
//         }
//       ]
//     };

//     setChartData(newChartData);
//   }, [data]);

//   return (
//     <Container>
//       <Row>
//         <Col>
//           {chartLoaded && <Chart options={chartData.options} series={chartData.series} type="bar" height={350} />}
//           <div className='pb-4' style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
//             {Object.entries(DAY_COLORS).map(([day, color]) => (
//               <div key={day} style={{ display: 'flex', alignItems: 'center' }}>
//                 <div
//                   style={{
//                     width: 14,
//                     height: 14,
//                     backgroundColor: color,
//                     borderRadius: 2,
//                     marginRight: 6
//                   }}
//                 ></div>
//                 <span style={{ fontSize: 14 }}>{day}</span>
//               </div>
//             ))}
//           </div>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default AttendanceAnalysis;
