import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

const buildDateRange = (startValue, endValue = startValue) => {
  if (!startValue && !endValue) {
    return {};
  }

  const parseDate = (value, endOfDay = false) => {
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
  };

  const startDate = parseDate(startValue);
  const endDate = parseDate(endValue, true);

  return {
    ...(startDate ? { startDate: startDate.toISOString() } : {}),
    ...(endDate ? { endDate: endDate.toISOString() } : {})
  };
};

const buildReportParams = (state) => ({
  ...buildDateRange(state.selectedStartDate, state.selectedEndDate),
  ...(STATUS_FILTERS.includes(state.selectedQueue) ? { status: state.selectedQueue } : {}),
  ...(state.selectedAgeGroup !== 'ALL' ? { ageGroup: state.selectedAgeGroup } : {}),
  ...(state.selectedGender !== 'ALL' ? { gender: state.selectedGender } : {}),
  ...(state.selectedSubmissionType !== 'ALL' ? { submissionType: state.selectedSubmissionType } : {}),
  ...(state.selectedChannel !== 'ALL' ? { checkedInVia: state.selectedChannel } : {})
});

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
    selectedStartDate: storedFilters?.selectedStartDate || storedFilters?.selectedDate || getLastSundayDateString(),
    selectedEndDate: storedFilters?.selectedEndDate || storedFilters?.selectedDate || getLastSundayDateString(),
    selectedQueue: storedFilters?.selectedQueue || 'ALL',
    selectedAgeGroup: storedFilters?.selectedAgeGroup || 'ALL',
    selectedGender: storedFilters?.selectedGender || 'ALL',
    selectedSubmissionType: storedFilters?.selectedSubmissionType || 'ALL',
    selectedChannel: storedFilters?.selectedChannel || 'ALL',
    statistics: null,
    dashboard: null,
    tableQuery: {
      pageIndex: 1,
      pageSize: 10,
      sortBy: []
    }
  });
  const reportParams = useMemo(() => buildReportParams({
    selectedAgeGroup: state.selectedAgeGroup,
    selectedChannel: state.selectedChannel,
    selectedEndDate: state.selectedEndDate,
    selectedGender: state.selectedGender,
    selectedQueue: state.selectedQueue,
    selectedStartDate: state.selectedStartDate,
    selectedSubmissionType: state.selectedSubmissionType
  }), [
    state.selectedAgeGroup,
    state.selectedChannel,
    state.selectedEndDate,
    state.selectedGender,
    state.selectedQueue,
    state.selectedStartDate,
    state.selectedSubmissionType
  ]);

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
      const params = {
        serviceId: state.selectedService,
        page: pageIndex === 0 ? 1 : pageIndex,
        limit: pageSize,
        searchQuery,
        ...reportParams
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
  }, [reportParams, searchQuery, state.selectedQueue, state.selectedService]);

  const handleFetchStatistics = useCallback(async (serviceId) => {
    try {
      const { data, success } = await zat(ATTENDANCE.getStatistics, null, VERBS.GET, {
        action: 'statistics',
        serviceId,
        ...reportParams
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
  }, [reportParams]);

  const handleFetchDashboard = useCallback(async (serviceId) => {
    try {
      const { data, success } = await zat(ATTENDANCE.dashboard, null, VERBS.GET, {
        action: 'dashboard',
        ...(serviceId ? { serviceId } : {}),
        ...reportParams
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
  }, [reportParams]);

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
          handleFetchStatistics(state.selectedService),
          handleFetchDashboard(state.selectedService)
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

  const handleSelectDateRange = (field, value) => {
    setState((prev) => ({
      ...prev,
      [field]: value,
      tableQuery: {
        pageIndex: 1,
        pageSize: prev.tableQuery.pageSize,
        sortBy: prev.tableQuery.sortBy
      }
    }));
  };

  const handleSelectReportFilter = (field, value) => {
    setState((prev) => ({
      ...prev,
      [field]: value,
      tableQuery: { ...prev.tableQuery, pageIndex: 1 }
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
    const task = window.setTimeout(() => {
      handleFetchServices();
      handleFetchAssignableUsers();
    }, 0);

    return () => window.clearTimeout(task);
  }, [handleFetchAssignableUsers, handleFetchServices]);

  useEffect(() => {
    if (!state.selectedService) return undefined;

    const task = window.setTimeout(() => {
      handleFetchDashboard(state.selectedService);
      handleFetchStatistics(state.selectedService);
    }, 0);

    return () => window.clearTimeout(task);
  }, [state.selectedQueue, state.selectedService, handleFetchDashboard, handleFetchStatistics]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const existingFilters = getStoredFilters() || {};

    window.localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify({
      ...existingFilters,
      selectedService: state.selectedService,
      selectedStartDate: state.selectedStartDate,
      selectedEndDate: state.selectedEndDate,
      selectedQueue: state.selectedQueue,
      selectedAgeGroup: state.selectedAgeGroup,
      selectedGender: state.selectedGender,
      selectedSubmissionType: state.selectedSubmissionType,
      selectedChannel: state.selectedChannel
    }));
  }, [state.selectedAgeGroup, state.selectedChannel, state.selectedEndDate, state.selectedGender, state.selectedQueue, state.selectedService, state.selectedStartDate, state.selectedSubmissionType]);

  return {
    ...state,
    handleFetchServices,
    handleFetchAssignableUsers,
    handleFetchAttendance,
    handleSelectService,
    handleSelectDateRange,
    handleSelectReportFilter,
    handleSelectQueue,
    handleCreateFollowUp,
    handleFetchStatistics,
    handleFetchDashboard
  };
};

export { useAttendance };
