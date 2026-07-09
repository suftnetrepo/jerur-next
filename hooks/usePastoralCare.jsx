import React, { useCallback, useEffect, useState } from 'react';
import { zat } from '../utils/api';
import { VERBS } from '../config';
import { CARE_FOLLOW_UP, USER } from '../utils/apiUrl';

const getMemberName = (member) => `${member?.first_name || ''} ${member?.last_name || ''}`.trim().toLowerCase();

const matchesSelectedFilters = ({ row, selectedStatus, selectedAssignedTo, selectedPriority, searchQuery, currentUserId }) => {
  if (selectedStatus !== 'ALL' && row.status !== selectedStatus) {
    return false;
  }

  if (selectedPriority !== 'ALL' && row.priority !== selectedPriority) {
    return false;
  }

  if (selectedAssignedTo !== 'ALL') {
    const assignedId = row.assignedTo?._id || row.assignedTo;
    const expectedAssignedId = selectedAssignedTo === 'ME' ? currentUserId : selectedAssignedTo;

    if (!expectedAssignedId || assignedId !== expectedAssignedId) {
      return false;
    }
  }

  if (searchQuery?.trim()) {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const memberName = getMemberName(row.memberId);
    const memberEmail = String(row.memberId?.email || '').toLowerCase();
    const memberMobile = String(row.memberId?.mobile || '').toLowerCase();

    if (![memberName, memberEmail, memberMobile].some((value) => value.includes(normalizedSearch))) {
      return false;
    }
  }

  return true;
};

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
      const { assignedToData, ...requestUpdates } = updates;
      const { success, errorMessage } = await zat(CARE_FOLLOW_UP.updateOne, requestUpdates, VERBS.PUT, { id });

      if (success) {
        setState((prev) => {
          const selectedCaseDraft = prev.selectedCase?._id === id
            ? {
                ...prev.selectedCase,
                ...requestUpdates,
                assignedTo: assignedToData !== undefined ? assignedToData : prev.selectedCase.assignedTo
              }
            : prev.selectedCase;

          const updatedRow = prev.data.find((row) => row._id === id)
            ? {
                ...prev.data.find((row) => row._id === id),
                ...requestUpdates,
                assignedTo: assignedToData !== undefined ? assignedToData : prev.data.find((row) => row._id === id).assignedTo,
                updatedAt: new Date().toISOString()
              }
            : null;

          const nextData = updatedRow
            ? prev.data.reduce((rows, row) => {
                if (row._id !== id) {
                  rows.push(row);
                  return rows;
                }

                if (matchesSelectedFilters({
                  row: updatedRow,
                  selectedStatus: prev.selectedStatus,
                  selectedAssignedTo: prev.selectedAssignedTo,
                  selectedPriority: prev.selectedPriority,
                  searchQuery,
                  currentUserId: prev.dashboard?.currentUserId
                })) {
                  rows.push(updatedRow);
                }

                return rows;
              }, [])
            : prev.data;

          return {
            ...prev,
            selectedCase: selectedCaseDraft,
            data: nextData,
            totalCount: updatedRow && !nextData.find((row) => row._id === id)
              ? Math.max(0, prev.totalCount - 1)
              : prev.totalCount,
            saving: false
          };
        });

        handleFetchDashboard();
        return true;
      }

      handleError(errorMessage || 'Failed to update pastoral care case');
      return false;
    } catch (error) {
      handleError('An unexpected error occurred while updating pastoral care case.');
      return false;
    }
  }, [handleFetchDashboard, searchQuery]);

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