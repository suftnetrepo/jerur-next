import React, { useState, useEffect } from 'react';
import { zat } from '../utils/api';
import { VERBS } from '../config';
import { CHURCH_DASHBOARD } from '../utils/apiUrl';

interface Initialize {
  recentData: [] | null | {};
  aggregateData: null | any;
  chartData: null | any;
  memberCount: number;
  loading: boolean;
  error: null | string;
}

const useChurchDashboard = () => {
  const [state, setState] = useState<Initialize>({
    recentData: [],
    aggregateData: null,
    chartData: null,
    memberCount: 0,
    loading: false,
    error: null
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

  const handleRecent = async () => fetchDataHandler(CHURCH_DASHBOARD.recent, 'recentData');

  const handleAggregate = async () => fetchDataHandler(CHURCH_DASHBOARD.aggregate, 'aggregateData');

  const handleChartAggregate = async () => fetchDataHandler(CHURCH_DASHBOARD.chart, 'chartData');

  const handleMemberCount = async () => fetchDataHandler(CHURCH_DASHBOARD.memberCount, 'memberCount');

  const fetchAll = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const results = await Promise.all([
        handleRecent(),
        handleAggregate(),
        handleChartAggregate(),
        handleMemberCount()
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

  return { ...state };
};

export { useChurchDashboard };
