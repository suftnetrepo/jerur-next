import React, { useState, useEffect, useCallback } from 'react';
import { zat } from '../utils/api';
import { VERBS } from '../config';
import { ATTENDANCE, REGULAR_SERVICE, CARE_FOLLOW_UP, USER } from '../utils/apiUrl';

const FILTER_STORAGE_KEY = 'attendanceDashboardFilters';

const getLastSundayDateString = () => {
  const currentDate = new Date();
  const result = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const day = result.getDay();

  result.setDate(result.getDate() - day);

  const year = result.getFullYear();
  const month = `${result.getMonth() + 1}`.padStart(2, '0');
  const date = `${result.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${date}`;
};

const getStoredFilters = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawFilters = window.localStorage.getItem(FILTER_STORAGE_KEY);
    return rawFilters ? JSON.parse(rawFilters) : null;
  } catch (error) {
    return null;
  }
};

const buildDateRange = (selectedDate) => {
  if (!selectedDate) {
    return {};
  }

  const [year, month, day] = selectedDate.split('-').map(Number);

  if (!year || !month || !day) {
    return {};
  }

  const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
  const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  };
};

const STATUS_FILTERS = [
  'PRESENT_IN_CHURCH',
  'JOINED_ONLINE',
  'ABSENT',
  'SICK',
  'TRAVELLING',
  'WORKING',
  'FAMILY_COMMITMENT',
  'NEEDS_PRAYER',
  'OTHER'
];

