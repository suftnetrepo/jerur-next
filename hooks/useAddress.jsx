import { useState } from 'react';
import { zat } from '../utils/api';
import { VERBS } from '../config';
import { ADDRESS } from '../utils/apiUrl';
import { addressValidator } from '@/validator/rules';

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
    console.log(".............................body", body)
    setState((prev) => ({ ...prev, loading: true }));
    const { success, errorMessage } = await zat(ADDRESS.url, body, VERBS.POST);

    if (success) {
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the address.');
      return false;
    }
  }

  async function handleEdit(body, id) {
    setState((prev) => ({ ...prev, loading: true }));
    const { success, errorMessage } = await zat(ADDRESS.url, body, VERBS.PUT, {
      id: id
    });

    if (success) {

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

  return {
    ...state,
    handleChange,
    handleSelect,
    handleSave,
    handleEdit,
    handleReset,
    handleSelectedAddress
  };
};

export { useAddress };
