'use client';

import React from 'react';
import { Card } from 'react-bootstrap';
// import { getAggregate } from '../../../../utils/helpers';
import { useChurchDashboard } from '../../../../hooks/useChurchDashboard';
import { TotalInvested, NumberofInvested, Portfoliovalue, Returnsrate, UserAggregates } from '../../../share/chart';
import RecentMembers from '../recentMembers';
import AttendanceAnalysis from '../chart/attendance_analysis';

const Dashboard = () => {
  const { recentData, memberCount, chartData, trentData } = useChurchDashboard();

  console.log("....................memberCount", memberCount.data)
  return (
    <>
      <div className="row p-1">
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
                    <span className="fs-16 fw-semibold">{memberCount?.data}</span>
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
                    {/* <span className="fs-16 fw-semibold">{getAggregate(data?.statuses, 'Completed')}</span> */}
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
                    <span className="d-block">Upcoming Events</span>
                    <span className="fs-16 fw-semibold">
                      {/* {getAggregate(data?.statuses, 'Progress')} */}
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
                    <span className="d-block">Pending</span>
                    <span className="fs-16 fw-semibold">
                      {/* {getAggregate(data?.statuses, 'Pending')} */}
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
      <div className="row ms-1 me-1 mt-4 ">
        <div className="col-sm-6 col-md-7 card me-2 d-flex justify-content-start">
          <Card.Header className="ps-4">Service Attendance  </Card.Header>
          <div className="card-body"> {trentData && <AttendanceAnalysis data={trentData} />}</div>
        </div>
        <div className="col-sm-6 col-md-4 card d-flex h-auto justify-content-center align-items-center ">
          {chartData?.length && <UserAggregates data={chartData} />}
        </div>
      </div>

      <div className="row ms-1 me-1 card mt-4">
        <Card.Header className="ps-4">Recent Members</Card.Header>
        <div className="card-body">
          <RecentMembers data={recentData} />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
