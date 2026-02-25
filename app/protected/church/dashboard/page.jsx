'use client';

import React, { useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { getDashboardAggregateValue } from '../../../../utils/helpers';
import { useChurchDashboard } from '../../../../hooks/useChurchDashboard';
import { TotalInvested, NumberofInvested, Portfoliovalue, Returnsrate, UserAggregates } from '../../../share/chart';
import RecentMembers from '../recentMembers';
import AttendanceAnalysis from '../chart/attendance_analysis';

const Dashboard = () => {
  const { recentData, chartData, trentData, data, handleDashboardAggregates } = useChurchDashboard();

  useEffect(() => {
    handleDashboardAggregates();
  }, []);

  console.log('Aggregate Data:', trentData, chartData);

  return (
    <>
      <div className="row">
        <div className="col-sm-6 col-lg-3">
          <Card className=" py-3 px-3">
            <Card.Body>
              <div className="d-flex gap-3 flex-wrap align-items-top justify-content-between">
                <div className="flex-fill d-flex align-items-top mb-4 mb-sm-0">
                  <div className="me-3">
                    <span className="avatar avatar-rounded bg-info">
                      <i className="bi bi-boxes text-white fs-16"></i>
                    </span>
                  </div>
                  <div>
                    <span className="d-block">Members</span>
                    <span className="fs-16 fw-semibold">{getDashboardAggregateValue(data, 'members')}</span>
                  </div>
                </div>
                <div>
                  <div id="total-investments">
                    <TotalInvested />
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-sm-6 col-lg-3">
          <Card className=" py-3 px-3">
            <Card.Body>
              <div className="d-flex gap-3 flex-wrap align-items-top justify-content-between">
                <div className="flex-fill d-flex align-items-top mb-4 mb-sm-0">
                  <div className="me-3">
                    <span className="avatar avatar-rounded bg-secondary">
                      <i className="bi bi-check-circle text-white fs-16"></i>
                    </span>
                  </div>
                  <div>
                    <span className="d-block">Upcoming Events</span>
                    <span className="fs-16 fw-semibold">{getDashboardAggregateValue(data, 'events')}</span>
                  </div>
                </div>
                <div>
                  <div id="total-investments">
                    <NumberofInvested />
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-sm-6 col-lg-3">
          <Card className=" py-3 px-3">
            <Card.Body>
              <div className="d-flex gap-3 flex-wrap align-items-top justify-content-between">
                <div className="flex-fill d-flex align-items-top mb-4 mb-sm-0">
                  <div className="me-3">
                    <span className="avatar avatar-rounded bg-warning">
                      <i className="bi bi-bootstrap-reboot fs-16"></i>
                    </span>
                  </div>
                  <div>
                    <span className="d-block">Fellowships</span>
                    <span className="fs-16 fw-semibold">
                      {getDashboardAggregateValue(data, 'fellowships')}
                      <i className="ti ti-arrow-narrow-up ms-1 text-success"></i>
                    </span>
                  </div>
                </div>
                <div>
                  <div id="portfolio-value">
                    <Portfoliovalue />
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-sm-6 col-lg-3">
          <Card className=" py-3 px-3">
            <Card.Body>
              <div className="d-flex gap-3 flex-wrap align-items-top justify-content-between">
                <div className="flex-fill d-flex align-items-top mb-4 mb-sm-0">
                  <div className="me-3">
                    <span className="avatar avatar-rounded bg-success">
                      <i className="bi bi-stopwatch text-white fs-19"></i>
                    </span>
                  </div>
                  <div>
                    <span className="d-block">Services</span>
                    <span className="fs-16 fw-semibold">
                      {getDashboardAggregateValue(data, 'serviceTimes')}
                      <i className="ti ti-arrow-narrow-up ms-1 text-success"></i>
                    </span>
                  </div>
                </div>
                <div>
                  <div id="returns-rate">
                    <Returnsrate />
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Charts Section */}
      <div className="row mt-4">
        <div className="col-lg-7 mb-4">
          <Card>
            <Card.Header className="ps-4">
              Service Attendance
            </Card.Header>
            <Card.Body>
              {Array.isArray(trentData) && (
                <AttendanceAnalysis data={trentData} />
              )}
            </Card.Body>
          </Card>
        </div>

        <div className="col-lg-5 mb-4">
          <Card className="h-100">
            <Card.Body className="d-flex justify-content-center align-items-center">
              {Array.isArray(chartData) && (
                <UserAggregates data={chartData} />
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <Card>
            <Card.Header className="ps-4">
              Recent Members
            </Card.Header>
            <Card.Body>
              <RecentMembers data={recentData} />
            </Card.Body>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
