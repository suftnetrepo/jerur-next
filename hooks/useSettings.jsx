'use client';

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { zat } from '../utils/api';
import { bzat } from '../utils/axios';
import { VERBS } from '../config';
import { CHURCH, USER, SEED_DATA } from '../utils/apiUrl';
import { churchValidator, pastorValidator, propheticValidator, bankTransferValidator, socialMediaValidator, featuresValidator, configValidator } from '@/validator/rules';
import { FEATURES } from '@/utils/helpers';

const useSettings = () => {
  const [state, setState] = useState({
    data: {},
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
    const { data, success, errorMessage } = await bzat(CHURCH.fetchOne, null, VERBS.GET, null, { 'nj-api-key': '3054b88110ed6df272d3189b1db8af58:07a83a26131d54f028cac57e9a24ba2927ab94927f670d98d0d18edccc351080'});

    if (success) {
      setState((prevState) => ({
        ...prevState,
        data,
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

    const handleSeeds = async () => {
    const { success, errorMessage } = await zat(SEED_DATA.fetch, null, VERBS.GET);

    if (success) {
    } else {
      handleError(errorMessage || 'Failed to fetch the settings.');
    }
  };

  const handleSave = async (body) => {
    setState((prev) => ({ ...prev, loading: true, success: false }));
    const { success, errorMessage } = await zat(CHURCH.uploadOne, body, VERBS.PUT, {
      action: 'one'
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
  };

  const handleSaveChangePassword = async (body) => {
    setState((prev) => ({ ...prev, loading: true, success: false, error: null }));
    const { success, errorMessage } = await zat(USER.changePassword, body, VERBS.PUT, { action: 'change_password' });

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
  };

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
    handleSaveChangePassword,
    handleSeeds
  };
};

const usePastor = () => {
  const [state, setState] = useState({
    data: {},
    loading: false,
    fields: pastorValidator.fields,
    error: null,
    success: false,
    rules: pastorValidator.rules
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
    setState((prevState) => ({
      ...prevState,
      fields: {
        ...prevState.fields,
       ...data
      }
    }));
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

  const handleUpdate = async (body) => {
    setState((prev) => ({ ...prev, loading: true, success: false }));
    const { success, errorMessage } = await zat(CHURCH.uploadPastor, body, VERBS.PUT);

    if (success) {
      setState((prevState) => ({
        ...prevState,
        success: true,
        loading: false
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the pastor.');
      return false;
    }
  };

  return {
    ...state,
    handleReset,
    handleSelect,
    handleChange,
    handleUpdate
  };
};

const useProphetic = () => {
  const [state, setState] = useState({
    data: {},
    loading: false,
    fields: propheticValidator.fields,
    error: null,
    success: false,
    rules: propheticValidator.rules
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
    setState((prevState) => ({
      ...prevState,
      fields: {
        ...prevState.fields,
       ...data
      }
    }));
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

  const handleUpdate = async (body) => {
    setState((prev) => ({ ...prev, loading: true, success: false }));
    const { success, errorMessage } = await zat(CHURCH.uploadProphetic, body, VERBS.PUT);

    if (success) {
      setState((prevState) => ({
        ...prevState,
        success: true,
        loading: false
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the prophetic.');
      return false;
    }
  };

  return {
    ...state,
    handleReset,
    handleSelect,
    handleChange,
    handleUpdate
  };
};

const useBankTransfer = () => {
  const [state, setState] = useState({
    data: {},
    loading: false,
    fields: bankTransferValidator.fields,
    error: null,
    success: false,
    rules: bankTransferValidator.rules
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
    const { sort_code, account_number, bank_name, reference } = data;
    setState((prevState) => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        sort_code,
        account_number,
        bank_name,
        reference
      }
    }));
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

  const handleSave = async (body) => {
    setState((prev) => ({ ...prev, loading: true, success: false }));
    const { success, errorMessage } = await zat(CHURCH.uploadOne, body, VERBS.PUT, {
      action: 'bulk'
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
  };

  return {
    ...state,
    handleReset,
    handleSelect,
    handleChange,
    handleSave
  };
};

const useSocialMedia = () => {
  const [state, setState] = useState({
    data: {},
    loading: false,
    fields: socialMediaValidator.fields,
    error: null,
    success: false,
    rules: socialMediaValidator.rules
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
    const { instagram_url, youtube_url, facebook_url } = data;
    setState((prevState) => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        instagram_url,
        youtube_url,
        facebook_url
      }
    }));
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

  const handleSave = async (body) => {
    setState((prev) => ({ ...prev, loading: true, success: false }));
    const { success, errorMessage } = await zat(CHURCH.uploadOne, body, VERBS.PUT, {
      action: 'bulk'
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
  };

  return {
    ...state,
    handleReset,
    handleSelect,
    handleChange,
    handleSave
  };
};

const useFeatures = () => {
  const [state, setState] = useState({
    data: FEATURES || [],
    loading: false,
    fields: featuresValidator.fields,
    error: null,
    success: false,
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

  const handleSelect = (features) => {
    setState((prevState) => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        features
      }
    }));
  };

  const handleError = (error) => {
    setState((pre) => {
      return { ...pre, error: error, loading: false };
    });
  };

  const handleReset = () => {
    setState((pre) => {
      return { ...pre, data: FEATURES, error: null };
    });
  };

  const handleSave = async (body) => {
    setState((prev) => ({ ...prev, loading: true, success: false }));
    const { success, errorMessage } = await zat(CHURCH.uploadOne, body, VERBS.PUT, {
      action: 'bulk'
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
  };

  return {
    ...state,
    handleReset,
    handleSelect,
    handleChange,
    handleSave
  };
};

const useConfig = () => {
  const [state, setState] = useState({
    data: {},
    loading: false,
    fields: configValidator.fields,
    error: null,
    success: false,
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
    const { currency,prayer_request_email, giving_url,isSearchable}= data
    setState((prevState) => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        currency,prayer_request_email, giving_url,isSearchable
      }
    }));
  };

  const handleError = (error) => {
    setState((pre) => {
      return { ...pre, error: error, loading: false };
    });
  };

  const handleReset = () => {
    setState((pre) => {
      return { ...pre, data: FEATURES, error: null };
    });
  };

  const handleSave = async (body) => {
    setState((prev) => ({ ...prev, loading: true, success: false }));
    const { success, errorMessage } = await zat(CHURCH.uploadOne, body, VERBS.PUT, {
      action: 'bulk'
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
  };

  return {
    ...state,
    handleReset,
    handleSelect,
    handleChange,
    handleSave
  };
};

export const single = async (id) => {
  const { data, success, errorMessage } = await zat(CHURCH.single, null, VERBS.GET, {
    id
  });
  if (success) {
    return data;
  } else {
   // throw new Error(errorMessage);
  }
}

export { usePastor, useProphetic, useSettings,useConfig, useBankTransfer, useSocialMedia, useFeatures };
