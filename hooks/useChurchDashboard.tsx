import React, { useCallback, useEffect, useState } from 'react';
import { zat } from '../utils/api';
import { VERBS } from '../config';
import { CHURCH_DASHBOARD } from '../utils/apiUrl';

interface Initialize {
  recentData: [] | null | {};
  aggregateData: null | any;
  chartData: null | any;
  trentData: null | any;
  statisticsData: null | any;
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
    statisticsData: null,
    memberCount: 0,
    loading: false,
    error: null,

  });

  const handleError = useCallback((error: string) => {
    setState((pre) => {
      return { ...pre, error: error, loading: false };
    });
  }, []);

  const fetchDataHandler = useCallback(async (url: string, field: keyof Initialize) => {
    const { data, success, errorMessage } = await zat(url, null, VERBS.GET);
    if (success) {
      setState((prev) => ({ ...prev, [field]: data }));
      return { success: true, data };
    }
    setState((prev) => ({ ...prev, error: errorMessage }));
    return { success: false, error: errorMessage };
  }, []);

  const handleDashboardAggregates = useCallback(async () => {
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
      return handleError(errorMessage);
    }
  }, [handleError]);

  const handleDashboardStatistics = useCallback(async () => {
    setState((pre) => {
      return { ...pre, loading: true };
    });

    const { data, success, errorMessage } = await zat(CHURCH_DASHBOARD.statistics, null, VERBS.GET);

    if (success) {
      setState((pre) => {
        return { ...pre, statisticsData: data, loading: false };
      });
      return { success, data: data };
    } else {
      return handleError(errorMessage);
    }
  }, [handleError]);

  const handleRecent = useCallback(async () => fetchDataHandler(CHURCH_DASHBOARD.recent, 'recentData'), [fetchDataHandler]);

  const handleAggregate = useCallback(async () => fetchDataHandler(CHURCH_DASHBOARD.aggregate, 'aggregateData'), [fetchDataHandler]);

  const handleChartAggregate = useCallback(async () => fetchDataHandler(CHURCH_DASHBOARD.chart, 'chartData'), [fetchDataHandler]);

  const handleMemberCount = useCallback(async () => fetchDataHandler(CHURCH_DASHBOARD.memberCount, 'memberCount'), [fetchDataHandler]);

  const handleAttendanceTrent = useCallback(async () => fetchDataHandler(CHURCH_DASHBOARD.trend, 'trentData'), [fetchDataHandler]);

  const fetchAll = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const results = await Promise.all([
        handleDashboardAggregates(),
        handleRecent(),
        handleChartAggregate(),
        handleAttendanceTrent(),
        handleDashboardStatistics()
      ]);

      const hasError = results.some((result) => !result.success);
      if (hasError) {
        const oneError = results.find((result) => !result.success)?.error;
        handleError(oneError?.message || oneError || 'An error occurred');
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      handleError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }, [handleAttendanceTrent, handleChartAggregate, handleDashboardAggregates, handleDashboardStatistics, handleError, handleRecent]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { ...state, fetchAll, handleDashboardAggregates, handleDashboardStatistics, handleRecent, handleAggregate, handleChartAggregate, handleMemberCount, handleAttendanceTrent };
};

export { useChurchDashboard };
