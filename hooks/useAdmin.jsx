import React, { useState, useEffect, useCallback } from 'react';
import { zat } from '../utils/api';
import { VERBS } from '../config';
import { CHURCH } from '../utils/apiUrl';

const useAdmin = (searchQuery) => {
  const [state, setState] = useState({
    data: [],
    viewData: {},
    loading: false,
    error: null,
    totalCount: 0
  });
  
  const handleSelect = (data) => {
    setState((pre) => {
      return { ...pre, viewData: data };
    });
  };

  const handleError = (error) => {
    setState((pre) => {
      return { ...pre, error: error, loading: false };
    });
  };

  const handleReset = () => {
    setState((pre) => {
      return { ...pre, editData: null, error: null };
    });
  };

  const handleFetchChurches = useCallback(
    async ({ pageIndex = 1, pageSize = 10, sortBy = [], searchQuery = '' }) => {
      const sortField = sortBy.length > 0 ? sortBy[0].id : null;
      const sortOrder = sortBy.length > 0 ? (sortBy[0].desc ? 'desc' : 'asc') : null;

      try {
        const { data, success, errorMessage, totalCount } = await zat(CHURCH.fetchChurches, null, VERBS.GET, {
          action: 'paginate',
          page: pageIndex === 0 ? 1 : pageIndex,
          limit: pageSize,
          ...(sortField && { sortField }),
          ...(sortOrder && { sortOrder }),
          searchQuery
        });

        if (success) {
          setState((pre) => ({
            ...pre,
            data: data,
            totalCount: totalCount,
            loading: false
          }));
          return true;
        } else {
          handleError(errorMessage);
          return false;
        }
      } catch (error) {
        handleError('An unexpected error occurred while fetching churches.');
        return false;
      }
    },
    []
  );

  useEffect(() => {
    handleFetchChurches({ searchQuery });
  }, [searchQuery, handleFetchChurches]);

  return {
    ...state,
    handleFetchChurches,
    handleReset,
    handleSelect,
  };
};

export { useAdmin };
