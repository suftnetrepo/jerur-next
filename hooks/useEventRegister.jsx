import { useState } from 'react';
import { zat } from '../utils/api';
import { VERBS } from '../config';
import { EVENT_REGISTER } from '../utils/apiUrl';
import { registerValidator } from '@/validator/rules';

const useEventRegister = () => {
  const [state, setState] = useState({
    data: [],
    loading: false,
    error: null,
    fields: registerValidator.fields,
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

  async function handleSave(body) {
    setState((prev) => ({ ...prev, loading: true }));
    const { success, errorMessage, data } = await zat(EVENT_REGISTER.createOne, body, VERBS.POST);

    if (success) {
      setState((prevState) => {
        return {
          ...prevState,
          data: [data, ...prevState.data],
          loading: false,
          success: true
        };
      });
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the event register.');
      return false;
    }
  }

  const handleReset = () => {
    setState((prevState) => ({
      ...prevState,
      fields: {
        ...registerValidator.reset()
      },
      error: null,
      loading: false,
      success: false
    }));
  };

  const handleDelete = async (id, eventId) => {
    const { success, errorMessage } = await zat(EVENT_REGISTER.removeOne, null, VERBS.DELETE, {
      id: id,
      eventId
    });

    if (success) {
      setState((prevState) => ({
        ...prevState,
        data: prevState.data.filter((j) => j._id !== id),

        loading: false
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to delete the event register.');
      return false;
    }
  };

  const handleFetch = async (id) => {
    setState((prev) => ({ ...prev, loading: true }));
    const {
      success,
      errorMessage,
      data = []
    } = await zat(EVENT_REGISTER.fetch, null, VERBS.GET, {
      id
    });

    if (success) {
      setState((prev) => ({ ...prev, data: data, loading: false }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the event register.');
      return false;
    }
  };

  return {
    ...state,
    handleChange,
    handleSave,
    handleDelete,
    handleReset,
    handleFetch
  };
};

export { useEventRegister };
