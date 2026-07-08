import React, { useState, useEffect, useCallback } from 'react';
import { zat } from '../utils/api';
import { VERBS } from '../config';
import { ATTENDANCE, REGULAR_SERVICE, CARE_FOLLOW_UP, USER } from '../utils/apiUrl';

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
  const [state, setState] = useState({
    attendanceData: [],
    services: [],
    assignableUsers: [],
    loading: false,
    error: null,
    totalCount: 0,
    selectedService: null,
    selectedQueue: 'ALL',
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
          selectedService: prev.selectedService || data?.[0]?._id || null
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
        searchQuery
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
  }, [searchQuery, state.selectedService, state.selectedQueue]);

  const handleFetchStatistics = useCallback(async (serviceId) => {
    try {
      const { data, success } = await zat(ATTENDANCE.getStatistics, null, VERBS.GET, {
        action: 'statistics',
        serviceId
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
  }, []);

  const handleFetchDashboard = useCallback(async (serviceId) => {
    try {
      const { data, success } = await zat(ATTENDANCE.dashboard, null, VERBS.GET, {
        action: 'dashboard',
        ...(serviceId ? { serviceId } : {})
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
  }, []);

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
      handleFetchDashboard(state.selectedService);
      handleFetchStatistics(state.selectedService);
    }
  }, [state.selectedQueue, state.selectedService, handleFetchDashboard, handleFetchStatistics]);

  return {
    ...state,
    handleFetchServices,
    handleFetchAssignableUsers,
    handleFetchAttendance,
    handleSelectService,
    handleSelectQueue,
    handleCreateFollowUp,
    handleFetchStatistics,
    handleFetchDashboard
  };
};

export { useAttendance };
