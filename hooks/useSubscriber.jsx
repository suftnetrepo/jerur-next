import React, { useState, useEffect, useCallback } from 'react';
import { VERBS } from '../config';
import { STRIPE, SUBSCRIBER } from '../utils/apiUrl';
import { zat } from '../utils/api';
import { pricingList, findPrice } from '../src/data/pricing';

const useSubscriber = (priceId) => {
  const [state, setState] = useState({
    customer: {},
    subscription: {},
    portalSession:{},
    loading: false,
    error: null,
    success: false,
    pricing: {}
  });

  const handlePricing = (priceId) => {
    const isLive = process.env.NEXT_PUBLIC_ENV === 'production' || process.env.NODE_ENV === 'production';
    const plan = findPrice(priceId, isLive);
    setState((pre) => {
      return { ...pre, pricing: plan };
    });
  };

  const handleErrorReset = () => {
    setState((pre) => {
      return { ...pre, error: null };
    });
  };

  const handleError = (error) => {
    setState((pre) => {
      return { ...pre, error: error, loading: false };
    });
  };

  const handleSpinner = () => {
    setState((pre) => {
      return { ...pre, loading: true };
    });
  };

  const handleSuccess = async (body) => {
    handleSpinner();
    const { success, errorMessage, data } = await zat(SUBSCRIBER.createIntegrator, body, VERBS.POST);

    if (success) {
      setState((prevState) => ({
        ...prevState,
        data: data,
        loading: false
      }));
      return data;
    } else {
      handleError(errorMessage || 'Failed to create user.');
      return false;
    }
  };

  async function handleNewCustomer(body) {
    handleSpinner();
    const { success, errorMessage, data } = await zat(STRIPE.createCustomer, body, VERBS.POST);

    if (success) {
      setState((prevState) => ({
        ...prevState,
        customer: data,
        loading: false
      }));
      return data;
    } else {
      handleError(errorMessage || 'Failed to update the user.');
      return false;
    }
  }

  async function handleNewSubscriber(body) {
    handleSpinner();
    const { success, errorMessage, data } = await zat(STRIPE.createSubscriber, body, VERBS.POST);

    if (success) {
      setState((prevState) => ({
        ...prevState,
        subscription: {
          ...data
        },
        loading: false
      }));
      return data;
    } else {
      handleError(errorMessage || 'Failed to update the user.');
      return false;
    }
  }

  async function handleCustomerPortalSession(body) {   
    const { success, errorMessage, data } = await zat(STRIPE.createCustomerPortalSession, body, VERBS.POST);

    if (success) {
      setState((prevState) => ({
        ...prevState,
        portalSession: data,
        loading: false
      }));
      return data;
    } else {
      handleError(errorMessage || 'Failed to update the user.');
      return false;
    }
  }

  const handleVerifySubscriptionStatus = useCallback(async (stripeCustomerId) => {
    const { success, errorMessage, data } = await zat(STRIPE.verifySubscriptionStatus, null, VERBS.GET , {
      stripeCustomerId: stripeCustomerId
    });

    if (success) {
      return data;
    } else {
      setState((previous) => ({
        ...previous,
        error: errorMessage || 'Failed to verify subscription status.',
        loading: false
      }));
      return false;
    }
  }, []);

  useEffect(() => {
    handlePricing(priceId);
  }, [priceId]);

  return {
    ...state,
    handleVerifySubscriptionStatus,
    handleNewCustomer,
    handleNewSubscriber,
    handleError,
    handleErrorReset,
    handleSuccess,
    handleCustomerPortalSession
   };
};



export { useSubscriber };
