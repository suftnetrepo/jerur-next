'use client';

import React from 'react';
import { Card, Placeholder } from 'react-bootstrap';
import { useChurchDashboard } from '../../../../hooks/useChurchDashboard';
import SetupDashboard from './setup';
import LiveDashboard from './live';

const DEFAULT_ONBOARDING = {
	completed: false
};

const DashboardLoadingState = () => (
	<div aria-label="Loading dashboard" aria-busy="true">
		<div className="row g-3">
			{Array.from({ length: 4 }).map((_, index) => (
				<div className="col-sm-6 col-lg-3" key={index}>
					<Card className="border-0 h-100" style={{ minHeight: 132, borderRadius: 16 }}>
						<Card.Body className="p-4">
							<Placeholder animation="glow">
								<Placeholder xs={5} className="mb-3" />
								<Placeholder xs={3} size="lg" />
							</Placeholder>
						</Card.Body>
					</Card>
				</div>
			))}
		</div>
		<div className="row g-3 mt-1">
			<div className="col-lg-7">
				<Card className="border-0" style={{ minHeight: 430, borderRadius: 16 }}>
					<Card.Body className="p-4"><Placeholder animation="glow"><Placeholder xs={4} /></Placeholder></Card.Body>
				</Card>
			</div>
			<div className="col-lg-5">
				<Card className="border-0" style={{ minHeight: 430, borderRadius: 16 }}>
					<Card.Body className="p-4"><Placeholder animation="glow"><Placeholder xs={5} /></Placeholder></Card.Body>
				</Card>
			</div>
		</div>
	</div>
);

const DashboardPage = () => {
	const dashboard = useChurchDashboard();
	const onboarding = dashboard.data?.onboarding || DEFAULT_ONBOARDING;

	if (!dashboard.data) {
		return <DashboardLoadingState />;
	}

	return onboarding.completed ? <LiveDashboard dashboard={dashboard} /> : <SetupDashboard dashboard={dashboard} />;
};

export default DashboardPage;
