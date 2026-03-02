import React, { useState, useEffect, useCallback } from 'react';
import { zat } from '../utils/api';
import { VERBS } from '../config';
import { MEMBER } from '../utils/apiUrl';
import { memberValidator } from '../validator/rules';

const useMember = (searchQuery) => {
  const [state, setState] = useState({
    data: [],
    fields: memberValidator.fields,
    loading: false,
    success:false,
    error: null,
    totalCount: 0
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
      setState((prevState) => ({
        ...prevState,
        data: prevState.data.filter((user) => user._id !== id),
        totalCount: prevState.totalCount - 1,
        loading: false,
        success: true
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to delete the member.');
      return false;
    }
  };

  async function handleSave(body) {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const { success, errorMessage, data } = await zat(MEMBER.createOne, body, VERBS.POST);

    if (success) {
      setState((prevState) => ({
        ...prevState,
        data: [data, ...prevState.data],
        loading: false,
        success: true
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the member.');
      return false;
    }
  }

  const handleFetch = useCallback(async ({ pageIndex = 1, pageSize = 10, sortBy = [], searchQuery = '' }) => {
    const sortField = sortBy.length > 0 ? sortBy[0].id : null;
    const sortOrder = sortBy.length > 0 ? (sortBy[0].desc ? 'desc' : 'asc') : null;

    try {
      const { data, success, errorMessage, totalCount } = await zat(MEMBER.fetch, null, VERBS.GET, {
        action: 'getAll',
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
      handleError('An unexpected error occurred while fetching member.');
      return false;
    }
  }, []);

  async function handleEdit(body, id) {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const { success, errorMessage } = await zat(MEMBER.updateOne, body, VERBS.PUT, { id: id });

    if (success) {
      setState((prevState) => ({
        ...prevState,
        data: prevState.data.map((user) => (user._id === id ? body : user)),
        loading: false,
        success:true
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the member.');
      return false;
    }
  }

  useEffect(() => {
    handleFetch({ searchQuery });
  }, [searchQuery, handleFetch]);

  return {
    ...state,
    handleFetch,
    handleDelete,
    handleSelect,
    handleEdit,
    handleSave,
    handleReset,
    handleChange
  };
};

export { useMember };
