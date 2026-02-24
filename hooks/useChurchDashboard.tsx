import React, { useState, useEffect } from 'react';
import { zat } from '../utils/api';
import { VERBS } from '../config';
import { CHURCH_DASHBOARD } from '../utils/apiUrl';

interface Initialize {
  recentData: [] | null | {};
  aggregateData: null | any;
  chartData: null | any;
  trentData: null | any;
  memberCount: number;
  loading: boolean;
  error: null | string;
  data ?: any;
}

const useChurchDashboard = () => {
  const [state, setState] = useState<Initialize>({
    recentData: [],
    aggregateData: null,
    chartData: null,
    trentData: null,
    memberCount: 0,
    loading: false,
    error: null,

  });

  const handleError = (error: string) => {
    setState((pre) => {
      return { ...pre, error: error, loading: false };
    });
  };

  const fetchDataHandler = async (url: string, field: keyof Initialize) => {
    const { data, success, errorMessage } = await zat(url, null, VERBS.GET);
    if (success) {
      setState((prev) => ({ ...prev, [field]: data }));
      return { success: true, data };
    }
    setState((prev) => ({ ...prev, error: errorMessage }));
    return { success: false, error: errorMessage };
  };

  const handleDashboardAggregates = async () => {
    setState((pre) => {
      return { ...pre, loading: true };
    });

    const { data, success, errorMessage } = await zat(CHURCH_DASHBOARD.aggregates, null, VERBS.GET);

    if (success) {
      setState((pre) => {
        return { ...pre, data: data, loading: false };
      });
      return { success, data: data };
    } else {
      handleError(errorMessage);
    }
  };

  const handleDashboardStatistics = async () => {
    setState((pre) => {
      return { ...pre, loading: true };
    });

    const { data, success, errorMessage } = await zat(CHURCH_DASHBOARD.statistics, null, VERBS.GET);

    if (success) {
      setState((pre) => {
        return { ...pre, data: data, loading: false };
      });
      return { success, data: data };
    } else {
      handleError(errorMessage);
    }
  };

  const handleRecent = async () => fetchDataHandler(CHURCH_DASHBOARD.recent, 'recentData');

  const handleAggregate = async () => fetchDataHandler(CHURCH_DASHBOARD.aggregate, 'aggregateData');

  const handleChartAggregate = async () => fetchDataHandler(CHURCH_DASHBOARD.chart, 'chartData');

  const handleMemberCount = async () => fetchDataHandler(CHURCH_DASHBOARD.memberCount, 'memberCount');

  const handleAttendanceTrent = async () => fetchDataHandler(CHURCH_DASHBOARD.trent, 'trentData');

  const fetchAll = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const results = await Promise.all([
        handleRecent(),
        handleAggregate(),
        handleChartAggregate(),
        handleMemberCount(),
        handleAttendanceTrent()
      ]);

      const hasError = results.some((result) => !result.success);
      if (hasError) {
        const oneError = results.find((result) => !result.success)?.error;
        handleError(oneError.message || 'An error occurred');
      }
    } catch (error) {
      handleError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return { ...state, handleDashboardAggregates, handleDashboardStatistics, handleRecent, handleAggregate, handleChartAggregate, handleMemberCount, handleAttendanceTrent };
};

export { useChurchDashboard };
