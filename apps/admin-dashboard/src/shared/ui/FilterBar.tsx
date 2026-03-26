'use client';

import { useEffect, useState } from 'react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  statusOptions?: FilterOption[];
  statusValue?: string;
  onStatusChange?: (value: string | undefined) => void;
}

export function FilterBar({
  searchPlaceholder = '검색...',
  searchValue = '',
  onSearchChange,
  statusOptions,
  statusValue,
  onStatusChange,
}: FilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);

  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange?.(localSearch);
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '16px',
        alignItems: 'center',
      }}
    >
      {onSearchChange && (
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
          <label htmlFor="filter-search" className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>검색</label>
          <input
            id="filter-search"
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={searchPlaceholder}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem',
              width: '240px',
            }}
          />
          <button
            type="submit"
            aria-label="검색"
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            검색
          </button>
        </form>
      )}

      {statusOptions && onStatusChange && (
        <select
          aria-label="상태 필터"
          value={statusValue ?? ''}
          onChange={(e) => onStatusChange(e.target.value || undefined)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.875rem',
          }}
        >
          <option value="">전체 상태</option>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
