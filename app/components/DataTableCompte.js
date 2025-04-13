"use client";
import React, { useState } from "react";
import { 
  Search as SearchIcon, 
  ChevronLeft, 
  ChevronRight,
  FilterList,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';

const DataTable = ({
  columns,
  data,
  initialPage = 1,
  initialItemsPerPage = 10,
  searchPlaceholder = "Search...",
  sortable = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Filter data based on search query
  const filteredData = data.filter(item =>
    columns.some(column => {
      const value = column.render ? column.render(item) : item[column.accessor];
      return String(value).toLowerCase().includes(searchQuery.toLowerCase());
    })
  );

  // Sort data if sortConfig is set
  const sortedData = [...filteredData];
  if (sortConfig.key) {
    sortedData.sort((a, b) => {
      const column = columns.find(col => col.accessor === sortConfig.key);
      const aValue = column?.render ? column.render(a) : a[sortConfig.key];
      const bValue = column?.render ? column.render(b) : b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Pagination
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const requestSort = (key) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sorting
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FilterList className="ml-1 text-[#d4b9a1]" fontSize="small" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUpward className="ml-1 text-[#dfe1e2]" fontSize="small" /> 
      : <ArrowDownward className="ml-1 text-[#dfe1e2]" fontSize="small" />;
  };

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    
    if (totalPages <= maxVisibleButtons) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-3 py-1 text-sm rounded-lg border transition-all ${
              currentPage === i
                ? 'bg-[#b17a56] text-white border-[#b17a56] shadow-md'
                : 'bg-white text-[#6e4c34] border-[#d4b9a1] hover:bg-[#f0e4d8] shadow-sm'
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      // First page
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`px-3 py-1 text-sm rounded-lg border ${
            currentPage === 1
              ? 'bg-[#b17a56] text-white border-[#b17a56] shadow-md'
              : 'bg-white text-[#6e4c34] border-[#d4b9a1] hover:bg-[#f0e4d8] shadow-sm'
          }`}
        >
          1
        </button>
      );

      // Ellipsis or middle pages
      if (currentPage > 3) {
        buttons.push(<span key="left-ellipsis" className="px-1 text-[#6e4c34]">...</span>);
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-3 py-1 text-sm rounded-lg border ${
              currentPage === i
                ? 'bg-[#b17a56] text-white border-[#b17a56] shadow-md'
                : 'bg-white text-[#6e4c34] border-[#d4b9a1] hover:bg-[#f0e4d8] shadow-sm'
            }`}
          >
            {i}
          </button>
        );
      }

      if (currentPage < totalPages - 2) {
        buttons.push(<span key="right-ellipsis" className="px-1 text-[#6e4c34]">...</span>);
      }

      // Last page
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-3 py-1 text-sm rounded-lg border ${
            currentPage === totalPages
              ? 'bg-[#b17a56] text-white border-[#b17a56] shadow-md'
              : 'bg-white text-[#6e4c34] border-[#d4b9a1] hover:bg-[#f0e4d8] shadow-sm'
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="space-y-4">
      {/* Search and items per page controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-[#dfe1e2]" />
          </div>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full pl-10 pr-4 py-2 bg-white border border-[#d4b9a1] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#dfe1e2] focus:border-[#dfe1e2] transition-all duration-200"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-[#6e4c34]">Afficher:</span>
          <select
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            value={itemsPerPage}
            className="border border-[#d4b9a1] rounded-lg px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#b17a56] focus:border-[#b17a56] transition-all duration-200"
          >
            {[5, 10, 15, 20, 25].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
          <span className="text-sm text-[#6e4c34]">entrées</span>
        </div>
      </div>

      {/* Table container */}
      <div className="bg-white rounded-xl shadow-md border border-[#dfe1e2] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#b17a56] text-[#dfe1e2]">
                {columns.map((column, index) => (
                  <th 
                    key={index}
                    onClick={() => requestSort(column.accessor)}
                    className={`px-6 py-3 text-left text-sm font-medium uppercase tracking-wider ${
                      sortable ? 'cursor-pointer hover:bg-[#8c6244]' : ''
                    } transition-colors duration-150`}
                  >
                    <div className="flex items-center">
                      {column.header}
                      {sortable && getSortIcon(column.accessor)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8d5c5]">
              {currentItems.length > 0 ? (
                currentItems.map((item, rowIndex) => (
                  <tr 
                    key={rowIndex} 
                    className={`${rowIndex % 2 === 0 ? 'bg-[#f8f1ea]' : 'bg-white'} hover:bg-[#f0e4d8] transition-colors`}
                  >
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="px-6 py-4 text-[#6e4c34]">
                        {column.render ? column.render(item) : item[column.accessor]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <svg className="w-16 h-16 text-[#d4b9a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-[#6e4c34]">No data found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-[#f8f1ea] border-t border-[#d4b9a1]">
            <div className="mb-4 sm:mb-0 text-sm text-[#6e4c34]">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-[#d4b9a1] bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f0e4d8] transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-[#6e4c34]" />
              </button>
              
              {renderPaginationButtons()}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-[#d4b9a1] bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f0e4d8] transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-[#6e4c34]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;