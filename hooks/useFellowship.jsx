import { useState, useEffect, useCallback } from 'react';
import { zat } from '../utils/api';
import { VERBS } from '../config';
import { FELLOWSHIP } from '../utils/apiUrl';
import { fellowshipValidator } from '@/validator/rules';

const useFellowship = (searchQuery = '') => {
  const [state, setState] = useState({
    data: [],
    loading: false,
    error: null,
    totalCount: 0,
    fields: fellowshipValidator.fields,
    success: false
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
    const { success, errorMessage, data } = await zat(FELLOWSHIP.createOne, body, VERBS.POST);

    if (success) {
      setState((prevState) => {
        const updatedData = [data, ...prevState.data];

        return {
          ...prevState,
          data: updatedData,
          loading: false,
          success: true
        };
      });
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the fellowship.');
      return false;
    }
  }

  async function handleEdit(body, id, fields) {
    setState((prev) => ({ ...prev, loading: true }));
    const { success, errorMessage } = await zat(FELLOWSHIP.updateOne, body, VERBS.PUT, {
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
        ...fellowshipValidator.reset()
      },
      error: null,
      loading: false,
      success: false
    }));
  };

  const handleDelete = async (id) => {
    const { success, errorMessage } = await zat(FELLOWSHIP.removeOne, null, VERBS.DELETE, { id: id });

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
      handleError(errorMessage || 'Failed to delete the fellowship.');
      return false;
    }
  };

  const handleFetch = useCallback(async ({ pageIndex = 1, pageSize = 10, sortBy = [], searchQuery = '' }) => {
    setState((prev) => ({ ...prev, loading: true }));
    const {
      success,
      errorMessage,
      data = []
    } = await zat(FELLOWSHIP.fetch, null, VERBS.GET, { status: true, searchQuery, sortBy, action: 'getAll' });

    if (success) {
      setState((prev) => ({ ...prev, totalCount: data.length, data, loading: false }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the fellowship.');
      return false;
    }
  }, []);

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
    handleSelectedAddress
  };
};

export { useFellowship };
