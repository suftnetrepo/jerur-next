import { useCallback, useState } from 'react';
import { zat } from '../utils/api';
import { VERBS } from '../config';
import { ADDRESS } from '../utils/apiUrl';
import { addressValidator } from '../validator/rules';

const useAddress = () => {
  const [state, setState] = useState({
    data: [],
    loading: false,
    error: null,
    totalCount: 0,
    fields: addressValidator.fields,
    rules : addressValidator.rules,
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
      error: null,
      success: false,
      fields: {
        ...prevState.fields,
        [name]: value
      }
    }));
  };

  const handleSelect = useCallback((body) => {
    setState((prevState) => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        ...body
      },
      error: null,
      success: false,
      loading: false
    }));
  }, []);

  async function handleSave(body) {
    setState((prev) => ({ ...prev, loading: true, error: null, success: false }));
    const { success, errorMessage, data } = await zat(ADDRESS.url, body, VERBS.POST);

    if (success) {
      setState((prev) => ({
        ...prev,
        fields: { ...prev.fields, ...(data || {}) },
        loading: false,
        error: null,
        success: true
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the address.');
      return false;
    }
  }

  async function handleEdit(body) {
    setState((prev) => ({ ...prev, loading: true, error: null, success: false }));
    const { success, errorMessage, data } = await zat(ADDRESS.url, body, VERBS.PUT);

    if (success) {
      setState((prev) => ({
        ...prev,
        fields: { ...prev.fields, ...(data || {}) },
        loading: false,
        error: null,
        success: true
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the address.');
      return false;
    }
  }

  const handleReset = () => {
    setState((prevState) => ({
      ...prevState,
      fields: {
        ...addressValidator.reset()
      },
      error: null,
      loading: false,
      success: false
    }));
  };

  const handleStatusReset = () => {
    setState((prevState) => ({
      ...prevState,
      error: null,
      success: false
    }));
  };

  const handleSelectedAddress = (selectedAddress) => {
    setState((prev) => ({
      ...prev,
      error: null,
      success: false,
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

  return {
    ...state,
    handleChange,
    handleSelect,
    handleSave,
    handleEdit,
    handleReset,
    handleStatusReset,
    handleSelectedAddress
  };
};

export { useAddress };
