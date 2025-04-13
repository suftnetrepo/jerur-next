import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import { zat } from '../utils/api';
import { VERBS } from '../config';
import { EVENT } from '../utils/apiUrl';
import { eventValidator } from '@/validator/rules';

const useEvent = (searchQuery) => {
  const [state, setState] = useState({
    data: [],
    options: [],
    loading: false,
    error: null,
    totalCount: 0
  });

  const handleError = (error) => {
    setState((pre) => {
      return { ...pre, error: error, loading: false };
    });
  };

  const handleReset = () => {
    setState((pre) => {
      return { ...pre, data: null, singleData: null, error: null };
    });
  };

  const handleDelete = async (id) => {
    const { success, errorMessage } = await zat(EVENT.removeOne, null, VERBS.DELETE, { id: id });

    if (success) {
      setState((prevState) => ({
        ...prevState,
        data: prevState.data.filter((j) => j._id !== id),
        totalCount: prevState.totalCount - 1,
        loading: false
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to delete the event.');
      return false;
    }
  };

  const handleSelectedAddress = (selectedAddress) => {
    setState((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        addressLine1:
          selectedAddress?.address.suburb || selectedAddress?.address.place || selectedAddress?.address.municipality,
        town: selectedAddress?.address.town || selectedAddress?.address.city,
        county: selectedAddress?.address.county || selectedAddress?.address.state,
        postcode:
          selectedAddress?.address.country_code === 'gb' || selectedAddress?.address.country_code === 'us'
            ? selectedAddress?.address.postcode
            : '',
        country: selectedAddress?.address.country,
        completeAddress: selectedAddress?.display_name,
        location: {
          type: 'Point',
          coordinates: [parseFloat(selectedAddress?.lat) || 0, parseFloat(selectedAddress?.lon) || 0]
        }
      }
    }));
  };

  const handleFetch = useCallback(async ({ pageIndex = 1, pageSize = 10, sortBy = [], searchQuery = '' }) => {
    const sortField = sortBy.length > 0 ? sortBy[0].id : null;
    const sortOrder = sortBy.length > 0 ? (sortBy[0].desc ? 'desc' : 'asc') : 'null';

    try {
      const { data, success, errorMessage, totalCount } = await zat(EVENT.fetch, null, VERBS.GET, {
        action: 'paginate',
        page: pageIndex === 0 ? 1 : pageIndex,
        limit: pageSize,
        ...(sortField && { sortField }),
        ...(sortOrder && { sortOrder }),
        searchQuery,
        status : false
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
      handleError('An unexpected error occurred while fetching events.');
      return false;
    }
  }, []);

  async function handleFetchSingle(id) {
    setState((prev) => ({ ...prev, loading: true }));
    const { success, data, errorMessage } = await zat(EVENT.fetchOne, null, VERBS.GET, {
      id: id
    });

    if (success) {
      setState((prevState) => ({
        ...prevState,
        data:data,
        loading: false
      }));
    } else {
      handleError(errorMessage || 'Failed to fetch the event.');
    }
  }

  useEffect(() => {
    handleFetch({ searchQuery });
  }, [searchQuery, handleFetch]);

  return {
    ...state,
    handleFetch,
    handleDelete,
    handleReset,
    handleSelectedAddress,
    handleFetchSingle,
  };
};

const useEventEdit = (id) => {
  const [state, setState] = useState({
    data: {},
    fields: eventValidator.fields,
    loading: false,
    error: null,
    success: false
  });

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
    setState((prevState) => ({
      ...prevState,
      error: error,
      loading: false
    }));
  };

  const handleReset = () => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    setState({
      data: null,
      fields: {
        ...eventValidator.fields,
        start_date: moment(new Date()).format('YYYY-MM-DDTHH:mm'),
        end_date: moment(endDate).format('YYYY-MM-DDTHH:mm')
      },
      error: null,
      loading: false,
      success: false
    });
  };

  const handleSelectedAddress = (selectedAddress) => {
    setState((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        addressLine1:
          selectedAddress?.address.suburb || selectedAddress?.address.place || selectedAddress?.address.municipality,
        town: selectedAddress?.address.town || selectedAddress?.address.city,
        county: selectedAddress?.address.county || selectedAddress?.address.state,
        postcode:
          selectedAddress?.address.country_code === 'gb' || selectedAddress?.address.country_code === 'us'
            ? selectedAddress?.address.postcode
            : '',
        country: selectedAddress?.address.country,
        completeAddress: selectedAddress?.display_name,
        location: {
          type: 'Point',
          coordinates: [parseFloat(selectedAddress?.lat) || 0, parseFloat(selectedAddress?.lon) || 0]
        }
      }
    }));
  };

  async function handleSelect(id) {
    setState((prev) => ({ ...prev, loading: true }));
    const { success, data, errorMessage } = await zat(EVENT.fetchOne, null, VERBS.GET, {
      action: 'single',
      id: id
    });

    if (success) {
      setState((prevState) => ({
        ...prevState,
        fields: {
          ...prevState.fields,
          ...data,
          start_date: moment(data?.start_date).format('YYYY-MM-DDTHH:mm'),
          end_date: moment(data?.end_date).format('YYYY-MM-DDTHH:mm')
        },
        loading: false
      }));
    } else {
      handleError(errorMessage || 'Failed to fetch the event.');
    }
  }

  async function handleSave(body) {
    setState((prev) => ({ ...prev, loading: true }));
    const { success, errorMessage } = await zat(EVENT.createOne, body, VERBS.POST);

    if (success) {
      setState((prevState) => ({
        ...prevState,
        success: true,
        loading: false
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the event.');
      return false;
    }
  }

  async function handleEdit(body, id) {
    setState((prev) => ({ ...prev, loading: true }));
    const { success, errorMessage } = await zat(EVENT.updateOne, body, VERBS.PUT, { id: id });

    if (success) {
      setState((prev) => ({ ...prev, loading: false }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the event.');
      return false;
    }
  }

  useEffect(() => {
    if (id) {
      handleSelect(id);
    }
  }, [id]);

  return {
    ...state,
    handleSelect,
    handleReset,
    handleEdit,
    handleChange,
    handleSave,
    handleSelectedAddress
  };
};

export { useEvent, useEventEdit };
