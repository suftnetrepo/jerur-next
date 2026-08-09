import { useCallback, useEffect, useState } from 'react';
import { zat } from '../utils/api';
import { VERBS } from '../config';
import { ARTICLE } from '../utils/apiUrl';
import { articleUiValidator } from '../validator/rules';

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

const mapArticleToFields = (article = {}) => ({
  ...articleUiValidator.reset(),
  _id: article._id || '',
  title: article.title || '',
  summary: article.summary || '',
  content: article.content || '',
  status: article.status || 'draft',
  secure_url: article.secure_url || '',
  public_id: article.public_id || ''
});

const buildArticleFormData = (fields, file) => {
  const formData = new FormData();
  formData.append('title', fields.title);
  formData.append('summary', fields.summary);
  formData.append('content', fields.content);
  formData.append('status', fields.status || 'draft');
  if (file) {
    formData.append('file', file);
  }
  return formData;
};

const useArticle = ({ searchQuery, selectedStatus }) => {
  const [state, setState] = useState({
    data: [],
    fields: articleUiValidator.fields,
    selectedArticle: null,
    // articlesUsed mirrors kpis.totalArticles (an unfiltered count) - kept
    // as its own field so the "+ Add Article" button/limit copy don't
    // depend on the KPI cards being the ones that fetched it.
    articlesUsed: 0,
    kpis: {
      totalArticles: 0,
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
      fields: articleUiValidator.reset(),
      selectedArticle: null,
      success: false,
      error: null,
      detailsLoading: false
    }));
  }, []);

  const handleSelect = useCallback((article) => {
    setState((prevState) => ({
      ...prevState,
      selectedArticle: article,
      fields: mapArticleToFields(article),
      success: false,
      error: null,
      detailsLoading: false
    }));
  }, []);

  const handleFetchKpis = useCallback(async () => {
    try {
      // Same trick as useSermon's KPI cards: no dedicated aggregation
      // endpoint, just the existing list endpoint called with different
      // status filters and limit=1, reading totalCount off each response.
      const [totalResponse, publishedResponse, draftResponse] = await Promise.all([
        zat(ARTICLE.fetch, null, VERBS.GET, { page: 1, limit: 1 }),
        zat(ARTICLE.fetch, null, VERBS.GET, { page: 1, limit: 1, status: 'published' }),
        zat(ARTICLE.fetch, null, VERBS.GET, { page: 1, limit: 1, status: 'draft' })
      ]);

      setState((prevState) => ({
        ...prevState,
        kpis: {
          totalArticles: totalResponse.totalCount || 0,
          published: publishedResponse.totalCount || 0,
          drafts: draftResponse.totalCount || 0
        },
        articlesUsed: totalResponse.totalCount || 0
      }));
    } catch (error) {
      console.warn('Unable to fetch article KPIs.', error);
    }
  }, []);

  const handleFetch = useCallback(async ({ pageIndex = 1, pageSize = 10, sortBy = [] } = {}) => {
    setState((prevState) => ({ ...prevState, loading: true, error: null }));
    const sortField = sortBy.length > 0 ? sortBy[0].id : 'createdAt';
    const sortOrder = sortBy.length > 0 ? (sortBy[0].desc ? 'desc' : 'asc') : 'desc';
    const normalizedPageIndex = normalizePageIndex(pageIndex);

    try {
      const { data, success, errorMessage, totalCount } = await zat(ARTICLE.fetch, null, VERBS.GET, {
        page: normalizedPageIndex,
        limit: pageSize,
        sortField,
        sortOrder,
        ...(searchQuery ? { search: searchQuery } : {}),
        ...(selectedStatus && selectedStatus !== 'ALL' ? { status: selectedStatus } : {})
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

      handleError(errorMessage || 'Failed to fetch articles.');
      return false;
    } catch (error) {
      handleError('An unexpected error occurred while fetching articles.');
      return false;
    }
  }, [searchQuery, selectedStatus]);

  const handleFetchOne = useCallback(async (id) => {
    if (!id) {
      return false;
    }

    setState((prevState) => ({ ...prevState, detailsLoading: true, error: null }));

    try {
      const { data, success, errorMessage } = await zat(ARTICLE.fetch, null, VERBS.GET, {
        action: 'getById',
        id
      });

      if (success && data) {
        handleSelect(data);
        return true;
      }

      handleError(errorMessage || 'Failed to fetch article.');
      return false;
    } catch (error) {
      handleError('An unexpected error occurred while fetching article.');
      return false;
    }
  }, [handleSelect]);

  const refreshListAndKpis = useCallback(async () => {
    await Promise.all([
      handleFetch(state.tableQuery),
      handleFetchKpis()
    ]);
  }, [handleFetch, handleFetchKpis, state.tableQuery]);

  const handleSave = useCallback(async (fields, file) => {
    setState((prevState) => ({ ...prevState, loading: true, error: null }));

    const payload = buildArticleFormData(fields, file);
    const { success, errorMessage, data } = await zat(ARTICLE.createOne, payload, VERBS.POST);

    if (success) {
      setState((prevState) => ({
        ...prevState,
        selectedArticle: data || null,
        fields: mapArticleToFields(data || fields),
        loading: false,
        success: true
      }));
      await refreshListAndKpis();
      return true;
    }

    handleError(errorMessage || 'Failed to create article.');
    return false;
  }, [refreshListAndKpis]);

  const handleEdit = useCallback(async (fields, id, file) => {
    setState((prevState) => ({ ...prevState, loading: true, error: null }));

    const payload = buildArticleFormData(fields, file);
    const { success, errorMessage, data } = await zat(ARTICLE.updateOne, payload, VERBS.PUT, { id });

    if (success) {
      setState((prevState) => ({
        ...prevState,
        selectedArticle: data || prevState.selectedArticle,
        fields: mapArticleToFields(data || fields),
        loading: false,
        success: true
      }));
      await refreshListAndKpis();
      return true;
    }

    handleError(errorMessage || 'Failed to update article.');
    return false;
  }, [refreshListAndKpis]);

  const handleDelete = useCallback(async (id) => {
    setState((prevState) => ({ ...prevState, loading: true, error: null }));

    const { success, errorMessage } = await zat(ARTICLE.removeOne, null, VERBS.DELETE, { id });

    if (success) {
      setState((prevState) => ({
        ...prevState,
        loading: false,
        selectedArticle: prevState.selectedArticle?._id === id ? null : prevState.selectedArticle,
        success: false
      }));
      await refreshListAndKpis();
      return true;
    }

    handleError(errorMessage || 'Failed to delete article.');
    return false;
  }, [refreshListAndKpis]);

  const handleClearSelectedArticle = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      selectedArticle: null,
      detailsLoading: false
    }));
  }, []);

  useEffect(() => {
    handleFetchKpis();
  }, [handleFetchKpis]);

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
    handleClearSelectedArticle
  };
};

export { useArticle };
