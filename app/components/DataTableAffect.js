'use client';
import React, { useState } from 'react';
import { 
  Search as SearchIcon,
  ChevronLeft,
  ChevronRight,
  FilterList,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';

export default function DataTable({
  data = [],
  columns = [],
  searchable = false,
  searchPlaceholder = "Rechercher...",
  className = "",
  emptyMessage = "Aucune donnée disponible",
  sortable = false,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [yearFilter, setYearFilter] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  // Handle year filter change
  const handleYearChange = (e) => {
    setYearFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Filter data by search query and year
  const filteredData = data.filter(item => {
    // Apply search filter if searchable and query exists
    const searchMatch = !searchable || !searchQuery || 
      Object.values(item).some(val => 
        val && typeof val === 'string' && val.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    // Apply year filter if yearFilter exists and item has an 'annee' property
    const yearMatch = !yearFilter || (item.annee && item.annee.toString() === yearFilter);
    
    return searchMatch && yearMatch;
  });

  // Sorting functionality
  const sortedData = [...filteredData];
  if (sortConfig.key) {
    sortedData.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const requestSort = (key) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FilterList className="ml-1 text-[#d4b9a1]" fontSize="small" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUpward className="ml-1 text-[#dfe1e2]" fontSize="small" /> 
      : <ArrowDownward className="ml-1 text-[#dfe1e2]" fontSize="small" />;
  };

  // Extract unique years from data for filter dropdown
  const availableYears = [...new Set(data.map(item => item.annee?.toString()).filter(Boolean))];

  return (
    <div className="space-y-4">
      {/* Search and items per page controls */}
      {(searchable || availableYears.length > 0) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {searchable && (
            <div className="relative w-full sm:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-[#dfe1e2]" />
              </div>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-4 py-2 bg-white border border-[#d4b9a1] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#dfe1e2] focus:border-[#dfe1e2] transition-all duration-200"
              />
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            {availableYears.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className="flex items-center bg-white border border-[#b17a56] px-4 py-2 rounded-lg hover:bg-[#ffffff] transition shadow-md text-[#b17a56]"
                >
                  <FilterList className="mr-2 text-[#b17a56]" /> Filtrer
                </button>
                {showFilter && (
                  <div className="absolute right-0 mt-2 bg-white shadow-lg p-4 rounded-lg border border-[#b17a56] z-50 w-48">
                    <label className="block text-gray-700 mb-2">Année :</label>
                    <select
                      value={yearFilter}
                      onChange={handleYearChange}
                      className="border border-[#b17a56] p-2 rounded-lg w-full"
                    >




                      <option value="">Toutes les années</option>
                      {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
           
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
      </div>
     
      )}

      {/* Table container */}
      <div className="bg-white rounded-xl shadow-md border border-[#dfe1e2] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#b17a56] text-[#dfe1e2]">
                {columns.map((column) => (
                  <th 
                    key={column.id}
                    onClick={() => sortable && requestSort(column.id)}
                    className={`px-6 py-3 text-left text-sm font-medium uppercase tracking-wider ${
                      sortable ? 'cursor-pointer hover:bg-[#8c6244]' : ''
                    } transition-colors duration-150`}
                  >
                    <div className="flex items-center">
                      {column.header}
                      {sortable && getSortIcon(column.id)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8d5c5]">
              {currentItems.length > 0 ? (
                currentItems.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`hover:bg-[#f0e4d8] transition ${
                      rowIndex % 2 === 0 ? 'bg-[#f8f1ea]' : 'bg-white'
                    }`}
                  >
                    {columns.map((column) => (
                      <td key={`${rowIndex}-${column.id}`} className="p-4 text-[#6e4c34]">
                        {column.cell ? column.cell(row) : row[column.id]}
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
                      <p className="text-[#6e4c34]">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-[#f8f1ea] border-t border-[#d4b9a1]">
          <div className="mb-4 sm:mb-0 text-sm text-[#6e4c34]">
            Affichage {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, sortedData.length)} sur {sortedData.length} entrées
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-[#d4b9a1] bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f0e4d8] transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-[#6e4c34]" />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = index + 1;
              } else if (currentPage <= 3) {
                pageNum = index + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + index;
              } else {
                pageNum = currentPage - 2 + index;
              }
              
              return (
                <button
                  key={index}
                  onClick={() => paginate(pageNum)}
                  className={`px-3 py-1 text-sm rounded-lg border transition-all ${
                    currentPage === pageNum
                      ? 'bg-[#b17a56] text-white border-[#b17a56] shadow-md'
                      : 'bg-white text-[#6e4c34] border-[#d4b9a1] hover:bg-[#f0e4d8] shadow-sm'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="px-1 text-[#6e4c34]">...</span>
            )}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <button
                onClick={() => paginate(totalPages)}
                className={`px-3 py-1 text-sm rounded-lg border ${
                  currentPage === totalPages
                    ? 'bg-[#b17a56] text-white border-[#b17a56] shadow-md'
                    : 'bg-white text-[#6e4c34] border-[#d4b9a1] hover:bg-[#f0e4d8] shadow-sm'
                }`}
              >
                {totalPages}
              </button>
            )}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-[#d4b9a1] bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f0e4d8] transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-[#6e4c34]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}