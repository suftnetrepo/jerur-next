'use client';

import React from 'react';
import { useChurchDashboard } from '../../../../hooks/useChurchDashboard';
import SetupDashboard from './setup';
import LiveDashboard from './live';

const DEFAULT_ONBOARDING = {
	completed: false
};

const DashboardPage = () => {
	const dashboard = useChurchDashboard();
	const onboarding = dashboard.data?.onboarding || DEFAULT_ONBOARDING;

	if (!onboarding.completed && dashboard.loading && !dashboard.data) {
		return <SetupDashboard dashboard={dashboard} />;
	}

	return onboarding.completed ? <LiveDashboard /> : <SetupDashboard dashboard={dashboard} />;
};

export default DashboardPage;
