/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { zat } from '../utils/api';
import { VERBS } from '../config';
import { CHURCH, USER } from '../utils/apiUrl';
import { churchValidator } from '@/validator/rules';

const useSettings = () => {
  const [state, setState] = useState({
    data: [],
    loading: false,
    fields: churchValidator.fields,
    error: null,
    success: false,
    rules: churchValidator.rules
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

  const handleFetch = async () => {
    const { data, success, errorMessage } = await zat(CHURCH.fetchOne, null, VERBS.GET ,{
      action:"one"
    });

    if (success) {
      setState((prevState) => ({
        ...prevState,
        fields: {
          ...prevState.fields,
          ...data          
        },
        loading: false
      }));
    } else {
      handleError(errorMessage || 'Failed to fetch the settings.');
    }
  };

  const handleSave = async (body)=> {
    setState((prev) => ({ ...prev, loading: true, success : false }));
    const { success, errorMessage } = await zat(CHURCH.uploadOne, body, VERBS.PUT, {
      action:'one'
    });

    if (success) {
      setState((prevState) => ({
        ...prevState,
        success: true,
        loading: false
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the settings.');
      return false;
    }
  }

  const handleSaveChangePassword = async (body) => {
    setState((prev) => ({ ...prev, loading: true, success: false, error : null }));
    const { success, errorMessage } = await zat(USER.changePassword, body, VERBS.PUT, { action:'change_password' });

    if (success) {
      setState((prevState) => ({
        ...prevState,
        success: true,
        loading: false
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the settings.');
      return false;
    }
  }

  useEffect(() => {
    handleFetch();
  }, []);

  return {
    ...state,  
    handleFetch,  
    handleReset,
    handleSelect,
    handleChange,
    handleSave,
    handleSaveChangePassword
  };
};

export { useSettings };
