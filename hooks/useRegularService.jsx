import { useState, useEffect, useCallback } from 'react';
import { zat } from '../utils/api';
import { VERBS } from '../config';
import { REGULAR_SERVICE } from '../utils/apiUrl';
import { regularServiceValidator } from '../validator/rules';

const useRegularService = (searchQuery = '') => {
  const [state, setState] = useState({
    data: [],
    loading: false,
    error: null,
    totalCount: 0,
    fields: regularServiceValidator.fields,
    success: false,
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

  async function handleSave(body) {
    setState((prev) => ({ ...prev, loading: true }));
    const { success, errorMessage, data } = await zat(REGULAR_SERVICE.createOne, body, VERBS.POST);

    if (success) {
      setState((prevState) => {
        const updatedData = [data, ...prevState.data].sort((a, b) => a.sequency_no - b.sequency_no);

        return {
          ...prevState,
          data: updatedData,
          loading: false,
          success: true
        };
      });
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the user.');
      return false;
    }
  }

  async function handleEdit(body, id, fields) {
    setState((prev) => ({ ...prev, loading: true }));
    const { success, errorMessage } = await zat(REGULAR_SERVICE.updateOne, body, VERBS.PUT, {
      id: id
    });

    if (success) {
      setState((prev) => ({
        ...prev,
        data: prev.data.map((j) => (j._id === id ? fields : j)),
        success: true,
        loading: false
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the service.');
      return false;
    }
  }

  const handleReset = () => {
    setState((prevState) => ({
      ...prevState,
      fields: {
        ...regularServiceValidator.reset()
      },
      error: null,
      loading: false,
      success: false
    }));
  };

  const handleDelete = async (id) => {
    const { success, errorMessage } = await zat(REGULAR_SERVICE.removeOne, null, VERBS.DELETE, { id: id });

    if (success) {
      setState((prevState) => ({
        ...prevState,
        data: prevState.data.filter((j) => j._id !== id),
        totalCount: prevState.totalCount - 1,
        loading: false,
        success: true
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to delete the service.');
      return false;
    }
  };

  const handleFetch = useCallback(async ({ pageIndex = 1, pageSize = 10, sortBy = [], searchQuery = '' }) => {
    const sortField = sortBy.length > 0 ? sortBy[0].id : null;
    const sortOrder = sortBy.length > 0 ? (sortBy[0].desc ? 'desc' : 'asc') : null;

    try {
      const { data, success, errorMessage, totalCount } = await zat(REGULAR_SERVICE.fetch, null, VERBS.GET, {
        action: 'paginate',
        page: pageIndex === 0 ? 1 : pageIndex,
        limit: pageSize,
        ...(sortField && { sortField }),
        ...(sortOrder && { sortOrder }),
        searchQuery
      });

      if (success) {
              const sorted = data.sort((a, b) => a.sequency_no - b.sequency_no);
        setState((pre) => ({
          ...pre,
          data: sorted,
          totalCount: totalCount,
          loading: false
        }));
        return true;
      } else {
        handleError(errorMessage || 'Failed to fetch regular service.');
        return false;
      }
    } catch (error) {
      handleError('An unexpected error occurred while fetching regular service.');
      return false;
    }
  }, []);

  useEffect(() => {
    handleFetch({ searchQuery });
  }, [searchQuery, handleFetch]);

  return {
    ...state,
    handleChange,
    handleSelect,
    handleSave,
    handleEdit,
    handleDelete,
    handleReset,
    handleFetch,
  };
};

export { useRegularService };
