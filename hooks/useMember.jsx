import React, { useRef, useState, useCallback } from 'react';
import { zat } from '../utils/api';
import { VERBS } from '../config';
import { MEMBER } from '../utils/apiUrl';
import { memberValidator } from '../validator/rules';

const EMPTY_STATUS_COUNTS = {
  all: 0,
  active: 0,
  provisional: 0,
  'under discipline': 0,
  inactive: 0
};

const useMember = (searchQuery, selectedStatus = 'ALL') => {
  const tableQueryRef = useRef({ pageIndex: 1, pageSize: 10, sortBy: [] });
  const [state, setState] = useState({
    data: [],
    fields: memberValidator.fields,
    loading: false,
    success:false,
    error: null,
    totalCount: 0,
    statusCounts: EMPTY_STATUS_COUNTS
  });

  const handleError = (error) => {
    setState((pre) => {
      return { ...pre, error: error, success: false, loading: false };
    });
  };

  const handleChange = (name, value) => {
    setState((prevState) => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        [name]: value
      }
    }));
  };

  async function handleSelect(body) {
    setState((prevState) => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        ...body,
        error: null,
        success: false,
        loading: false
      }
    }));
  }

  const handleReset = () => {
    setState((prevState) => ({
      ...prevState,
      fields: {
        ...memberValidator.reset()
      },
      error: null,
      loading: false,
      success: false
    }));
  };

  const handleDelete = async (id) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const { success, errorMessage } = await zat(MEMBER.removeOne, null, VERBS.DELETE, { id: id });

    if (success) {
      await handleFetch(tableQueryRef.current);
      setState((prevState) => ({ ...prevState, success: true }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to delete the member.');
      return false;
    }
  };

  const handleFetchOne = useCallback(async (id) => {
    if (!id) {
      return false;
    }

    try {
      const { data, success, errorMessage } = await zat(MEMBER.fetch, null, VERBS.GET, {
        action: 'get',
        id
      });

      if (success && data) {
        handleSelect(data);
        return true;
      }

      handleError(errorMessage || 'Failed to fetch member.');
      return false;
    } catch (error) {
      handleError('An unexpected error occurred while fetching member.');
      return false;
    }
  }, []);

  async function handleSave(body) {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const { success, errorMessage, data } = await zat(MEMBER.createOne, body, VERBS.POST);

    if (success) {
      await handleFetch(tableQueryRef.current);
      setState((prevState) => ({ ...prevState, success: true }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the member.');
      return false;
    }
  }

  const handleFetch = useCallback(async ({ pageIndex = 1, pageSize = 10, sortBy = [] } = {}) => {
    setState((prevState) => ({ ...prevState, loading: true, error: null }));
    const sortField = sortBy.length > 0 ? sortBy[0].id : null;
    const sortOrder = sortBy.length > 0 ? (sortBy[0].desc ? 'desc' : 'asc') : null;
    const normalizedPageIndex = pageIndex === 0 ? 1 : pageIndex;

    tableQueryRef.current = {
      pageIndex: normalizedPageIndex,
      pageSize,
      sortBy
    };

    try {
      const { data, members, success, errorMessage, totalCount, pagination, statusCounts, aggregates } = await zat(MEMBER.fetch, null, VERBS.GET, {
        action: 'getAll',
        page: normalizedPageIndex,
        limit: pageSize,
        ...(sortField && { sortField }),
        ...(sortOrder && { sortOrder }),
        ...(searchQuery ? { searchQuery } : {}),
        ...(selectedStatus !== 'ALL' ? { status: selectedStatus } : {})
      });

      if (success) {
        setState((pre) => ({
          ...pre,
          data: members || data || [],
          totalCount: pagination?.totalCount ?? totalCount ?? 0,
          statusCounts: aggregates ? {
            all: aggregates.total ?? 0,
            active: aggregates.active ?? 0,
            provisional: aggregates.provisional ?? 0,
            'under discipline': aggregates.underDiscipline ?? 0,
            inactive: aggregates.inactive ?? 0
          } : (statusCounts || EMPTY_STATUS_COUNTS),
          loading: false
        }));
        return true;
      } else {
        handleError(errorMessage);
        return false;
      }
    } catch (error) {
      handleError('An unexpected error occurred while fetching member.');
      return false;
    }
  }, [searchQuery, selectedStatus]);

  async function handleEdit(body, id) {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const { success, errorMessage } = await zat(MEMBER.updateOne, body, VERBS.PUT, { id: id });

    if (success) {
      await handleFetch(tableQueryRef.current);
      setState((prevState) => ({ ...prevState, success: true }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the member.');
      return false;
    }
  }

  return {
    ...state,
    handleFetch,
    handleDelete,
    handleFetchOne,
    handleSelect,
    handleEdit,
    handleSave,
    handleReset,
    handleChange
  };
};

export { useMember };
