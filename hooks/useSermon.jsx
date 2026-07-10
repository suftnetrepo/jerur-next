import { useCallback, useEffect, useState } from 'react';
import { zat } from '../utils/api';
import { VERBS } from '../config';
import { REGULAR_SERVICE, SERMON } from '../utils/apiUrl';
import { sermonUiValidator } from '../validator/rules';

const normalizePageIndex = (pageIndex) => (pageIndex === 0 ? 1 : pageIndex);

const areSortRulesEqual = (left = [], right = []) => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((rule, index) => {
    const otherRule = right[index];
    return rule?.id === otherRule?.id && rule?.desc === otherRule?.desc;
  });
};

const buildDateRange = (value) => {
  if (!value) {
    return {};
  }

  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return {};
  }

  const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
  const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  };
};

const buildCurrentMonthRange = () => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

  return {
    startDate: startDate.toISOString(),
    endDate: now.toISOString()
  };
};

const mapSermonToFields = (sermon = {}) => ({
  ...sermonUiValidator.reset(),
  _id: sermon._id || '',
  title: sermon.title || '',
  speakerName: sermon.speakerName || '',
  serviceId: sermon.serviceId?._id || sermon.serviceId || '',
  preachedAt: sermon.preachedAt ? new Date(sermon.preachedAt).toISOString().slice(0, 10) : '',
  durationMinutes: sermon.durationMinutes ?? '',
  status: sermon.status || 'DRAFT',
  summary: sermon.summary || '',
  youtubeUrl: sermon.media?.youtubeUrl || '',
  audioUrl: sermon.media?.audioUrl || '',
  videoUrl: sermon.media?.videoUrl || '',
  thumbnail: sermon.media?.thumbnail || ''
});

const serializeFields = (fields) => ({
  title: fields.title,
  speakerName: fields.speakerName,
  serviceId: fields.serviceId,
  preachedAt: fields.preachedAt ? new Date(fields.preachedAt).toISOString() : '',
  ...(fields.durationMinutes !== '' ? { durationMinutes: Number(fields.durationMinutes) } : {}),
  status: fields.status,
  summary: fields.summary,
  media: {
    youtubeUrl: fields.youtubeUrl,
    audioUrl: fields.audioUrl,
    videoUrl: fields.videoUrl,
    thumbnail: fields.thumbnail
  }
});