const useAttendance = (searchQuery = '') => {
  const storedFilters = getStoredFilters();
  const [state, setState] = useState({
    attendanceData: [],
    services: [],
    assignableUsers: [],
    loading: false,
    error: null,
    totalCount: 0,
    selectedService: storedFilters?.selectedService || null,
    selectedDate: storedFilters?.selectedDate || getLastSundayDateString(),
    selectedQueue: storedFilters?.selectedQueue || 'ALL',
    statistics: null,
    dashboard: null,
    tableQuery: {
      pageIndex: 1,
      pageSize: 10,
      sortBy: []
    }
  });

  const handleError = (error) => {
    setState((pre) => {
      return { ...pre, error: error, loading: false };
    });
  };

  const handleFetchServices = useCallback(async () => {
    try {
      const { data, success, errorMessage } = await zat(REGULAR_SERVICE.paginate, null, VERBS.GET, {
        action: 'paginate',
        page: 1,
        limit: 100
      });

      if (success !== false && Array.isArray(data)) {
        setState((prev) => ({
          ...prev,
          services: data || [],
          selectedService: data.some((service) => service._id === prev.selectedService)
            ? prev.selectedService
            : data?.[0]?._id || null
        }));
      } else {
        console.warn('Failed to fetch services:', errorMessage);
      }
    } catch (error) {
      console.warn('Error fetching services:', error);
    }
  }, []);

  const handleFetchAssignableUsers = useCallback(async () => {
    try {
      const { data, success } = await zat(USER.fetch, null, VERBS.GET, {
        action: 'getAll',
        page: 1,
        limit: 100
      });

      if (success) {
        setState((prev) => ({
          ...prev,
          assignableUsers: data || []
        }));
      }
    } catch (error) {
      console.warn('Error fetching assignable users:', error);
    }
  }, []);

  const handleFetchAttendance = useCallback(async ({ pageIndex = 0, pageSize = 10, sortBy = [] } = {}) => {
    if (!state.selectedService) {
      return false;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const dateRange = buildDateRange(state.selectedDate || getLastSundayDateString());
      const params = {
        serviceId: state.selectedService,
        page: pageIndex === 0 ? 1 : pageIndex,
        limit: pageSize,
        searchQuery,
        ...dateRange
      };

      if (state.selectedQueue !== 'ALL') {
        if (STATUS_FILTERS.includes(state.selectedQueue)) {
          params.status = state.selectedQueue;
        } else {
          params.queue = state.selectedQueue;
        }
      }

      if (sortBy.length > 0) {
        params.sortField = sortBy[0].id;
        params.sortOrder = sortBy[0].desc ? 'desc' : 'asc';
      }

      const { data, success, errorMessage, totalCount } = await zat(ATTENDANCE.fetchByService, null, VERBS.GET, params);

      if (success) {
        setState((prev) => ({
          ...prev,
          attendanceData: data || [],
          totalCount: totalCount || 0,
          tableQuery: {
            pageIndex: pageIndex === 0 ? 1 : pageIndex,
            pageSize,
            sortBy
          },
          loading: false
        }));
        return true;
      } else {
        handleError(errorMessage || 'Failed to fetch attendance');
        return false;
      }
    } catch (error) {
      handleError('An unexpected error occurred while fetching attendance.');
      return false;
    }
  }, [searchQuery, state.selectedDate, state.selectedService, state.selectedQueue]);

  const handleFetchStatistics = useCallback(async (serviceId, selectedDate = state.selectedDate) => {
    try {
      const dateRange = buildDateRange(selectedDate || getLastSundayDateString());
      const { data, success } = await zat(ATTENDANCE.getStatistics, null, VERBS.GET, {
        action: 'statistics',
        serviceId,
        ...dateRange
      });

      if (success) {
        setState((prev) => ({
          ...prev,
          statistics: data
        }));
      }
    } catch (error) {
      console.warn('Error fetching statistics:', error);
    }
  }, [state.selectedDate]);

  const handleFetchDashboard = useCallback(async (serviceId, selectedDate = state.selectedDate) => {
    try {
      const dateRange = buildDateRange(selectedDate || getLastSundayDateString());
      const { data, success } = await zat(ATTENDANCE.dashboard, null, VERBS.GET, {
        action: 'dashboard',
        ...(serviceId ? { serviceId } : {}),
        ...dateRange
      });

      if (success) {
        setState((prev) => ({
          ...prev,
          dashboard: data,
          statistics: data?.statistics || null,
          selectedService: prev.selectedService || data?.activeServiceId || prev.selectedService
        }));
      }
    } catch (error) {
      console.warn('Error fetching attendance dashboard:', error);
    }
  }, [state.selectedDate]);

  const handleCreateFollowUp = async (followUpData) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { success, errorMessage } = await zat(CARE_FOLLOW_UP.createOne, followUpData, VERBS.POST);

      if (success) {
        await handleFetchAttendance({
          pageIndex: state.tableQuery.pageIndex,
          pageSize: state.tableQuery.pageSize,
          sortBy: state.tableQuery.sortBy
        });
        await Promise.all([
          handleFetchStatistics(state.selectedService, state.selectedDate),
          handleFetchDashboard(state.selectedService, state.selectedDate)
        ]);
        setState((prev) => ({ ...prev, loading: false }));
        return true;
      } else {
        handleError(errorMessage || 'Failed to create follow-up');
        return false;
      }
    } catch (error) {
      handleError('An unexpected error occurred while creating follow-up.');
      return false;
    }
  };

  const handleSelectService = (serviceId) => {
    setState((prev) => ({
      ...prev,
      selectedService: serviceId,
      selectedQueue: 'ALL',
      tableQuery: {
        pageIndex: 1,
        pageSize: prev.tableQuery.pageSize,
        sortBy: prev.tableQuery.sortBy
      }
    }));
  };

  const handleSelectDate = (selectedDate) => {
    setState((prev) => ({
      ...prev,
      selectedDate: selectedDate || getLastSundayDateString(),
      tableQuery: {
        pageIndex: 1,
        pageSize: prev.tableQuery.pageSize,
        sortBy: prev.tableQuery.sortBy
      }
    }));
  };

  const handleSelectQueue = (status) => {
    setState((prev) => ({
      ...prev,
      selectedQueue: status,
      tableQuery: {
        pageIndex: 1,
        pageSize: prev.tableQuery.pageSize,
        sortBy: prev.tableQuery.sortBy
      }
    }));
  };

  useEffect(() => {
    handleFetchServices();
    handleFetchAssignableUsers();
  }, [handleFetchAssignableUsers, handleFetchServices]);

  useEffect(() => {
    if (state.selectedService) {
      handleFetchDashboard(state.selectedService, state.selectedDate);
      handleFetchStatistics(state.selectedService, state.selectedDate);
    }
  }, [state.selectedDate, state.selectedQueue, state.selectedService, handleFetchDashboard, handleFetchStatistics]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const existingFilters = getStoredFilters() || {};

    window.localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify({
      ...existingFilters,
      selectedService: state.selectedService,
      selectedDate: state.selectedDate,
      selectedQueue: state.selectedQueue
    }));
  }, [state.selectedDate, state.selectedQueue, state.selectedService]);

  return {
    ...state,
    handleFetchServices,
    handleFetchAssignableUsers,
    handleFetchAttendance,
    handleSelectService,
    handleSelectDate,
    handleSelectQueue,
    handleCreateFollowUp,
    handleFetchStatistics,
    handleFetchDashboard
  };
};

export { useAttendance };
