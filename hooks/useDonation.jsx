import React, { useRef, useState, useCallback } from 'react';
import { zat } from '../utils/api';
import { VERBS } from '../config';
import { DONATION } from '../utils/apiUrl';
import { donationValidator } from '../validator/rules';

const DEFAULT_DONATION_SUMMARY = {
  totalAmount: 0,
  onlineAmount: 0,
  offlineAmount: 0,
  transactionCount: 0
};

const useDonation = (filters) => {
  const tableQueryRef = useRef({ pageIndex: 1, pageSize: 10, sortBy: [] });
  const [state, setState] = useState({
    data: [],
    fields: donationValidator.fields,
    loading: false,
    success:false,
    error: null,
    totalCount: 0,
    summary: DEFAULT_DONATION_SUMMARY
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
        ...donationValidator.reset()
      },
      error: null,
      loading: false,
      success: false
    }));
  };

  const handleDelete = async (id) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const { success, errorMessage } = await zat(DONATION.removeOne, null, VERBS.DELETE, { id: id });

    if (success) {
      await handleFetch(tableQueryRef.current);
      setState((prevState) => ({ ...prevState, success: true }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to delete the donation.');
      return false;
    }
  };

  async function handleSave(body) {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const { success, errorMessage, data } = await zat(DONATION.createOne, body, VERBS.POST);

    if (success) {
      await handleFetch(tableQueryRef.current);
      setState((prevState) => ({ ...prevState, success: true }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the donation.');
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
      const { data, donations, success, errorMessage, totalCount, pagination, summary } = await zat(DONATION.fetch, null, VERBS.GET, {
        action: 'paginate',
        page: normalizedPageIndex,
        limit: pageSize,
        ...(sortField && { sortField }),
        ...(sortOrder && { sortOrder }),
        ...(filters?.search ? { search: filters.search } : {}),
        ...(filters?.donationType && filters.donationType !== 'ALL' ? { donationType: filters.donationType } : {}),
        ...(filters?.startDate ? { startDate: filters.startDate } : {}),
        ...(filters?.endDate ? { endDate: filters.endDate } : {}),
        ...(filters?.paymentMethod && filters.paymentMethod !== 'ALL' ? { paymentMethod: filters.paymentMethod } : {})
      });

      if (success) {
        setState((pre) => ({
          ...pre,
          data: donations || data || [],
          totalCount: pagination?.totalCount ?? totalCount ?? 0,
          summary: summary || DEFAULT_DONATION_SUMMARY,
          loading: false
        }));
        return true;
      } else {
        handleError(errorMessage);
        return false;
      }
    } catch (error) {
      handleError('An unexpected error occurred while fetching donation.');
      return false;
    }
  }, [filters]);

  async function handleEdit(body, id) {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const { success, errorMessage } = await zat(DONATION.updateOne, body, VERBS.PUT, { id: id });

    if (success) {
      await handleFetch(tableQueryRef.current);
      setState((prevState) => ({ ...prevState, success:true }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the donation.');
      return false;
    }
  }

  const fetchExportRows = useCallback(async () => {
    const exportLimit = Math.max(state.summary.transactionCount || state.totalCount || 0, 1);
    const activeSortBy = tableQueryRef.current.sortBy || [];
    const sortField = activeSortBy.length > 0 ? activeSortBy[0].id : null;
    const sortOrder = activeSortBy.length > 0 ? (activeSortBy[0].desc ? 'desc' : 'asc') : null;

    const response = await zat(DONATION.fetch, null, VERBS.GET, {
      action: 'paginate',
      page: 1,
      limit: exportLimit,
      ...(sortField && { sortField }),
      ...(sortOrder && { sortOrder }),
      ...(filters?.search ? { search: filters.search } : {}),
      ...(filters?.donationType && filters.donationType !== 'ALL' ? { donationType: filters.donationType } : {}),
      ...(filters?.startDate ? { startDate: filters.startDate } : {}),
      ...(filters?.endDate ? { endDate: filters.endDate } : {}),
      ...(filters?.paymentMethod && filters.paymentMethod !== 'ALL' ? { paymentMethod: filters.paymentMethod } : {})
    });

    if (!response.success) {
      throw new Error(response.errorMessage || 'Unable to export donations.');
    }

    return response.donations || response.data || [];
  }, [filters, state.summary.transactionCount, state.totalCount]);

  return {
    ...state,
    handleFetch,
    handleDelete,
    handleSelect,
    handleEdit,
    handleSave,
    handleReset,
    handleChange,
    fetchExportRows
  };
};

export { useDonation };
