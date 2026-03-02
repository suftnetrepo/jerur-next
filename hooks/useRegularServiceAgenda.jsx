import { useState } from 'react';
import { zat } from '../utils/api';
import { VERBS } from '../config';
import { REGULAR_SERVICE_AGENDA } from '../utils/apiUrl';
import { regularAgendaValidator } from '../validator/rules';

const useRegularServiceAgenda = () => {
  const [state, setState] = useState({
    data: [],
    loading: false,
    error: null,
    fields: regularAgendaValidator.fields,
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
    const { success, errorMessage, data } = await zat(REGULAR_SERVICE_AGENDA.createOne, body, VERBS.POST);

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
      handleError(errorMessage || 'Failed to update the service agenda.');
      return false;
    }
  }

  async function handleEdit(body, id, fields) {
    const { success, errorMessage } = await zat(REGULAR_SERVICE_AGENDA.updateOne, body, VERBS.PUT, {
      id: id
    });

    if (success) {
      setState((prev) => ({
        ...prev,
        data: prev.data
          .map((j) => (j._id === id ? fields : j))
          .sort((a, b) => Number(a.sequency_no) - Number(b.sequency_no)),
        success: true,
        loading: false
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the service agenda.');
      return false;
    }
  }

  const handleReset = () => {
    setState((prevState) => ({
      ...prevState,
      fields: {
        ...regularAgendaValidator.reset()
      },
      error: null,
      loading: false,
      success: false
    }));
  };

  const handleDelete = async (id, serviceId) => {
    const { success, errorMessage } = await zat(REGULAR_SERVICE_AGENDA.removeOne, null, VERBS.DELETE, {
      id: id,
      serviceId: serviceId
    });

    if (success) {
      setState((prevState) => ({
        ...prevState,
        data: prevState.data.filter((j) => j._id !== id),

        loading: false
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to delete the service agenda.');
      return false;
    }
  };

  const handleFetch = async (id) => {
    setState((prev) => ({ ...prev, loading: true }));
    const {
      success,
      errorMessage,
      data = []
    } = await zat(REGULAR_SERVICE_AGENDA.fetch, null, VERBS.GET, {
      id
    });

    if (success) {
      const sorted = data.sort((a, b) => a.sequency_no - b.sequency_no);
      setState((prev) => ({ ...prev, data: sorted, loading: false }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the service agenda.');
      return false;
    }
  };

  return {
    ...state,
    handleChange,
    handleSelect,
    handleSave,
    handleEdit,
    handleDelete,
    handleReset,
    handleFetch
  };
};

export { useRegularServiceAgenda };
