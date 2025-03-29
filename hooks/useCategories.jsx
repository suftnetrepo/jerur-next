/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { zat } from '../utils/api';
import { VERBS } from '../config';
import { CATEGORY } from '../utils/apiUrl';
import { categoryValidator } from '../validator/categoryValidator';

const useCategories = (searchQuery) => {
  const [state, setState] = useState({
    data: [],
    editData: null,
    loading: false,
    fields: categoryValidator.fields,
    error: null,
    success: false,
    rules: categoryValidator.rules,
       totalCount: 0
  });

  const handleReset = () => {
    setState((pre) => {
      return { ...pre, editData : null, fields: categoryValidator.fields };
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

  const handleError = (error) => {
    setState((pre) => {
      return { ...pre, error: error, loading: false };
    });
  };

  const handleFetch = useCallback(async ({ pageIndex = 1, pageSize = 10, sortBy = [], searchQuery = '' }) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const sortField = sortBy.length > 0 ? sortBy[0].id : null;
    const sortOrder = sortBy.length > 0 ? (sortBy[0].desc ? 'desc' : 'asc') : 'null';
    const { data, success, errorMessage } = await zat(CATEGORY.fetch, null, VERBS.GET, {
      page: pageIndex === 0 ? 1 : pageIndex,
      limit: pageSize,
      ...(sortField && { sortField }),
      ...(sortOrder && { sortOrder }),
      ...(searchQuery && { searchQuery })
    });

    if (success) {
      setState((pre) => ({
        ...pre,
        data: data.data,
        totalCount: data.totalCount,
        loading: false
      }));
      return true;
    } else {
      handleError(errorMessage);
    }
  }, []);

  async function handleEdit(body, id) {
    setState((prev) => ({ ...prev, loading: true }));
    const { success, errorMessage } = await zat(CATEGORY.updateOne, body, VERBS.PUT, { id: id });

    if (success) {
      setState((prevState) => ({
        ...prevState,
        data: prevState.data.map((category) => (category._id === id ? body : category)),
        loading: false
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the category.');
      return false;
    }
  }

  const handleSave = async (body) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const { data, success, errorMessage } = await zat(CATEGORY.createOne, body, VERBS.POST);

    if (success) {
      setState((prevState) => ({
        ...prevState,
        data: [data, ...prevState.data],
        loading: false
      }));

      return true;
    } else {
      handleError(errorMessage);
    }
  };

  const handleSelect = (editData) => {
    setState((pre) => ({
      ...pre,
      editData: editData
    }));
    return true;
  };

  const handleDelete = async (id) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const { success, errorMessage } = await zat(CATEGORY.removeOne, null, VERBS.DELETE, {
      id: id
    });

    if (success) {
      setState((pre) => ({
        ...pre,
        data: pre.data.filter((category) => category._id !== id),
        loading: false,
        totalCount: pre.totalCount - 1
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to delete the category.');
      return false;
    }
  };

  useEffect(() => {
    handleFetch({ searchQuery });
  }, [searchQuery, handleFetch]);

  return { ...state, handleSelect, handleChange, handleFetch, handleDelete, handleReset, handleSave, handleEdit };
};

export { useCategories };