const useSermon = ({ searchQuery, selectedSpeaker, selectedStatus, selectedDate }) => {
  const [state, setState] = useState({
    data: [],
    fields: sermonUiValidator.fields,
    selectedSermon: null,
    serviceOptions: [],
    kpis: {
      totalSermons: 0,
      thisMonth: 0,
      published: 0,
      drafts: 0
    },
    loading: false,
    detailsLoading: false,
    success: false,
    error: null,
    totalCount: 0,
    tableQuery: {
      pageIndex: 1,
      pageSize: 10,
      sortBy: []
    }
  });

  const handleError = (error) => {
    setState((prevState) => ({
      ...prevState,
      error,
      loading: false,
      detailsLoading: false,
      success: false
    }));
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

  const handleReset = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      fields: sermonUiValidator.reset(),
      selectedSermon: null,
      success: false,
      error: null,
      detailsLoading: false
    }));
  }, []);

  const handleSelect = useCallback((sermon) => {
    setState((prevState) => ({
      ...prevState,
      selectedSermon: sermon,
      fields: mapSermonToFields(sermon),
      success: false,
      error: null,
      detailsLoading: false
    }));
  }, []);

  const handleFetchOptions = useCallback(async () => {
    try {
      const serviceResponse = await zat(REGULAR_SERVICE.fetch, null, VERBS.GET, {
        action: 'paginate',
        page: 1,
        limit: 100
      });

      setState((prevState) => ({
        ...prevState,
        serviceOptions: serviceResponse.success ? serviceResponse.data || [] : prevState.serviceOptions
      }));
    } catch (error) {
      console.warn('Unable to fetch sermon options.', error);
    }
  }, []);

  const handleFetchKpis = useCallback(async () => {
    try {
      const monthRange = buildCurrentMonthRange();
      const [totalResponse, monthResponse, publishedResponse, draftResponse] = await Promise.all([
        zat(SERMON.fetch, null, VERBS.GET, { page: 1, limit: 1 }),
        zat(SERMON.fetch, null, VERBS.GET, { page: 1, limit: 1, ...monthRange }),
        zat(SERMON.fetch, null, VERBS.GET, { page: 1, limit: 1, status: 'PUBLISHED' }),
        zat(SERMON.fetch, null, VERBS.GET, { page: 1, limit: 1, status: 'DRAFT' })
      ]);

      setState((prevState) => ({
        ...prevState,
        kpis: {
          totalSermons: totalResponse.totalCount || 0,
          thisMonth: monthResponse.totalCount || 0,
          published: publishedResponse.totalCount || 0,
          drafts: draftResponse.totalCount || 0
        }
      }));
    } catch (error) {
      console.warn('Unable to fetch sermon KPIs.', error);
    }
  }, []);

  const handleFetch = useCallback(async ({ pageIndex = 1, pageSize = 10, sortBy = [] } = {}) => {
    setState((prevState) => ({ ...prevState, loading: true, error: null }));
    const sortField = sortBy.length > 0 ? sortBy[0].id : 'preachedAt';
    const sortOrder = sortBy.length > 0 ? (sortBy[0].desc ? 'desc' : 'asc') : 'desc';
    const normalizedPageIndex = normalizePageIndex(pageIndex);

    try {
      const dateRange = buildDateRange(selectedDate);
      const { data, success, errorMessage, totalCount } = await zat(SERMON.fetch, null, VERBS.GET, {
        page: normalizedPageIndex,
        limit: pageSize,
        sortField,
        sortOrder,
        ...(searchQuery ? { search: searchQuery } : {}),
        ...(selectedSpeaker ? { speakerName: selectedSpeaker } : {}),
        ...(selectedStatus && selectedStatus !== 'ALL' ? { status: selectedStatus } : {}),
        ...dateRange
      });

      if (success) {
        setState((prevState) => ({
          ...prevState,
          data: data || [],
          totalCount: totalCount || 0,
          loading: false,
          tableQuery:
            prevState.tableQuery.pageIndex === normalizedPageIndex
            && prevState.tableQuery.pageSize === pageSize
            && areSortRulesEqual(prevState.tableQuery.sortBy, sortBy)
              ? prevState.tableQuery
              : {
                pageIndex: normalizedPageIndex,
                pageSize,
                sortBy
              }
        }));
        return true;
      }

      handleError(errorMessage || 'Failed to fetch sermons.');
      return false;
    } catch (error) {
      handleError('An unexpected error occurred while fetching sermons.');
      return false;
    }
  }, [searchQuery, selectedDate, selectedSpeaker, selectedStatus]);

  const handleFetchOne = useCallback(async (id) => {
    if (!id) {
      return false;
    }

    setState((prevState) => ({ ...prevState, detailsLoading: true, error: null }));

    try {
      const { data, success, errorMessage } = await zat(SERMON.fetch, null, VERBS.GET, {
        action: 'getById',
        id
      });

      if (success && data) {
        handleSelect(data);
        return true;
      }

      handleError(errorMessage || 'Failed to fetch sermon.');
      return false;
    } catch (error) {
      handleError('An unexpected error occurred while fetching sermon.');
      return false;
    }
  }, [handleSelect]);

  const refreshListAndKpis = useCallback(async () => {
    await Promise.all([
      handleFetch(state.tableQuery),
      handleFetchKpis(),
      handleFetchOptions()
    ]);
  }, [handleFetch, handleFetchKpis, handleFetchOptions, state.tableQuery]);

  const handleSave = useCallback(async (fields) => {
    setState((prevState) => ({ ...prevState, loading: true, error: null }));

    const payload = serializeFields(fields);
    const { success, errorMessage, data } = await zat(SERMON.createOne, payload, VERBS.POST);

    if (success) {
      setState((prevState) => ({
        ...prevState,
        selectedSermon: data || null,
        fields: mapSermonToFields(data || fields),
        loading: false,
        success: true
      }));
      await refreshListAndKpis();
      return true;
    }

    handleError(errorMessage || 'Failed to create sermon.');
    return false;
  }, [refreshListAndKpis]);

  const handleEdit = useCallback(async (fields, id) => {
    setState((prevState) => ({ ...prevState, loading: true, error: null }));

    const payload = serializeFields(fields);
    const { success, errorMessage, data } = await zat(SERMON.updateOne, payload, VERBS.PUT, { id });

    if (success) {
      setState((prevState) => ({
        ...prevState,
        selectedSermon: data || prevState.selectedSermon,
        fields: mapSermonToFields(data || fields),
        loading: false,
        success: true
      }));
      await refreshListAndKpis();
      return true;
    }

    handleError(errorMessage || 'Failed to update sermon.');
    return false;
  }, [refreshListAndKpis]);

  const handleDelete = useCallback(async (id) => {
    setState((prevState) => ({ ...prevState, loading: true, error: null }));

    const { success, errorMessage } = await zat(SERMON.removeOne, null, VERBS.DELETE, { id });

    if (success) {
      setState((prevState) => ({
        ...prevState,
        loading: false,
        selectedSermon: prevState.selectedSermon?._id === id ? null : prevState.selectedSermon,
        success: false
      }));
      await refreshListAndKpis();
      return true;
    }

    handleError(errorMessage || 'Failed to delete sermon.');
    return false;
  }, [refreshListAndKpis]);

  const handleClearSelectedSermon = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      selectedSermon: null,
      detailsLoading: false
    }));
  }, []);

  useEffect(() => {
    handleFetchOptions();
    handleFetchKpis();
  }, [handleFetchKpis, handleFetchOptions]);

  return {
    ...state,
    handleFetch,
    handleFetchOne,
    handleSelect,
    handleSave,
    handleEdit,
    handleDelete,
    handleReset,
    handleChange,
    handleClearSelectedSermon
  };
};

export { useSermon };