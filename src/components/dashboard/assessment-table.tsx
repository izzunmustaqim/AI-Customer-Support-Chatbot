'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from '@tanstack/react-table';
import { StatusSelect } from './status-select';
import { GenerateReportBtn } from './generate-btn';

/* ── Types ── */
export interface AssessmentResult {
  id: string;
  user_name: string | null;
  user_designation: string | null;
  report_email: string | null;
  phone: string | null;
  total_score: number;
  readiness_band: string;
  q1_score: number;
  q2_score: number;
  q3_score: number;
  q4_score: number;
  q5_score: number;
  q6_score: number;
  q7_score: number;
  q8_score: number;
  q9_score: number;
  q10_score: number;
  wants_detailed_report: boolean | null;
  report_status: string | null;
  terminated_at_q2: boolean;
  completed_at: string;
}

/* ── Helpers ── */
const BAND_COLORS: Record<string, string> = {
  High: '#4CAF50',
  Moderate: '#FF9800',
  Low: '#f44336',
  Critical: '#9C27B0',
};

function qScoreClass(score: number): string {
  if (score >= 7) return 'q-score q-high';
  if (score >= 4) return 'q-score q-mid';
  return 'q-score q-low';
}

/* ── Column Definitions ── */
const col = createColumnHelper<AssessmentResult>();

const Q_LABELS = [
  'Facility Type',
  'EECA Awareness',
  'Energy Manager',
  'Energy Audit',
  'Efficiency Plan',
  'Monitoring',
  'Staff Training',
  'Equipment',
  'Renewable Energy',
  'Management',
];

const Q_KEYS: (keyof AssessmentResult)[] = [
  'q1_score', 'q2_score', 'q3_score', 'q4_score', 'q5_score',
  'q6_score', 'q7_score', 'q8_score', 'q9_score', 'q10_score',
];

function buildColumns() {
  const qColumns = Q_KEYS.map((key, i) =>
    col.accessor(key, {
      id: `q${i + 1}`,
      header: `Q${i + 1}`,
      meta: { tooltip: Q_LABELS[i] },
      cell: (info) => {
        const val = info.getValue() as number;
        return <span className={qScoreClass(val)}>{val}</span>;
      },
      enableGlobalFilter: false,
    }),
  );

  return [
    col.accessor('user_name', {
      header: 'Name',
      cell: (info) => info.getValue() || '—',
    }),
    col.accessor('user_designation', {
      header: 'Designation',
      cell: (info) => info.getValue() || '—',
    }),
    col.accessor('report_email', {
      header: 'Email',
      cell: (info) => (
        <span className="email-cell">{info.getValue() || '—'}</span>
      ),
    }),
    col.accessor('phone', {
      header: 'Phone',
      cell: (info) => info.getValue() || '—',
    }),
    col.accessor('total_score', {
      header: 'Score',
      cell: (info) => (
        <>
          <span className="score-value">{info.getValue()}</span>
          <span className="score-max">/100</span>
        </>
      ),
    }),
    col.accessor('readiness_band', {
      header: 'Band',
      cell: (info) => {
        const band = info.getValue();
        return (
          <span
            className="band-badge"
            style={{ backgroundColor: BAND_COLORS[band] || '#999' }}
          >
            {band}
          </span>
        );
      },
      filterFn: 'equals',
    }),
    ...qColumns,
    col.display({
      id: 'report_status',
      header: 'Report Status',
      cell: ({ row }) => (
        <StatusSelect
          assessmentId={row.original.id}
          currentStatus={row.original.report_status}
          wantsReport={row.original.wants_detailed_report}
        />
      ),
      enableSorting: false,
    }),
    col.accessor('completed_at', {
      header: 'Date',
      cell: (info) =>
        new Date(info.getValue()).toLocaleDateString('en-MY', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
    }),
    col.display({
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => (
        <GenerateReportBtn
          assessmentId={row.original.id}
          reportEmail={row.original.report_email}
          reportStatus={row.original.report_status}
          wantsReport={row.original.wants_detailed_report}
        />
      ),
      enableSorting: false,
    }),
  ];
}

/* ── Component ── */
interface AssessmentTableProps {
  data: AssessmentResult[];
}

export function AssessmentTable({ data }: AssessmentTableProps) {
  const columns = useMemo(() => buildColumns(), []);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    q1: false, q2: false, q3: false, q4: false, q5: false,
    q6: false, q7: false, q8: false, q9: false, q10: false,
  });
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const toggleAllQScores = (visible: boolean) => {
    const updates: VisibilityState = {};
    for (let i = 1; i <= 10; i++) updates[`q${i}`] = visible;
    setColumnVisibility((prev) => ({ ...prev, ...updates }));
  };

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="table-toolbar">
        <div className="table-toolbar-left">
          <input
            type="text"
            className="input table-search"
            placeholder="Search by name, email…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
          <select
            className="input table-band-filter"
            value={(columnFilters.find((f) => f.id === 'readiness_band')?.value as string) || ''}
            onChange={(e) => {
              const val = e.target.value;
              setColumnFilters(val ? [{ id: 'readiness_band', value: val }] : []);
            }}
          >
            <option value="">All Bands</option>
            <option value="High">High</option>
            <option value="Moderate">Moderate</option>
            <option value="Low">Low</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div className="table-toolbar-right">
          <div className="column-picker-wrapper">
            <button
              className="btn btn-ghost column-picker-btn"
              onClick={() => setShowColumnPicker(!showColumnPicker)}
            >
              ⚙️ Columns
            </button>
            {showColumnPicker && (
              <div className="column-picker-dropdown">
                <div className="column-picker-group">
                  <button
                    className="column-picker-toggle"
                    onClick={() => toggleAllQScores(true)}
                  >
                    Show all Q scores
                  </button>
                  <button
                    className="column-picker-toggle"
                    onClick={() => toggleAllQScores(false)}
                  >
                    Hide all Q scores
                  </button>
                </div>
                <div className="column-picker-divider" />
                {table.getAllLeafColumns().map((column) => {
                  if (column.id === 'actions' || column.id === 'report_status') return null;
                  return (
                    <label key={column.id} className="column-picker-item">
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={column.getToggleVisibilityHandler()}
                      />
                      {typeof column.columnDef.header === 'string'
                        ? column.columnDef.header
                        : column.id}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="table-wrapper">
        <table className="data-table assessment-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                    className={header.column.getCanSort() ? 'sortable-header' : ''}
                    title={
                      (header.column.columnDef.meta as { tooltip?: string })?.tooltip ||
                      undefined
                    }
                  >
                    <span className="th-content">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && <span className="sort-icon">↑</span>}
                      {header.column.getIsSorted() === 'desc' && <span className="sort-icon">↓</span>}
                      {header.column.getCanSort() && !header.column.getIsSorted() && (
                        <span className="sort-icon sort-icon-idle">↕</span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={table.getVisibleLeafColumns().length} className="table-empty-row">
                  No results match your filters
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="table-pagination">
        <div className="pagination-info">
          Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} results
        </div>
        <div className="pagination-controls">
          <select
            className="input pagination-size"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
          <button
            className="btn btn-ghost pagination-btn"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ← Prev
          </button>
          <span className="pagination-page">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <button
            className="btn btn-ghost pagination-btn"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next →
          </button>
        </div>
      </div>
    </>
  );
}
