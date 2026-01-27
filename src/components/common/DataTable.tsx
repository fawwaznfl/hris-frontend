import React, { useMemo, useState } from "react";

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
  cell?: (row: T, index: number) => React.ReactNode;
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  disableSearch?: boolean; // <-- ADD THIS
}

export function DataTable<T>({
  columns,
  data,
  searchPlaceholder = "Search...",
  disableSearch = false, // <-- DEFAULT FALSE
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const pageSize = 10;

  // FILTER (only run if search enabled)
  const filteredData = useMemo(() => {
    if (disableSearch || !search) return data;

    return data.filter((item) =>
      columns.some((col) => {
        if (!col.accessor) return false;
        return String(item[col.accessor] ?? "")
          .toLowerCase()
          .includes(search.toLowerCase());
      })
    );
  }, [search, data, columns, disableSearch]);

  // SORT
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortOrder]);

  // PAGINATION
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key?: keyof T) => {
    if (!key) return;
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="w-full mt-4">
      
      {/* Search – hide completely if disableSearch=true */}
      {!disableSearch && (
        <div className="mb-3">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              {columns.map((col, index) => (
                <th
                  key={index}
                  style={{ width: col.width }}
                  className={`p-3 text-left ${col.accessor ? "cursor-pointer" : ""}`}
                  onClick={() => handleSort(col.accessor)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {sortKey === col.accessor && (
                      <span>{sortOrder === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((item, rowIndex) => (
              <tr key={rowIndex} className="border-t hover:bg-gray-50">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="p-3">
                    {col.cell
                      ? col.cell(item, (page - 1) * pageSize + rowIndex)
                      : col.accessor
                      ? String(item[col.accessor] ?? "-")
                      : "-"}
                  </td>
                ))}
              </tr>
            ))}

            {paginatedData.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center p-4 text-gray-500"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-3 px-1">
        <p className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:text-gray-400"
          >
            Prev
          </button>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:text-gray-400"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
