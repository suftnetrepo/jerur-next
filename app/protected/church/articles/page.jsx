'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Badge, Button, Card, Form } from 'react-bootstrap';
import Tooltip from '@mui/material/Tooltip';
import { TiEdit } from 'react-icons/ti';
import { MdDelete } from 'react-icons/md';
import { BsFileEarmarkText, BsCheck2Circle, BsPencilSquare } from 'react-icons/bs';
import { Table } from '../../../../src/components/elements/table/table';
import DeleteConfirmation from '../../../../src/components/elements/ConfirmDialogue';
import ErrorDialogue from '../../../../src/components/elements/errorDialogue';
import useDebounce from '../../../../hooks/useDebounce';
import { useArticle } from '../../../../hooks/useArticle';
import RenderArticleOffcanvas from './renderOffcanvas';
import { MAX_ARTICLES_PER_CHURCH } from '../../../../constants/articles';

const statusVariant = {
  draft: 'secondary',
  published: 'success'
};

const capitalize = (value) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value);

const kpiCards = [
  { key: 'totalArticles', label: 'Total Articles', tone: 'info', icon: BsFileEarmarkText },
  { key: 'published', label: 'Published', tone: 'success', icon: BsCheck2Circle },
  { key: 'drafts', label: 'Draft', tone: 'warning', icon: BsPencilSquare }
];

const formatDate = (value) => {
  if (!value) {
    return 'Not published';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));
};

const Page = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showDrawer, setShowDrawer] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const {
    data,
    error,
    fields,
    success,
    loading,
    detailsLoading,
    totalCount,
    selectedArticle,
    articlesUsed,
    kpis,
    handleFetch,
    handleDelete,
    handleFetchOne,
    handleSave,
    handleEdit,
    handleReset,
    handleChange,
    handleClearSelectedArticle
  } = useArticle({
    searchQuery: debouncedSearchQuery,
    selectedStatus
  });

  const limitReached = articlesUsed >= MAX_ARTICLES_PER_CHURCH;

  const handleClose = useCallback(() => {
    handleReset();
    handleClearSelectedArticle();
    setShowDrawer(false);
  }, [handleClearSelectedArticle, handleReset]);

  const handleOpenCreate = useCallback(() => {
    if (limitReached) {
      return;
    }
    handleReset();
    handleClearSelectedArticle();
    setShowDrawer(true);
  }, [handleClearSelectedArticle, handleReset, limitReached]);

  const handleOpenEdit = useCallback(async (id) => {
    setShowDrawer(true);
    await handleFetchOne(id);
  }, [handleFetchOne]);

  const columns = useMemo(() => [
    {
      Header: 'Image',
      accessor: 'secure_url',
      disableSortBy: true,
      Cell: ({ value }) => (
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: '#eee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {value ? (
            <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <BsFileEarmarkText className="text-muted" />
          )}
        </div>
      )
    },
    {
      Header: 'Title',
      accessor: 'title',
      Cell: ({ value }) => <span className="fw-semibold">{value}</span>
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ value }) => <Badge bg={statusVariant[value] || 'secondary'}>{capitalize(value)}</Badge>
    },
    {
      Header: 'Published Date',
      accessor: 'publishedAt',
      Cell: ({ value }) => <span>{formatDate(value)}</span>
    },
    {
      Header: 'Actions',
      disableSortBy: true,
      headerClassName: 'text-center actions-header',
      className: 'text-center actions-cell',
      Cell: ({ row }) => (
        <div className="d-flex justify-content-center align-items-center">
          <Tooltip title="Edit Article" arrow>
            <span className="p-0">
              <TiEdit size={30} className="pointer me-2" onClick={() => handleOpenEdit(row.original._id)} />
            </span>
          </Tooltip>
          <Tooltip title="Delete Article" arrow>
            <span className="p-0">
              <DeleteConfirmation
                onConfirm={async (id) => {
                  await handleDelete(id);
                }}
                onCancel={() => {}}
                itemId={row.original._id}
              >
                <MdDelete size={28} className="pointer" />
              </DeleteConfirmation>
            </span>
          </Tooltip>
        </div>
      )
    }
  ], [handleDelete, handleOpenEdit]);

  return (
    <>
      <div className={`ms-5 me-5 mt-2 ${!loading ? 'overlay__block' : null}`}>
        <div className="card-body">
          <h5 className="card-title ms-2 mb-3">Articles</h5>

          <div className="row mb-4">
            {kpiCards.map((card) => {
              const Icon = card.icon;

              return (
                <div className="col-sm-6 col-lg-4" key={card.key}>
                  <Card className="py-3 px-3 h-100">
                    <Card.Body>
                      <div className="d-flex gap-3 flex-wrap align-items-top justify-content-between">
                        <div className="flex-fill d-flex align-items-top mb-4 mb-sm-0">
                          <div className="me-3">
                            <span className={`avatar avatar-rounded bg-${card.tone}`}>
                              <Icon className="text-white fs-16" />
                            </span>
                          </div>
                          <div>
                            <span className="d-block">{card.label}</span>
                            <span className="fs-16 fw-semibold">{kpis?.[card.key] || 0}</span>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              );
            })}
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3 gap-3 flex-wrap">
            <div className="d-flex gap-2 flex-wrap">
              <Form.Control
                type="text"
                placeholder="Search articles"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-auto"
              />
              <Form.Select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} className="w-auto">
                <option value="ALL">Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Form.Select>
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small">
                {articlesUsed} of {MAX_ARTICLES_PER_CHURCH} Articles Used
              </span>
              <Tooltip title={limitReached ? `You've reached the maximum of ${MAX_ARTICLES_PER_CHURCH} articles.` : ''} arrow>
                <span>
                  <Button type="button" size="sm" onClick={handleOpenCreate} disabled={limitReached}>
                    + Add Article
                  </Button>
                </span>
              </Tooltip>
            </div>
          </div>

          <Table
            data={data}
            columns={columns}
            pageCount={totalCount}
            loading={loading}
            fetchData={handleFetch}
            hidePaginationWhenEmpty
            emptyState={{
              icon: <BsFileEarmarkText size={36} className="text-muted mb-3" />,
              title: 'No articles found',
              description: 'Add your first Christian article for your members to read.'
            }}
          />
        </div>
      </div>

      {!loading && <span className="overlay__block" />}
      {error && <ErrorDialogue showError={error} onClose={() => {}} />}
      <RenderArticleOffcanvas
        show={showDrawer}
        setShow={setShowDrawer}
        handleClose={handleClose}
        handleChange={handleChange}
        success={success}
        handleReset={handleReset}
        handleEdit={handleEdit}
        handleSave={handleSave}
        fields={fields}
        loading={detailsLoading}
      />
    </>
  );
};

export default Page;
