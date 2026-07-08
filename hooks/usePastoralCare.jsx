import React, { useCallback, useEffect, useState } from 'react';
import { zat } from '../utils/api';
import { VERBS } from '../config';
import { CARE_FOLLOW_UP, USER } from '../utils/apiUrl';

const usePastoralCare = (searchQuery) => {
  const [state, setState] = useState({
    data: [],
    owners: [],
    dashboard: null,
    selectedStatus: 'ALL',
    selectedAssignedTo: 'ALL',
    selectedPriority: 'ALL',
    selectedCase: null,
    loading: false,
    detailsLoading: false,
    saving: false,
    error: null,
    totalCount: 0,
    tableQuery: {
      pageIndex: 1,
      pageSize: 10,
      sortBy: []
    }
  });

  const handleError = (error) => {
    setState((prev) => ({ ...prev, error, loading: false, detailsLoading: false, saving: false }));
  };

  const handleFetchOwners = useCallback(async () => {
    try {
      const { data, success } = await zat(USER.fetch, null, VERBS.GET, {
        action: 'getAll',
        page: 1,
        limit: 100
      });

      if (success) {
        setState((prev) => ({ ...prev, owners: data || [] }));
      }
    } catch (error) {
      console.warn('Error fetching pastoral care owners:', error);
    }
  }, []);

  const handleFetchDashboard = useCallback(async () => {
    try {
      const { data, success, errorMessage } = await zat(CARE_FOLLOW_UP.dashboard, null, VERBS.GET, {
        action: 'dashboard'
      });

      if (success) {
        setState((prev) => ({ ...prev, dashboard: data }));
        return true;
      }

      handleError(errorMessage || 'Failed to fetch pastoral care dashboard');
      return false;
    } catch (error) {
      handleError('An unexpected error occurred while fetching pastoral care dashboard.');
      return false;
    }
  }, []);

  const handleFetch = useCallback(async ({ pageIndex = 1, pageSize = 10, sortBy = [] } = {}) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const sortField = sortBy.length > 0 ? sortBy[0].id : 'updatedAt';
    const sortOrder = sortBy.length > 0 ? (sortBy[0].desc ? 'desc' : 'asc') : 'desc';

    try {
      const { data, success, errorMessage, totalCount } = await zat(CARE_FOLLOW_UP.fetch, null, VERBS.GET, {
        action: 'getAll',
        page: pageIndex === 0 ? 1 : pageIndex,
        limit: pageSize,
        sortField,
        sortOrder,
        status: state.selectedStatus,
        assignedTo: state.selectedAssignedTo,
        priority: state.selectedPriority,
        searchQuery
      });

      if (success) {
        setState((prev) => ({
          ...prev,
          data: data || [],
          totalCount: totalCount || 0,
          loading: false,
          tableQuery: {
            pageIndex: pageIndex === 0 ? 1 : pageIndex,
            pageSize,
            sortBy
          }
        }));
        return true;
      }

      handleError(errorMessage || 'Failed to fetch pastoral care cases');
      return false;
    } catch (error) {
      handleError('An unexpected error occurred while fetching pastoral care cases.');
      return false;
    }
  }, [searchQuery, state.selectedAssignedTo, state.selectedPriority, state.selectedStatus]);

  const handleFetchCase = useCallback(async (id) => {
    setState((prev) => ({ ...prev, detailsLoading: true, error: null }));

    try {
      const { data, success, errorMessage } = await zat(CARE_FOLLOW_UP.fetch, null, VERBS.GET, {
        action: 'getById',
        id
      });

      if (success) {
        setState((prev) => ({ ...prev, selectedCase: data, detailsLoading: false }));
        return true;
      }

      handleError(errorMessage || 'Failed to fetch pastoral care case');
      return false;
    } catch (error) {
      handleError('An unexpected error occurred while fetching pastoral care case.');
      return false;
    }
  }, []);

  const handleUpdateCase = useCallback(async (id, updates) => {
    setState((prev) => ({ ...prev, saving: true, error: null }));

    try {
      const { success, errorMessage } = await zat(CARE_FOLLOW_UP.updateOne, updates, VERBS.PUT, { id });

      if (success) {
        await Promise.all([
          handleFetchCase(id),
          handleFetchDashboard(),
          handleFetch({
            pageIndex: state.tableQuery.pageIndex,
            pageSize: state.tableQuery.pageSize,
            sortBy: state.tableQuery.sortBy
          })
        ]);

        setState((prev) => ({ ...prev, saving: false }));
        return true;
      }

      handleError(errorMessage || 'Failed to update pastoral care case');
      return false;
    } catch (error) {
      handleError('An unexpected error occurred while updating pastoral care case.');
      return false;
    }
  }, [handleFetch, handleFetchCase, handleFetchDashboard, state.tableQuery.pageIndex, state.tableQuery.pageSize, state.tableQuery.sortBy]);

  const handleSelectStatus = useCallback((status) => {
    setState((prev) => ({
      ...prev,
      selectedStatus: status,
      tableQuery: {
        ...prev.tableQuery,
        pageIndex: 1
      }
    }));
  }, []);

  const handleSelectAssignedTo = useCallback((assignedTo) => {
    setState((prev) => ({
      ...prev,
      selectedAssignedTo: assignedTo,
      tableQuery: {
        ...prev.tableQuery,
        pageIndex: 1
      }
    }));
  }, []);

  const handleSelectPriority = useCallback((priority) => {
    setState((prev) => ({
      ...prev,
      selectedPriority: priority,
      tableQuery: {
        ...prev.tableQuery,
        pageIndex: 1
      }
    }));
  }, []);

  const handleClearSelectedCase = useCallback(() => {
    setState((prev) => ({ ...prev, selectedCase: null }));
  }, []);

  useEffect(() => {
    handleFetchOwners();
    handleFetchDashboard();
  }, [handleFetchDashboard, handleFetchOwners]);

  return {
    ...state,
    handleFetch,
    handleFetchCase,
    handleUpdateCase,
    handleFetchDashboard,
    handleSelectStatus,
    handleSelectAssignedTo,
    handleSelectPriority,
    handleClearSelectedCase
  };
};

export { usePastoralCare };