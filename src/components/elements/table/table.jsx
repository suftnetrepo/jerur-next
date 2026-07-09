/* eslint-disable react/jsx-key */
import { useEffect } from 'react';
import { useTable, usePagination, useSortBy } from 'react-table';

function Table({ data, columns, pageCount: controlledPageCount, fetchData, emptyState = null, hidePaginationWhenEmpty = false }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, sortBy }
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0 },
      manualPagination: true,
      manualSortBy: true,
      pageCount: controlledPageCount
    },
    useSortBy,
    usePagination
  );

  useEffect(() => {
      fetchData && fetchData({ pageIndex, pageSize, sortBy, searchQuery :"" });
  }, [fetchData, pageIndex, pageSize, sortBy]);

  const hasRows = page.length > 0;

  return (
    <>
      <div className="table-responsive">
        <table {...getTableProps()} className="table table-bordered table-striped">
          <thead>
            {headerGroups.map(headerGroup => {
              const headerGroupProps = headerGroup.getHeaderGroupProps();
              return (
                <tr key={headerGroupProps.key} {...headerGroupProps}>
                  {headerGroup.headers.map(column => {
                    // Get the props without the key
                    const headerProps = column.getHeaderProps(column.getSortByToggleProps());
                    // Extract the key
                    const { key, ...restHeaderProps } = headerProps;
                    
                    return (
                      <th key={key} {...restHeaderProps}>
                        {column.render('Header')}
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? ' 🔽' // Descending
                              : ' 🔼' // Ascending
                            : ' ⬍'}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.length > 0 ? (
              page.map(row => {
                prepareRow(row);
                const rowProps = row.getRowProps();
                return (
                  <tr key={rowProps.key} {...rowProps}>
                    {row.cells.map(cell => {
                      const cellProps = cell.getCellProps();
                      return (
                        <td key={cellProps.key} {...cellProps}>
                          {cell.render('Cell')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : emptyState ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-0">
                  <div className="d-flex flex-column justify-content-center align-items-center px-3" style={{ minHeight: emptyState.minHeight || 240 }}>
                    {emptyState.icon || null}
                    <div className="fw-semibold mb-1">{emptyState.title}</div>
                    {emptyState.description ? (
                      <div className="text-muted small">{emptyState.description}</div>
                    ) : null}
                  </div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {(!hidePaginationWhenEmpty || hasRows) && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            <button className="btn btn-sm btn-secondary me-1" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
              {'<<'}
            </button>
            <button className="btn btn-sm btn-secondary me-1" onClick={previousPage} disabled={!canPreviousPage}>
              {'<'}
            </button>
            <button className="btn btn-sm btn-secondary me-1" onClick={nextPage} disabled={!canNextPage}>
              {'>'}
            </button>
            <button className="btn btn-sm btn-secondary" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
              {'>>'}
            </button>
          </div>

          <span>
            Page{' '}
            <strong>
              {pageIndex + 1} of {pageOptions.length}
            </strong>
          </span>

          <span>
            | Go to page:{' '}
            <input
              type="number"
              className="form-control d-inline-block w-auto"
              defaultValue={pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                gotoPage(page);
              }}
            />
          </span>

          <select className="form-select w-auto" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
            {[10, 20, 30, 40, 50].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}

export { Table };
